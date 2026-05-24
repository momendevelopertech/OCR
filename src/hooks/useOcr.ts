'use client';

import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';

interface OcrResult {
  nationalId: string | null;
  confidence: number;
  rawText: string;
}

interface UseOcrReturn {
  isProcessing: boolean;
  progress: number;
  result: OcrResult | null;
  error: string | null;
  processImage: (imageDataUrl: string) => Promise<OcrResult | null>;
  reset: () => void;
}

function cropIdRegion(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cropX = img.width * 0.45;
      const cropY = img.height * 0.72;
      const cropW = img.width * 0.55;
      const cropH = img.height * 0.28;

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageDataUrl;
  });
}

function extractEgyptianId(text: string): string | null {
  const cleaned = text
    .replace(/\s/g, '')
    .replace(/[oO]/g, '0')
    .replace(/[lI]/g, '1')
    .replace(/[^0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const match = cleaned.replace(/\s/g, '').match(/[23]\d{13}/);
  return match ? match[0] : null;
}

export function useOcr(): UseOcrReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageDataUrl: string): Promise<OcrResult | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const croppedImage = await cropIdRegion(imageDataUrl);

      const { data } = await Tesseract.recognize(croppedImage, 'ara+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      let nationalId = extractEgyptianId(data.text);
      let confidence = Math.round(data.confidence);
      let rawText = data.text;

      // Fallback: if crop missed the number, retry on full image.
      if (!nationalId) {
        const fallback = await Tesseract.recognize(imageDataUrl, 'ara+eng');
        nationalId = extractEgyptianId(fallback.data.text);
        if (nationalId) {
          confidence = Math.round(fallback.data.confidence);
          rawText = fallback.data.text;
        }
      }

      const ocrResult: OcrResult = {
        nationalId,
        confidence,
        rawText,
      };

      setResult(ocrResult);
      setProgress(100);
      return ocrResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OCR processing failed';
      setError(msg);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
  }, []);

  return { isProcessing, progress, result, error, processImage, reset };
}
