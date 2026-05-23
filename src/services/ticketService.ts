import type { StudentRecord } from '@/types';
import { egyptianIdSchema } from '@/lib/validations';

const API_BASE = '/api';

export async function searchTicketByNationalId(
  nationalId: string,
): Promise<{ found: boolean; student?: StudentRecord; error?: string }> {
  const parsed = egyptianIdSchema.safeParse(nationalId);
  if (!parsed.success) {
    return { found: false, error: parsed.error.issues[0].message };
  }

  const res = await fetch(`${API_BASE}/tickets/search?nationalId=${parsed.data}`);
  if (!res.ok) {
    const data = await res.json();
    return { found: false, error: data.error || 'Search failed' };
  }

  return res.json();
}
