'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IdPreviewProps {
  extractedId: string;
  confidence: number;
  onConfirm: (id: string) => void;
  onEdit: (id: string) => void;
  isLoading: boolean;
}

export default function IdPreview({
  extractedId,
  confidence,
  onConfirm,
  onEdit,
  isLoading,
}: IdPreviewProps) {
  const isValidId = /^[23]\d{13}$/.test(extractedId);

  const confidenceColor =
    confidence >= 80
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : confidence >= 60
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="space-y-2">
        <Label htmlFor="extracted-id">Extracted National ID</Label>
        <div className="flex items-center gap-2">
          <Input
            id="extracted-id"
            value={extractedId}
            onChange={(e) => onEdit(e.target.value)}
            className="font-mono text-lg"
            maxLength={14}
          />
          <Badge className={confidenceColor}>
            {Math.round(confidence)}%
          </Badge>
        </div>
        {!isValidId && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Please enter a valid 14-digit Egyptian national ID (starts with 2 or 3)
          </p>
        )}
        {isValidId && confidence < 60 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Low confidence — please verify the ID before searching
          </p>
        )}
      </div>
      <Button
        onClick={() => onConfirm(extractedId)}
        className="w-full"
        disabled={isLoading || !isValidId}
      >
        {isLoading ? 'Searching...' : 'Search Ticket'}
      </Button>
    </div>
  );
}
