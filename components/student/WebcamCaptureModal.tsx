'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Check, RefreshCw, ShieldAlert, X, Loader2 } from 'lucide-react';

interface WebcamCaptureModalProps {
  examTitle: string;
  onCaptureComplete: (photoBase64: string) => void;
  onCancel: () => void;
}

export default function WebcamCaptureModal({ examTitle, onCaptureComplete, onCancel }: WebcamCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Webcam access is required for identity verification during exams. Please enable camera permissions in your browser.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(photoData);
      stopCamera();
    }
  };

  const retakeSnapshot = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCaptureComplete(capturedPhoto);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-white">
        
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Webcam Photo Verification</h3>
            <p className="text-xs text-gray-400">
              Exam: <span className="font-semibold text-purple-300">{examTitle}</span>
            </p>
          </div>
        </div>

        {cameraError ? (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 text-xs text-red-300 space-y-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <p>{cameraError}</p>
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs transition"
            >
              Retry Camera Permission
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera View / Captured Image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 aspect-video flex items-center justify-center">
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Initializing camera...</span>
                </div>
              )}

              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Exam Student Photo" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`}
                />
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              ℹ️ Your photo is captured at the start of the exam to verify student identity. It will be recorded alongside your score on the gradeboard.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={retakeSnapshot}
                    className="px-4 py-2.5 text-xs font-semibold border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
                  >
                    <Check className="w-4 h-4" /> Confirm & Start Exam
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isLoading}
                  className="w-full py-3 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  <Camera className="w-4 h-4" /> Capture Photo & Proceed
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
