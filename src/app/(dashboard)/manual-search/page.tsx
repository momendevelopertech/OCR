'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { egyptianIdSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TicketCard from '@/components/ticket/TicketCard';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { useTicketSearch } from '@/hooks/useTicketSearch';

export default function ManualSearchPage() {
  const [nationalId, setNationalId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { result, isFound, isLoading, error, search } = useTicketSearch();

  const handleSearch = async () => {
    setValidationError(null);
    const parsed = egyptianIdSchema.safeParse(nationalId);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0].message);
      return;
    }
    await search(parsed.data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manual Search</h1>
        <p className="text-sm text-neutral-500">
          Enter a 14-digit Egyptian National ID
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search by National ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="national-id">National ID</Label>
            <Input
              id="national-id"
              placeholder="29801011234567"
              value={nationalId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                setNationalId(val);
                setValidationError(null);
              }}
              maxLength={14}
              className="font-mono text-lg"
            />
            {validationError && (
              <p className="text-xs text-red-500">{validationError}</p>
            )}
          </div>
          <Button
            onClick={handleSearch}
            className="w-full"
            disabled={isLoading || nationalId.length !== 14}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && <ErrorMessage message={error} />}

      {isFound === false && !error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-neutral-500">No ticket found for this ID</p>
          </CardContent>
        </Card>
      )}

      {result && <TicketCard student={result} />}
    </div>
  );
}
