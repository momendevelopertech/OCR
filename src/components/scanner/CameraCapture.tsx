'use client';

import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onCapture: (blob: Blob) => void;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  hasCaptured: boolean;
}

export default function CameraCapture({
  videoRef,
  onCapture,
  isStreaming,
  isLoading,
  error,
  onStartCamera,
  onStopCamera,
  hasCaptured,
}: CameraCaptureProps) {
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/jpeg', 0.92);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/50">
        <CameraOff className="h-12 w-12 text-red-400" />
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={onStartCamera} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!isStreaming) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
        <Camera className="h-12 w-12 text-neutral-400" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Position the National ID within the frame and capture
        </p>
        <Button onClick={onStartCamera} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accessing Camera...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={handleCapture} disabled={hasCaptured}>
          <Camera className="mr-2 h-4 w-4" />
          {hasCaptured ? 'Captured' : 'Capture'}
        </Button>
        <Button onClick={onStopCamera} variant="outline">
          <CameraOff className="mr-2 h-4 w-4" />
          Close Camera
        </Button>
      </div>
    </div>
  );
}
