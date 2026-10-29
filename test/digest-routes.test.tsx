import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const line = (at: string, job: string, status: string, owner: string | null, error?: string) =>
  JSON.stringify({ at, job, status, owner, ...(error ? { error } : {}) });

const NORMAL = '2026-01-01';
const EMPTY = '2026-01-02';
const BAD = '2026-01-03';
const MISSING = '2026-01-04';

const normalLines = [
  line('2026-01-01T23:00:00+01:00', 'zeta/build', 'retry', 'rook', 'timeout'),
  line('2026-01-01T23:01:00+01:00', 'alpha/deploy', 'ok', 'lane-07'),
  line('2026-01-01T23:02:00+01:00', 'zeta/build', 'retry', 'rook', 'timeout'),
  line('2026-01-01T23:03:00+01:00', 'zeta/build', 'retry', 'rook', 'timeout'),
  line('2026-01-01T23:04:00+01:00', 'zeta/build', 'ok', 'rook'),
  line('2026-01-01T23:05:00+01:00', 'alpha/deploy', 'fail', 'lane-07', 'boom'),
];

let dir: string;
let app: ReturnType<typeof createApp>;

beforeAll(() => {
  process.env.LANE_MARKER = 'TEST-MARKER';
  dir = mkdtempSync(join(tmpdir(), 'rig-digest-'));
  writeFileSync(join(dir, `${NORMAL}.jsonl`), normalLines.join('\n') + '\n');
  writeFileSync(join(dir, `${EMPTY}.jsonl`), '');
  writeFileSync(
    join(dir, `${BAD}.jsonl`),
    [normalLines[0], normalLines[1], '{"at":"2026-01-03T23:09:00+01:00","job":"tru'].join('\n') + '\n',
  );
  app = createApp({ adapter: 'shim', installed: '2026-10-29T14:06:00+01:00', beatEverySeconds: 60, runsDir: dir });
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

type Api = { night: string; rows: { job: string; retries: number; lastStatus: string }[]; badLines: number };

describe('GET /digest/:night', () => {
  it('200 for a normal night, marking the 3-retry and fail rows', async () => {
    const res = await app.request(`/digest/${NORMAL}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('zeta/build');
    expect(html).toContain('alpha/deploy');
    expect(html).toContain('3 ⚠');
    expect(html).toContain('fail ⚠');
    expect((html.match(/⚠/g) ?? []).length).toBe(2);
  });

  it('404 for a night with no file', async () => {
    const res = await app.request(`/digest/${MISSING}`);
    expect(res.status).toBe(404);
    expect(await res.text()).toContain(`no run log for ${MISSING}`);
  });

  it('says nothing ran for an empty night', async () => {
    const res = await app.request(`/digest/${EMPTY}`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });

  it("still 200 with a note when a line didn't parse", async () => {
    const res = await app.request(`/digest/${BAD}`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html.replaceAll('&#39;', "'")).toContain("1 line in the log didn't parse");
    expect(html).not.toContain('nothing ran');
  });
});

describe('GET /api/digest/:night', () => {
  it('200 for a normal night', async () => {
    const res = await app.request(`/api/digest/${NORMAL}`);
    const body = (await res.json()) as Api;
    expect(res.status).toBe(200);
    expect(body.night).toBe(NORMAL);
    expect(body.badLines).toBe(0);
    expect(body.rows.map((r) => r.job)).toEqual(['alpha/deploy', 'zeta/build']);
    expect(body.rows[0]?.lastStatus).toBe('fail');
    expect(body.rows[1]?.retries).toBe(3);
  });

  it('404 for a night with no file', async () => {
    const res = await app.request(`/api/digest/${MISSING}`);
    expect(res.status).toBe(404);
  });

  it('empty night has no rows and no bad lines', async () => {
    const res = await app.request(`/api/digest/${EMPTY}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Api;
    expect(body.rows).toEqual([]);
    expect(body.badLines).toBe(0);
  });

  it('counts a truncated line as bad and still answers 200', async () => {
    const res = await app.request(`/api/digest/${BAD}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Api;
    expect(body.badLines).toBe(1);
    expect(body.rows).toHaveLength(2);
  });
});

describe('page and JSON agree', () => {
  it('list the same jobs in the same order', async () => {
    const html = await (await app.request(`/digest/${NORMAL}`)).text();
    const body = (await (await app.request(`/api/digest/${NORMAL}`)).json()) as Api;
    const pageJobs = [...html.matchAll(/<td>([a-z]+\/[a-z-]+)<\/td>/g)].map((m) => m[1]);
    expect(pageJobs).toEqual(body.rows.map((r) => r.job));
  });
});
