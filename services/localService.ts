
import { Flashcard } from '../types';

// ملاحظة: تمت إزالة استيراد createWorker من الأعلى لمنع توقف التطبيق إذا فشل تحميل المكتبة

/**
 * معالجة الصورة لتحسين دقة القراءة
 * تحويل للرمادي وزيادة التباين
 */
const preprocessImage = async (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64Image);

      // تحديد حجم مناسب للسرعة والدقة
      const MAX_WIDTH = 1500;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // رسم الصورة
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // معالجة البيكسلز
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        // تحويل للرمادي (Grayscale)
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // زيادة التباين (Contrast) - عتبة ثنائية (Binarization) بسيطة
        // هذا يجعل النص الأسود أغمق والخلفية أفتح
        const contrast = avg > 128 ? 255 : 0; 

        data[i] = contrast;     // Red
        data[i + 1] = contrast; // Green
        data[i + 2] = contrast; // Blue
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(base64Image);
  });
};

/**
 * استخراج النصوص محلياً باستخدام Tesseract.js مع تحسينات الصور
 * يستخدم Dynamic Import لضمان عدم توقف التطبيق إذا فشل تحميل المكتبة
 */
export const localExtractText = async (base64Images: string[]): Promise<string> => {
  let combinedText = "";
  
  // الاستيراد الديناميكي هنا
  // هذا يمنع "موت" الزر إذا كان الإنترنت بطيئاً أو فشل تحميل Tesseract
  const { createWorker } = await import('tesseract.js');
  
  const worker = await createWorker(['ara', 'eng']);

  // ضبط إعدادات لتحسين التعرف على اللغة العربية
  await worker.setParameters({
    tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
  });

  for (let i = 0; i < base64Images.length; i++) {
    // معالجة الصورة قبل إرسالها للمسح
    const processedImage = await preprocessImage(base64Images[i]);
    
    const { data: { text } } = await worker.recognize(processedImage);
    
    // تنظيف النص الأولي
    const cleanText = text
      .replace(/([^\S\r\n]+)/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
      .replace(/\|/g, '') // إزالة رموز شائعة تظهر خطأ في العربية
      .trim();

    // خوارزمية دمج متقدمة لمنع التكرار
    if (combinedText) {
      const existingLines = combinedText.split('\n').filter(l => l.trim().length > 3);
      const newLines = cleanText.split('\n');
      
      const filteredNewLines = newLines.filter(line => {
        const trimmed = line.trim();
        if (trimmed.length < 3) return false;
        
        // فحص التشابه مع آخر 15 سطر
        const isDuplicate = existingLines.slice(-15).some(oldLine => {
          const sim = calculateSimilarity(oldLine.trim(), trimmed);
          return sim > 0.65; 
        });
        return !isDuplicate;
      });
      
      combinedText += "\n" + filteredNewLines.join('\n');
    } else {
      combinedText = cleanText;
    }
  }

  await worker.terminate();
  return combinedText.trim();
};

/**
 * حساب نسبة التشابه
 */
function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length < 3 || s2.length < 3) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * توليد خيارات خاطئة ذكية محلياً
 * هذه الدالة pure javascript ولا تعتمد على مكتبات خارجية ولن تفشل
 */
export const generateLocalDistractors = (correctAnswer: string, allCards: Flashcard[]): string[] => {
  const targetLength = correctAnswer.length;
  
  // تصفية الإجابات الأخرى، واستبعاد الإجابة الصحيحة والإجابات القصيرة جداً
  const candidates = allCards
    .map(c => c.answer)
    .filter(a => a !== correctAnswer && a.length > 2);
    
  // ترتيب المرشحين حسب قرب طول النص من الإجابة الصحيحة
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.length - targetLength);
    const diffB = Math.abs(b.length - targetLength);
    return diffA - diffB;
  });

  // أخذ أفضل المرشحين ثم خلطهم لإضافة العشوائية
  const topCandidates = candidates.slice(0, 10).sort(() => 0.5 - Math.random());
  
  const selected = topCandidates.slice(0, 3);
  
  // تعبئة الخيارات الناقصة إذا لم يكن هناك بطاقات كافية
  while (selected.length < 3) {
    const fallback = [
      "إجابة غير صحيحة بناءً على السياق.",
      "المعلومات غير متوفرة في النص.",
      "عكس ما تم ذكره في السؤال.",
      "لا شيء مما سبق."
    ];
    selected.push(fallback[selected.length % fallback.length]);
  }
  
  return selected;
};

export const localGradeAnswer = (reference: string, userAns: string) => {
  const normalize = (s: string) => s.toLowerCase().replace(/[^\w\u0621-\u064A\s]/gi, '').trim();
  const r = normalize(reference);
  const u = normalize(userAns);
  
  // فحص الاحتواء أو التشابه النصي
  const isCorrect = r.includes(u) || u.includes(r) || calculateSimilarity(r, u) > 0.4;
  
  return {
    isCorrect,
    feedback: isCorrect ? "إجابة صحيحة! (تقييم محلي)" : `الإجابة المتوقعة كانت تدور حول: ${reference.substring(0, 50)}...`
  };
};
