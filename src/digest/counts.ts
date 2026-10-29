import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLine } from './read.js';

export type StatusCounts = { ok: number; retry: number; fail: number };

// Per log entry, not per job. Bad lines are ignored; a missing file counts as zeros.
export function countStatuses(runsDir: string, night: string): StatusCounts {
  const counts: StatusCounts = { ok: 0, retry: 0, fail: 0 };
  let text: string;
  try {
    text = readFileSync(join(runsDir, `${night}.jsonl`), 'utf8');
  } catch {
    return counts;
  }
  for (const line of text.split('\n')) {
    const e = parseLine(line);
    if (e) counts[e.status]++;
  }
  return counts;
}
