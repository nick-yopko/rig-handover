// Plan morning-digest § 1. The contract every part of § 2 builds against.

export type RunStatus = 'ok' | 'retry' | 'fail';

// One row per job in a night's run log. Times keep the log's offset (styleguide).
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

export type Night = {
  night: string;
  rows: DigestRow[];
  // Lines that didn't parse: counted, never thrown.
  badLines: number;
};

// null when runs/<night>.jsonl doesn't exist (the route answers 404).
export type ReadNight = (runsDir: string, night: string) => Night | null;
