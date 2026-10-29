import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { countStatuses } from '../src/digest/counts.js';

it('counts entries by status and ignores bad lines', () => {
  const dir = mkdtempSync(join(tmpdir(), 'counts-'));
  const l = (job: string, status: string) => JSON.stringify({ at: '2026-10-28T01:00:00+01:00', job, status, owner: null });
  writeFileSync(join(dir, '2026-10-28.jsonl'), [l('a', 'retry'), l('a', 'ok'), 'garbage', l('b', 'fail'), ''].join('\n'));
  expect(countStatuses(dir, '2026-10-28')).toEqual({ ok: 1, retry: 1, fail: 1 });
  expect(countStatuses(dir, '2000-01-01')).toEqual({ ok: 0, retry: 0, fail: 0 });
});
