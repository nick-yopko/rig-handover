import type { DigestRow } from './types.js';

// The page and the JSON share this order: by job. Returns a new array.
export function sortRows(rows: DigestRow[]): DigestRow[] {
  return [...rows].sort((a, b) => a.job.localeCompare(b.job));
}
