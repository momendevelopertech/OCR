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
  progressLabel: string;
  result: OcrResult | null;
  error: string | null;
  processImage: (imageDataUrl: string) => Promise<OcrResult | null>;
  reset: () => void;
}

const ARABIC_INDIC_MAP: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};

function convertArabicDigits(text: string): string {
  return text
    .split('')
    .map((char) => ARABIC_INDIC_MAP[char] ?? char)
    .join('');
}

function cleanDigits(text: string): string {
  return convertArabicDigits(text)
    .replace(/[oO°©]/g, '0')
    .replace(/[lI|!]/g, '1')
    .replace(/[Zz]/g, '2')
    .replace(/[Ss$]/g, '5')
    .replace(/[Bb]/g, '8')
    .replace(/[Gg]/g, '9')
    .replace(/[^0-9]/g, '');
}

function isValidEgyptianId(id: string): boolean {
  if (!/^[23]\d{13}$/.test(id)) return false;

  const centuryPrefix = id[0] === '2' ? '19' : '20';
  const year = Number(id.slice(1, 3));
  const month = Number(id.slice(3, 5));
  const day = Number(id.slice(5, 7));

  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(
    `${centuryPrefix}${year.toString().padStart(2, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00Z`,
  );

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

function extractId(text: string): string | null {
  const digits = cleanDigits(text);
  const match = digits.match(/[23]\d{13}/);
  if (!match) return null;

  return match[0];
}

function preprocessImage(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const cropX = Math.floor(img.width * 0.4);
      const cropY = Math.floor(img.height * 0.65);
      const cropW = Math.floor(img.width * 0.6);
      const cropH = Math.floor(img.height * 0.35);

      const scale = 3;
      const canvas = document.createElement('canvas');
      canvas.width = cropW * scale;
      canvas.height = cropH * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Image preprocessing failed'));
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const contrast = 2.5;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        const boosted = Math.min(255, Math.max(0, Math.round(factor * (gray - 128) + 128)));
        const binary = boosted < 120 ? 0 : 255;

        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Image preprocessing failed'));
    img.src = imageDataUrl;
  });
}

async function runOcrPass(
  image: string,
  lang: string,
  params: Record<string, string> = {},
): Promise<{ text: string; confidence: number }> {
  const { data } = await Tesseract.recognize(image, lang, {
    logger: () => undefined,
    ...params,
  });

  return { text: data.text, confidence: data.confidence };
}

async function multiPassOcr(
  image: string,
  onProgress: (progress: number, label: string) => void,
): Promise<{ nationalId: string | null; confidence: number; rawText: string; normalizedText: string }> {
  const passes = [
    { lang: 'ara', params: { tessedit_char_whitelist: '٠١٢٣٤٥٦٧٨٩0123456789' }, label: 'Arabic digits whitelist' },
    { lang: 'eng', params: { tessedit_char_whitelist: '0123456789' }, label: 'English digits only' },
    { lang: 'ara', params: {}, label: 'Arabic full' },
  ];

  let bestId: string | null = null;
  let bestConfidence = 0;
  let bestRaw = '';

  for (let i = 0; i < passes.length; i += 1) {
    const pass = passes[i];
    onProgress(20 + i * 25, `OCR pass ${i + 1}/3: ${pass.label}...`);

    try {
      const { text, confidence } = await runOcrPass(image, pass.lang, pass.params);
      const extracted = extractId(text);

      if (i === 0 && !bestRaw) {
        bestRaw = text;
        bestConfidence = confidence;
      }

      if (extracted && isValidEgyptianId(extracted) && hasValidGovernorateCode(extracted)) {
        if (!bestId || confidence > bestConfidence) {
          bestId = extracted;
          bestConfidence = confidence;
          bestRaw = text;
        }
      }
    } catch {
      continue;
    }
  }

  return {
    nationalId: bestId,
    confidence: Math.round(bestConfidence),
    rawText: bestRaw,
    normalizedText: convertArabicDigits(bestRaw),
  };
}

export function useOcr(): UseOcrReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageDataUrl: string): Promise<OcrResult | null> => {
    setIsProcessing(true);
    setProgress(5);
    setProgressLabel('جارٍ تحضير الصورة...');
    setError(null);
    setResult(null);

    try {
      setProgressLabel('جارٍ قص وتحسين منطقة الرقم القومي...');
      const processedImage = await preprocessImage(imageDataUrl);
      setProgress(15);

      const passResult = await multiPassOcr(processedImage, (nextProgress, label) => {
        setProgress(nextProgress);
        setProgressLabel(label);
      });

      const ocrResult: OcrResult = {
        ...passResult,
        croppedImageDataUrl: processedImage,
      };

      if (!ocrResult.nationalId) {
        setError('تعذر قراءة الرقم تلقائياً. اكتب الرقم يدوياً ثم ابحث.');
      }

      setProgress(95);
      setProgressLabel(
        ocrResult.nationalId
          ? `✅ تم استخراج الرقم: ${ocrResult.nationalId}`
          : '⚠️ لم يتم العثور على رقم — حاول يدوياً',
      );
      setResult(ocrResult);
      setProgress(100);

      return ocrResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في معالجة الصورة';
      setError(msg);
      setProgressLabel('');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel('');
    setIsProcessing(false);
  }, []);

  return { isProcessing, progress, progressLabel, result, error, processImage, reset };
}
