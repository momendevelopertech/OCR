export const EGYPTIAN_ID_PATTERN = /[23]\d{13}/;

export function extractEgyptianId(text: string): string | null {
  const cleaned = text
    .replace(/\s/g, '')
    .replace(/[oO]/g, '0')
    .replace(/[lI]/g, '1');
  const match = cleaned.match(EGYPTIAN_ID_PATTERN);
  return match ? match[0] : null;
}

export function extractConfidence(progress: number): number {
  return Math.round(progress * 100);
}
