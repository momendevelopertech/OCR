'use client';

import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { videoRef, state, errorMessage, startCamera, stopCamera, captureImage } = useCamera();

  const handleCapture = () => {
    const image = captureImage();
    if (image) {
      stopCamera();
      onCapture(image);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Video Preview */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Overlay when not streaming */}
        {state !== 'streaming' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80">
            {state === 'requesting' && (
              <>
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <p className="text-white text-sm">Accessing camera...</p>
              </>
            )}
            {state === 'idle' && (
              <p className="text-gray-400 text-sm">Camera is off</p>
            )}
            {state === 'error' && (
              <>
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-red-400 text-sm text-center px-4">
                  {errorMessage ?? 'Camera error'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        {state === 'idle' || state === 'error' ? (
          <Button onClick={startCamera} className="flex-1 gap-2">
            <Camera className="w-4 h-4" />
            Open Camera
          </Button>
        ) : state === 'requesting' ? (
          <Button disabled className="flex-1 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Requesting access...
          </Button>
        ) : (
          <>
            <Button onClick={handleCapture} className="flex-1 gap-2">
              <Camera className="w-4 h-4" />
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera} className="gap-2">
              <X className="w-4 h-4" />
              Close
            </Button>
          </>
        )}
      </div>

      {/* Error Help Text */}
      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <p className="font-medium mb-1">Camera access failed</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Make sure you&apos;re on HTTPS (not HTTP)</li>
            <li>Go to browser settings and allow camera for this site</li>
            <li>Close other apps that might be using the camera</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      )}

    </div>
  );
}
