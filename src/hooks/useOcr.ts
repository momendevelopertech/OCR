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
  return text.split('').map((char) => ARABIC_INDIC_MAP[char] ?? char).join('');
}

function normalizeOcrDigits(text: string): string {
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
  const validCodes = new Set([1, 2, 3, 4, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 88]);
  return validCodes.has(code);
}

function extractId(text: string): string | null {
  const digits = normalizeOcrDigits(text);
  const match = digits.match(/[23]\d{13}/);
  return match ? match[0] : null;
}

function preprocessImage(imageDataUrl: string): Promise<{ ocrImageDataUrl: string; previewImageDataUrl: string; fallbackImageDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const cropCandidates = [
        { x: 0.35, y: 0.58, w: 0.62, h: 0.30 },
        { x: 0.30, y: 0.55, w: 0.68, h: 0.33 },
        { x: 0.25, y: 0.50, w: 0.72, h: 0.36 },
      ];

      const probeCanvas = document.createElement('canvas');
      const probeCtx = probeCanvas.getContext('2d');
      if (!probeCtx) return reject(new Error('Image preprocessing failed'));

      let best = cropCandidates[0];
      let bestScore = -1;

      for (const c of cropCandidates) {
        const cx = Math.floor(img.width * c.x);
        const cy = Math.floor(img.height * c.y);
        const cw = Math.max(1, Math.floor(img.width * c.w));
        const ch = Math.max(1, Math.floor(img.height * c.h));

        probeCanvas.width = cw;
        probeCanvas.height = ch;
        probeCtx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);

        const imageData = probeCtx.getImageData(0, 0, cw, ch).data;
        let dark = 0;
        const total = imageData.length / 4;

        for (let i = 0; i < imageData.length; i += 4) {
          const gray = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
          if (gray < 95) dark += 1;
        }

        const ratio = dark / Math.max(1, total);
        if (ratio > bestScore) {
          bestScore = ratio;
          best = c;
        }
      }

      const cropX = Math.floor(img.width * best.x);
      const cropY = Math.floor(img.height * best.y);
      const cropW = Math.max(1, Math.floor(img.width * best.w));
      const cropH = Math.max(1, Math.floor(img.height * best.h));

      const scale = 3;
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = cropW * scale;
      previewCanvas.height = cropH * scale;

      const previewCtx = previewCanvas.getContext('2d');
      if (!previewCtx) return reject(new Error('Image preprocessing failed'));

      previewCtx.fillStyle = '#ffffff';
      previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, previewCanvas.width, previewCanvas.height);

      const canvas = document.createElement('canvas');
      canvas.width = cropW * scale;
      canvas.height = cropH * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Image preprocessing failed'));

      ctx.drawImage(previewCanvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minGray = 255;
      let maxGray = 0;
      let sumGray = 0;

      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        minGray = Math.min(minGray, gray);
        maxGray = Math.max(maxGray, gray);
        sumGray += gray;
      }

      const meanGray = sumGray / (data.length / 4);
      const dynamicThreshold = Math.max(105, Math.min(180, meanGray - 12));
      const contrastRange = Math.max(1, maxGray - minGray);

      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        const stretched = Math.round(((gray - minGray) * 255) / contrastRange);
        const boosted = Math.min(255, Math.max(0, Math.round(stretched * 1.15)));
        const binary = boosted < dynamicThreshold ? 0 : 255;
        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        ocrImageDataUrl: canvas.toDataURL('image/png'),
        previewImageDataUrl: previewCanvas.toDataURL('image/png'),
        fallbackImageDataUrl: imageDataUrl,
      });
    };

    img.onerror = () => reject(new Error('Image preprocessing failed'));
    img.src = imageDataUrl;
  });
}

async function runOcrPass(image: string, lang: string, params: Record<string, string> = {}): Promise<{ text: string; confidence: number }> {
  const { data } = await Tesseract.recognize(image, lang, {
    logger: () => undefined,
    ...params,
  });

  return { text: data.text, confidence: data.confidence };
}

async function multiPassOcr(
  images: { primary: string; secondary?: string; tertiary?: string },
  onProgress: (progress: number, label: string) => void,
): Promise<{ nationalId: string | null; confidence: number; rawText: string; normalizedText: string }> {
  const passes: Array<{ lang: string; params?: Record<string, string>; label: string; imageKey: 'primary' | 'secondary' | 'tertiary' }> = [
    { lang: 'ara', params: { tessedit_char_whitelist: '٠١٢٣٤٥٦٧٨٩0123456789' }, label: 'Arabic digits whitelist (processed)', imageKey: 'primary' },
    { lang: 'eng', params: { tessedit_char_whitelist: '0123456789' }, label: 'English digits only (processed)', imageKey: 'primary' },
    { lang: 'ara', label: 'Arabic full (processed)', imageKey: 'primary' },
    { lang: 'ara', params: { tessedit_char_whitelist: '٠١٢٣٤٥٦٧٨٩0123456789' }, label: 'Arabic digits whitelist (raw crop)', imageKey: 'secondary' },
    { lang: 'eng', params: { tessedit_char_whitelist: '0123456789' }, label: 'English digits only (raw crop)', imageKey: 'secondary' },
    { lang: 'ara', label: 'Arabic full (raw crop)', imageKey: 'secondary' },
    { lang: 'ara', params: { tessedit_char_whitelist: '٠١٢٣٤٥٦٧٨٩0123456789' }, label: 'Arabic digits whitelist (full image)', imageKey: 'tertiary' },
    { lang: 'eng', params: { tessedit_char_whitelist: '0123456789' }, label: 'English digits only (full image)', imageKey: 'tertiary' },
    { lang: 'ara', label: 'Arabic full (full image)', imageKey: 'tertiary' },
  ];

  let bestId: string | null = null;
  let bestConfidence = 0;
  let bestRaw = '';

  for (let i = 0; i < passes.length; i += 1) {
    const pass = passes[i];
    const image = pass.imageKey === 'primary' ? images.primary : pass.imageKey === 'secondary' ? images.secondary : images.tertiary;
    if (!image) continue;

    onProgress(20 + Math.round((i / Math.max(1, passes.length - 1)) * 60), `OCR pass ${i + 1}/${passes.length}: ${pass.label}...`);

    try {
      const { text, confidence } = await runOcrPass(image, pass.lang, pass.params);
      const extracted = extractId(text);

      if (!bestRaw) {
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
      const processedImages = await preprocessImage(imageDataUrl);
      setProgress(15);

      const passResult = await multiPassOcr({
        primary: processedImages.ocrImageDataUrl,
        secondary: processedImages.previewImageDataUrl,
        tertiary: processedImages.fallbackImageDataUrl,
      }, (nextProgress, label) => {
        setProgress(nextProgress);
        setProgressLabel(label);
      });

      const ocrResult: OcrResult = {
        ...passResult,
        croppedImageDataUrl: processedImages.previewImageDataUrl,
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
