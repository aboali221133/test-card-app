
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Layers, Trash, PlusCircle, CameraOff } from 'lucide-react';

interface CameraScannerProps {
  onScan: (base64Images: string[]) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
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

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImages(prev => [...prev, dataUrl]);
      }
    }
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

  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={handleClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
          <X size={32} />
        </button>
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
            <CameraOff size={80} className="mx-auto mb-6 opacity-20" />
            <p className="text-xl font-bold">{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
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
          
          <button onClick={capture} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-[6px] border-indigo-600/20">
            <div className="w-16 h-16 bg-white border-4 border-gray-100 rounded-full" />
          </button>

          <button onClick={() => {}} className="p-5 bg-white/10 text-white rounded-3xl opacity-20">
            <RefreshCw size={28} />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto w-full max-w-md p-2">
          {capturedImages.map((img, i) => (
            <div key={i} className="w-16 h-20 rounded-xl overflow-hidden border-2 border-white/50 shrink-0 shadow-xl relative">
              <img src={img} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center text-white text-xs font-black">{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraScanner;
