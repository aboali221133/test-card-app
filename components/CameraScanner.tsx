
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Layers, Trash, Zap, ZapOff, Scissors, RotateCcw } from 'lucide-react';

interface CameraScannerProps {
  onScan: (base64Images: string[]) => void;
  onClose: () => void;
}

// مكون فرعي للقص
const ImageCropper: React.FC<{ 
  imageSrc: string; 
  onConfirm: (croppedImage: string) => void; 
  onCancel: () => void; 
}> = ({ imageSrc, onConfirm, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const getPoint = (e: React.MouseEvent | React.TouchEvent | any) => {
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e: any) => {
    e.preventDefault(); // لمنع التمرير على الموبايل
    const { x, y } = getPoint(e);
    setStartPos({ x, y });
    setSelection({ x, y, w: 0, h: 0 });
    setIsDragging(true);
  };

  const handleMove = (e: any) => {
    if (!isDragging) return;
    e.preventDefault();
    const { x, y } = getPoint(e);
    
    // حساب المربع بناءً على نقطة البداية والنقطة الحالية
    const newX = Math.min(x, startPos.x);
    const newY = Math.min(y, startPos.y);
    const newW = Math.abs(x - startPos.x);
    const newH = Math.abs(y - startPos.y);

    // حدود الحاوية
    const rect = containerRef.current?.getBoundingClientRect();
    if(rect) {
       setSelection({
         x: Math.max(0, newX),
         y: Math.max(0, newY),
         w: Math.min(newW, rect.width - newX),
         h: Math.min(newH, rect.height - newY)
       });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const performCrop = () => {
    if (!imgRef.current || !selection || selection.w < 10 || selection.h < 10) {
      // إذا لم يتم التحديد أو التحديد صغير جداً، نرجع الصورة الأصلية
      onConfirm(imageSrc);
      return;
    }

    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    
    // حساب نسبة التكبير بين الصورة المعروضة والصورة الأصلية
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = selection.w * scaleX;
    canvas.height = selection.h * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        img,
        selection.x * scaleX, selection.y * scaleY, selection.w * scaleX, selection.h * scaleY, // المصدر
        0, 0, canvas.width, canvas.height // الوجهة
      );
      onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[1100] flex flex-col items-center justify-center">
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} className="p-3 text-white bg-white/10 rounded-full hover:bg-white/20"><X size={24} /></button>
        <span className="text-white font-bold text-lg drop-shadow-md">حدد النص المطلوب</span>
        <button onClick={performCrop} className="p-3 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 font-bold flex items-center gap-2 px-6">
          <Check size={24} />
          <span>تم</span>
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative max-w-full max-h-[80vh] overflow-hidden select-none touch-none"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <img 
          ref={imgRef} 
          src={imageSrc} 
          alt="Crop target" 
          className="max-w-full max-h-[80vh] object-contain pointer-events-none select-none"
          draggable={false}
        />
        
        {/* التظليل الخارجي */}
        {selection && (
           <>
             <div className="absolute inset-0 bg-black/50 pointer-events-none" 
                  style={{
                    clipPath: `polygon(0% 0%, 0% 100%, ${selection.x}px 100%, ${selection.x}px ${selection.y}px, ${selection.x + selection.w}px ${selection.y}px, ${selection.x + selection.w}px ${selection.y + selection.h}px, ${selection.x}px ${selection.y + selection.h}px, ${selection.x}px 100%, 100% 100%, 100% 0%)`
                  }} 
             />
             {/* مربع التحديد */}
             <div 
               className="absolute border-2 border-indigo-400 bg-indigo-500/10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
               style={{
                 left: selection.x,
                 top: selection.y,
                 width: selection.w,
                 height: selection.h
               }}
             >
               {/* مقابض الزوايا للزينة فقط */}
               <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
               <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
               <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
               <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>
             </div>
           </>
        )}
        
        {!selection && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 text-white px-4 py-2 rounded-xl backdrop-blur-md text-sm border border-white/20">
              اسحب بإصبعك لرسم مربع حول النص
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // حالة الفلاش
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // حالة القص
  const [tempImage, setTempImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      
      // التحقق من دعم الفلاش
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any; // Cast to any because TS might miss standard capabilities
      if (capabilities.torch) {
        setHasTorch(true);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("تعذر فتح الكاميرا. يرجى التأكد من منح الأذونات.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }
  };

  const toggleTorch = async () => {
    if (!stream || !hasTorch) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any]
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.error("Torch error", e);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // بدلاً من الحفظ المباشر، نذهب للقص
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setTempImage(dataUrl);
      }
    }
  };

  const handleCropConfirm = (croppedImg: string) => {
    setCapturedImages(prev => [...prev, croppedImg]);
    setTempImage(null);
  };

  const handleFinish = () => {
    if (capturedImages.length > 0) {
      onScan(capturedImages);
      stopCamera();
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // إذا كنا في وضع القص، نعرض مكون القص
  if (tempImage) {
    return (
      <ImageCropper 
        imageSrc={tempImage} 
        onConfirm={handleCropConfirm} 
        onCancel={() => setTempImage(null)} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={handleClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
          <X size={32} />
        </button>
        
        {/* Flash Button */}
        {hasTorch && (
          <button 
            onClick={toggleTorch} 
            className={`p-3 rounded-2xl transition-all ${torchOn ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white/10 text-white'}`}
          >
            {torchOn ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
          </button>
        )}

        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/20 text-white font-black">
          <Layers size={20} />
          <span>{capturedImages.length}</span>
        </div>
        
        <button onClick={handleFinish} disabled={capturedImages.length === 0} className={`p-3 rounded-2xl transition-all ${capturedImages.length > 0 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500'}`}>
          <Check size={32} />
        </button>
      </div>

      {/* Video Viewport */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-center text-white p-12">
            <RotateCcw size={80} className="mx-auto mb-6 opacity-20" />
            <p className="text-xl font-bold">{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 border-[30px] border-black/30 pointer-events-none">
          <div className="w-full h-full border-2 border-white/40 rounded-[2rem] relative">
             <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
             <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
             <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
             <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-10 bg-black flex flex-col items-center gap-8">
        <div className="flex items-center gap-12">
          <button onClick={() => setCapturedImages([])} className="p-5 bg-white/10 text-white rounded-3xl hover:bg-red-500 transition-all">
            <Trash size={28} />
          </button>
          
          <button onClick={capture} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-[6px] border-indigo-600/20 group">
            <div className="w-16 h-16 bg-white border-4 border-gray-100 rounded-full group-hover:scale-90 transition-all flex items-center justify-center text-indigo-600">
              <Camera size={28} />
            </div>
          </button>

          <div className="w-[68px]"></div> {/* Spacer to balance layout */}
        </div>

        {/* Gallery Preview */}
        {capturedImages.length > 0 && (
          <div className="flex gap-4 overflow-x-auto w-full max-w-md p-2">
            {capturedImages.map((img, i) => (
              <div key={i} className="w-16 h-20 rounded-xl overflow-hidden border-2 border-white/50 shrink-0 shadow-xl relative group">
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-black">{i + 1}</div>
                <button 
                  onClick={() => setCapturedImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraScanner;
