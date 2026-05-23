'use client';

import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { FileText } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.js';

interface PdfPreviewProps {
  pdfUrl: string;
}

export default function PdfPreview({ pdfUrl }: PdfPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      try {
        setIsLoading(true);
        setError(false);
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({
          canvas,
          canvasContext: canvas.getContext('2d')!,
          viewport,
        }).promise;
        if (!cancelled) {
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPreview();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <LoadingSkeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
          <p className="text-xs text-neutral-500">Could not load preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <img
        src={previewUrl}
        alt="PDF First Page Preview"
        className="h-auto w-full"
      />
    </div>
  );
}
