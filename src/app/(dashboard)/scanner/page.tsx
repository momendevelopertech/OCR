'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CameraCapture from '@/components/scanner/CameraCapture';
import OcrProcessor from '@/components/scanner/OcrProcessor';
import IdPreview from '@/components/scanner/IdPreview';
import TicketCard from '@/components/ticket/TicketCard';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useOcr } from '@/hooks/useOcr';
import { useTicketSearch } from '@/hooks/useTicketSearch';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

export default function ScannerPage() {
  const ocr = useOcr();
  const ticketSearch = useTicketSearch();
  const [capturedImageDataUrl, setCapturedImageDataUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'camera' | 'preview' | 'result'>('camera');

  const handleCapture = useCallback(
    async (imageDataUrl: string) => {
      setCapturedImageDataUrl(imageDataUrl);
      setStep('preview');

      const blob = dataUrlToBlob(imageDataUrl);
      const id = await ocr.processImage(blob);
      if (id) {
        setStep('result');
        await ticketSearch.search(id);
        if (ticketSearch.error) {
          toast.error(ticketSearch.error);
        }
      }
    },
    [ocr, ticketSearch],
  );

  const handleConfirmId = async (id: string) => {
    setStep('result');
    await ticketSearch.search(id);
    if (ticketSearch.error) {
      toast.error(ticketSearch.error);
    }
  };

  const handleReset = () => {
    ocr.reset();
    ticketSearch.reset();
    setCapturedImageDataUrl(null);
    setStep('camera');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Scanner</h1>
          <p className="text-sm text-neutral-500">
            Scan a National ID to find the admission ticket
          </p>
        </div>
      </div>

      {step === 'camera' && (
        <CameraCapture onCapture={handleCapture} />
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          {capturedImageDataUrl && (
            <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
              <img
                src={capturedImageDataUrl}
                alt="Captured ID"
                className="h-auto w-full"
              />
            </div>
          )}
          <OcrProcessor
            progress={ocr.progress}
            isProcessing={ocr.isProcessing}
            error={ocr.error}
          />
          <IdPreview
            extractedId={ocr.extractedId}
            confidence={ocr.confidence}
            onConfirm={handleConfirmId}
            onEdit={(id) => ocr.extractedId && id}
            isLoading={ticketSearch.isLoading}
          />
          <Button variant="outline" className="w-full" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-4">
          {ticketSearch.error && !ticketSearch.isFound && (
            <ErrorMessage message={ticketSearch.error} />
          )}

          {ticketSearch.isFound === false && (
            <ErrorMessage message="No ticket found for this ID" />
          )}

          {ticketSearch.result && <TicketCard student={ticketSearch.result} />}

          <Button variant="outline" className="w-full" onClick={handleReset}>
            <Camera className="mr-2 h-4 w-4" />
            Scan Another ID
          </Button>
        </div>
      )}
    </div>
  );
}
