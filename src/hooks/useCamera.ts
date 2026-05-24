'use client';

import { useRef, useState, useCallback } from 'react';

type CameraState = 'idle' | 'requesting' | 'streaming' | 'error';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  state: CameraState;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: (cropPercent?: { x: number; y: number; width: number; height: number }) => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setState('requesting');
    setErrorMessage(null);

    // Try multiple constraint configs in order — most compatible first
    const constraintOptions: MediaStreamConstraints[] = [
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    let stream: MediaStream | null = null;

    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // success — stop trying
      } catch {
        // try next option
        continue;
      }
    }

    if (!stream) {
      setErrorMessage('Could not access camera. Please check browser permissions and try again.');
      setState('error');
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current;

    if (!video) {
      setErrorMessage('Video element not found.');
      setState('error');
      stream.getTracks().forEach(t => t.stop());
      return;
    }

    video.srcObject = stream;

    try {
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Video load error'));
        setTimeout(() => reject(new Error('Video metadata timeout')), 8000);
      });

      await video.play();
      setState('streaming');
    } catch (err) {
      console.error('Video play error:', err);
      setErrorMessage('Camera opened but could not display video. Try refreshing the page.');
      setState('error');
      stream.getTracks().forEach(t => t.stop());
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState('idle');
    setErrorMessage(null);
  }, []);

  const captureImage = useCallback((cropPercent?: { x: number; y: number; width: number; height: number }): string | null => {
    const video = videoRef.current;
    if (!video || state !== 'streaming') return null;

    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 720;

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (cropPercent) {
      const container = video.getBoundingClientRect();
      const containerAspect = container.width / container.height;
      const sourceAspect = sourceWidth / sourceHeight;

      let renderedWidth = container.width;
      let renderedHeight = container.height;
      let offsetX = 0;
      let offsetY = 0;

      if (sourceAspect > containerAspect) {
        renderedHeight = container.height;
        renderedWidth = renderedHeight * sourceAspect;
        offsetX = (renderedWidth - container.width) / 2;
      } else {
        renderedWidth = container.width;
        renderedHeight = renderedWidth / sourceAspect;
        offsetY = (renderedHeight - container.height) / 2;
      }

      const pxX = (cropPercent.x / 100) * container.width;
      const pxY = (cropPercent.y / 100) * container.height;
      const pxW = (cropPercent.width / 100) * container.width;
      const pxH = (cropPercent.height / 100) * container.height;

      sx = ((pxX + offsetX) / renderedWidth) * sourceWidth;
      sy = ((pxY + offsetY) / renderedHeight) * sourceHeight;
      sw = (pxW / renderedWidth) * sourceWidth;
      sh = (pxH / renderedHeight) * sourceHeight;

      sx = Math.max(0, Math.min(sourceWidth - 1, sx));
      sy = Math.max(0, Math.min(sourceHeight - 1, sy));
      sw = Math.max(1, Math.min(sourceWidth - sx, sw));
      sh = Math.max(1, Math.min(sourceHeight - sy, sh));
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(sw);
    canvas.height = Math.floor(sh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [state]);

  return { videoRef, state, errorMessage, startCamera, stopCamera, captureImage };
}
