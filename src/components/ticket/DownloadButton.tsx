'use client';

import { Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  pdfUrl: string;
  fileName?: string;
}

export default function DownloadButton({ pdfUrl, fileName = 'ticket.pdf' }: DownloadButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = fileName;
          a.click();
        }}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline" asChild>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </a>
      </Button>
    </div>
  );
}
