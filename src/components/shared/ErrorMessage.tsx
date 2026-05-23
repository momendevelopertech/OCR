import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50">
      <CardContent className="flex items-center gap-3 p-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="flex-1 text-sm text-red-700 dark:text-red-400">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
