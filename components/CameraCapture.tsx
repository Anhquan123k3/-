import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Aperture, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

type InputMode = 'camera' | 'upload';

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<InputMode>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Camera Logic ---
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera permission denied. Please allow camera access in your browser settings or use the 'Upload' tab.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera device found on this device.");
      } else {
        setError("Unable to access camera. Check permissions or try the 'Upload' tab.");
      }
      console.error(err);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(imageData);
        stopCamera(); // Stop camera stream after capture to save battery
      }
    }
  }, [stopCamera]);

  // --- File Logic (Upload / Drag & Drop / Paste) ---
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
      setError(null);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Drag & Drop Handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  // Paste Handler
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only handle paste if we are in upload mode and not currently processing/previewing
      if (mode !== 'upload' || isProcessing || previewImage) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [mode, isProcessing, previewImage, processFile]);

  // --- Shared Logic ---
  const confirmCapture = () => {
    if (previewImage) {
      onCapture(previewImage);
      // We keep the preview image until the parent component tells us (or user clears)
      // but usually, we might want to clear it after success. 
      // For now, we wait for user to hit "Retake" or "Clear" via parent logic if needed.
    }
  };

  const retake = () => {
    setPreviewImage(null);
    if (mode === 'camera') {
      startCamera();
    } else {
      // For upload, just clearing preview is enough, user can click upload again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Tab Switching
  const switchMode = (newMode: InputMode) => {
    setMode(newMode);
    setError(null);
    setPreviewImage(null);
    setIsDragging(false);
    if (newMode === 'upload') {
      stopCamera();
    } else {
      // Don't auto start camera, let user click "Start" to avoid permission loop issues
    }
  };

  useEffect(() => {
    // Clean up on unmount
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {mode === 'camera' ? <Camera className="w-5 h-5 text-indigo-600" /> : <Upload className="w-5 h-5 text-indigo-600" />}
            Input Source
          </h2>
          {/* Mode Switcher */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => switchMode('camera')}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'camera' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Camera
            </button>
            <button
              onClick={() => switchMode('upload')}
              disabled={isProcessing}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                mode === 'upload' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Upload
            </button>
          </div>
        </div>
        {error && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative flex-grow bg-gray-900 flex items-center justify-center overflow-hidden min-h-[300px] flex-col">
        {/* State: Has Preview Image (Analyzable) */}
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Survey Input" 
            className="w-full h-full object-contain" 
          />
        ) : (
          /* State: No Preview Image */
          <>
            {mode === 'camera' ? (
              <div className="w-full h-full relative flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                />
                
                {!isCameraActive && (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 mb-4 text-sm">Camera is inactive</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm transition-colors"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Upload Mode Placeholder with Drag & Drop */
              <div 
                onClick={triggerFileInput}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all p-6 border-2 border-dashed m-4 rounded-xl ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-gray-700 hover:bg-gray-800'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" // Allows mobile to pick camera or gallery
                  onChange={handleFileUpload}
                />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isDragging ? 'bg-indigo-600' : 'bg-gray-800'
                }`}>
                  <ImageIcon className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className={`font-medium transition-colors ${isDragging ? 'text-indigo-400' : 'text-gray-300'}`}>
                  {isDragging ? 'Drop image here' : 'Click, Drag or Paste Image'}
                </p>
                <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
                  Upload via file, drag & drop, or Ctrl+V
                </p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center gap-4">
        {!previewImage ? (
          mode === 'camera' ? (
            <button
              onClick={captureImage}
              disabled={!isCameraActive || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Aperture className="w-5 h-5" />
              Capture
            </button>
          ) : (
            <button
              onClick={triggerFileInput}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Select Image
            </button>
          )
        ) : (
          <>
            <button
              onClick={retake}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {mode === 'camera' ? 'Retake' : 'Choose Different'}
            </button>
            <button
              onClick={confirmCapture}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg disabled:opacity-70"
            >
              {isProcessing ? 'Processing...' : 'Analyze Survey'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};