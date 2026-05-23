'use client';

import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { extractEgyptianId } from '@/lib/ocr';

interface UseOcrReturn {
  progress: number;
  extractedId: string | null;
  confidence: number;
  isProcessing: boolean;
  error: string | null;
  processImage: (imageBlob: Blob) => Promise<string | null>;
  reset: () => void;
}

export function useOcr(): UseOcrReturn {
  const [progress, setProgress] = useState(0);
  const [extractedId, setExtractedId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageBlob: Blob): Promise<string | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setExtractedId(null);

    try {
      const { data } = await Tesseract.recognize(imageBlob, 'ara+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      });

      const id = extractEgyptianId(data.text);

      if (!id) {
        setError('Could not extract ID. Please try manual entry');
        return null;
      }

      const conf = data.confidence;
      setConfidence(conf);
      setExtractedId(id);

      if (conf < 60) {
        setError('Low confidence result — please verify the ID');
      }

      return id;
    } catch {
      setError('OCR processing failed. Please try manual entry');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setExtractedId(null);
    setConfidence(0);
    setIsProcessing(false);
    setError(null);
  }, []);

  return {
    progress,
    extractedId,
    confidence,
    isProcessing,
    error,
    processImage,
    reset,
  };
}
