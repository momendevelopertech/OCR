'use client';

import { useState, useCallback } from 'react';
import { searchTicketByNationalId } from '@/services/ticketService';
import type { StudentRecord } from '@/types';

interface UseTicketSearchReturn {
  result: StudentRecord | null;
  isFound: boolean | null;
  isLoading: boolean;
  error: string | null;
  search: (nationalId: string) => Promise<void>;
  reset: () => void;
}

export function useTicketSearch(): UseTicketSearchReturn {
  const [result, setResult] = useState<StudentRecord | null>(null);
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (nationalId: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsFound(null);

    try {
      const response = await searchTicketByNationalId(nationalId);

      if (response.error) {
        setError(response.error);
        setIsFound(false);
        return;
      }

      if (response.found && response.student) {
        setResult(response.student);
        setIsFound(true);
      } else {
        setIsFound(false);
      }
    } catch {
      setError('Connection issue. Please check your internet');
      setIsFound(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsFound(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    result,
    isFound,
    isLoading,
    error,
    search,
    reset,
  };
}
