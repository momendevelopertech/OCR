'use client';

import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';

interface OcrResult {
  nationalId: string | null;
  confidence: number;
  rawText: string;
  normalizedText: string;
  croppedImageDataUrl: string;
}

interface UseOcrReturn {
  isProcessing: boolean;
  progress: number;
  result: OcrResult | null;
  error: string | null;
  processImage: (imageDataUrl: string) => Promise<OcrResult | null>;
  reset: () => void;
}

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_ARABIC_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function normalizeDigits(input: string): string {
  return input
    .split('')
    .map((char) => {
      const arabicIndicIndex = ARABIC_INDIC_DIGITS.indexOf(char);
      if (arabicIndicIndex >= 0) return String(arabicIndicIndex);

      const easternArabicIndex = EASTERN_ARABIC_DIGITS.indexOf(char);
      if (easternArabicIndex >= 0) return String(easternArabicIndex);

      return char;
    })
    .join('');
}

function isValidEgyptianId(id: string): boolean {
  if (!/^[23]\d{13}$/.test(id)) return false;

  const centuryPrefix = id[0] === '2' ? '19' : '20';
  const year = Number(id.slice(1, 3));
  const month = Number(id.slice(3, 5));
  const day = Number(id.slice(5, 7));

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(`${centuryPrefix}${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;

  return date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

function hasValidGovernorateCode(id: string): boolean {
  const code = Number(id.slice(7, 9));
  const validCodes = new Set([
    1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35,
    88,
  ]);
  return validCodes.has(code);
}

function extractEgyptianId(text: string): string | null {
  const normalized = normalizeDigits(text)
    .replace(/[oO]/g, '0')
    .replace(/[lI|]/g, '1')
    .replace(/[^0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const compact = normalized.replace(/\s/g, '');
  const direct = compact.match(/[23]\d{13}/g) ?? [];
  const windows: string[] = [];

  for (let i = 0; i <= compact.length - 14; i++) {
    const chunk = compact.slice(i, i + 14);
    if (/^[23]\d{13}$/.test(chunk)) windows.push(chunk);
  }

  const candidates = [...new Set([...direct, ...windows])];
  const validCandidate = candidates.find(isValidEgyptianId);
  return validCandidate ?? candidates[0] ?? null;
}

function normalizeOcrText(text: string): string {
  return normalizeDigits(text)
    .replace(/[oO]/g, '0')
    .replace(/[lI|]/g, '1')
    .replace(/[Zz]/g, '2')
    .replace(/[Ss]/g, '5')
    .replace(/[Bb]/g, '8')
    .replace(/[Gg]/g, '9')
    .replace(/[^0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFromNormalizedDigits(normalized: string): string | null {
  const digitsOnly = normalized.replace(/[^0-9]/g, ' ').trim();
  const sequences = digitsOnly.split(/\s+/).filter(Boolean);

  for (const seq of sequences) {
    if (/^[23]\d{13}$/.test(seq)) {
      return seq;
    }
  }

  const allDigits = digitsOnly.replace(/\s/g, '');
  const match = allDigits.match(/[23]\d{13}/);
  return match ? match[0] : null;
}

function preprocessIdRegion(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(img.width * 2));
      canvas.height = Math.max(1, Math.floor(img.height * 2));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const val = avg < 128 ? 0 : 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageDataUrl;
  });
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
      const croppedImage = await preprocessIdRegion(imageDataUrl);

      const { data } = await Tesseract.recognize(croppedImage, 'ara', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      let normalizedText = normalizeOcrText(data.text);
      let nationalId = extractFromNormalizedDigits(normalizedText) ?? extractEgyptianId(data.text);
      let confidence = Math.round(data.confidence);
      let rawText = data.text;

      if (!nationalId || !isValidEgyptianId(nationalId) || !hasValidGovernorateCode(nationalId)) {
        const fallback = await Tesseract.recognize(imageDataUrl, 'ara');
        const fallbackNormalized = normalizeOcrText(fallback.data.text);
        const fallbackId = extractFromNormalizedDigits(fallbackNormalized) ?? extractEgyptianId(fallback.data.text);

        if (fallbackId && hasValidGovernorateCode(fallbackId)) {
          nationalId = fallbackId;
          confidence = Math.round(fallback.data.confidence);
          rawText = fallback.data.text;
          normalizedText = fallbackNormalized;
        }
      }

      if (nationalId && !hasValidGovernorateCode(nationalId)) {
        nationalId = null;
      }

      if (!nationalId) {
        setError('تعذر قراءة الرقم تلقائياً. اكتب الرقم يدوياً ثم ابحث.');
      }

      const ocrResult: OcrResult = {
        nationalId,
        confidence,
        rawText,
        normalizedText,
        croppedImageDataUrl: croppedImage,
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
