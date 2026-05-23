'use client';

import { useRef, useState, useCallback } from 'react';

type CameraState = 'idle' | 'requesting' | 'streaming' | 'error';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  state: CameraState;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
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

  const captureImage = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || state !== 'streaming') return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  }, [state]);

  return { videoRef, state, errorMessage, startCamera, stopCamera, captureImage };
}
