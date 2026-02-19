
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const getAIInstance = (customKey?: string) => {
  const key = customKey || process.env.API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

export const hasValidKey = (customKey?: string) => {
  return !!(customKey || process.env.API_KEY);
};

/**
 * اختبار مفتاح API
 */
export const testApiKey = async (key: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "hi",
      config: { maxOutputTokens: 5 }
    });
    return true;
  } catch (e) {
    console.error("API Key Test Failed", e);
    return false;
  }
};

export const extractTextFromImages = async (base64Images: string[], customKey?: string): Promise<string> => {
  const ai = getAIInstance(customKey);
  if (!ai) throw new Error("No API Key");

  const parts = base64Images.map(img => ({
    inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] || img }
  }));

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: "Extract text from these images accurately. Merge into a logical text, remove overlapping lines between pages, and maintain structure. Detect language automatically." }
      ]
    },
  });
  return response.text || "";
};

export const getAIAnswer = async (keyword: string, customKey?: string): Promise<string> => {
  const ai = getAIInstance(customKey);
  if (!ai) throw new Error("No API Key");

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain this concept academically: ${keyword}. Answer concisely in the same language.`,
    config: {
      systemInstruction: "You are an expert tutor providing precise educational explanations."
    }
  });
  return response.text || "";
};

export const generateQuizOptions = async (question: string, correctAnswer: string, customKey?: string): Promise<string[]> => {
  const ai = getAIInstance(customKey);
  if (!ai) return [];

  try {
    // تم التغيير إلى flash لتجنب مشاكل Quota exceeded
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Question: "${question}"\nCorrect Answer: "${correctAnswer}"\nGenerate 3 believable but incorrect options.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wrongOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["wrongOptions"]
        }
      }
    });
    const result = JSON.parse(response.text || '{"wrongOptions":[]}');
    return result.wrongOptions || [];
  } catch (e) {
    // في حالة الفشل، نرجع مصفوفة فارغة ليتم التعامل معها محلياً
    return [];
  }
};

export const gradeWrittenAnswer = async (question: string, reference: string, userAns: string, customKey?: string) => {
  const ai = getAIInstance(customKey);
  if (!ai) return { isCorrect: false, feedback: "AI Offline" };

  try {
    // تم التغيير إلى flash للسرعة وتوفير الحصة
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Q: "${question}"\nRef: "${reference}"\nUser: "${userAns}"\nIs it correct?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });
    return JSON.parse(response.text || '{"isCorrect":false, "feedback":""}');
  } catch (e) {
    return { isCorrect: false, feedback: "AI failure." };
  }
};

export const assignDifficultyPoints = async (questions: string[], customKey?: string): Promise<number[]> => {
  const ai = getAIInstance(customKey);
  if (!ai) return questions.map(() => 5);
  try {
    // تم التغيير إلى flash
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rate difficulty (1-10): ${JSON.stringify(questions)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.INTEGER } }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch {
    return questions.map(() => 5);
  }
};
