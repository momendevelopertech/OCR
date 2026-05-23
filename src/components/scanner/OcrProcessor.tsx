'use client';

import { Loader2 } from 'lucide-react';

interface OcrProcessorProps {
  progress: number;
  isProcessing: boolean;
  error: string | null;
}

export default function OcrProcessor({ progress, isProcessing, error }: OcrProcessorProps) {
  if (!isProcessing && !error) return null;

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      {isProcessing ? (
        <>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
            <span className="text-sm font-medium">Processing OCR...</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-neutral-50"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">{Math.round(progress)}%</p>
        </>
      ) : error ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
      ) : null}
    </div>
  );
}
