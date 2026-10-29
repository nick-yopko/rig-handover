import type { Night } from '../digest/types.js';

const dash = '—';

export function DigestPage({ data }: { data: Night }) {
  const rows = [...data.rows].sort((a, b) => a.job.localeCompare(b.job));
  const empty = rows.length === 0 && data.badLines === 0;
  return (
    <>
      <h1>digest · {data.night}</h1>
      {empty ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th><th>owner</th><th>runs</th><th>retries</th>
              <th>last status</th><th>last error</th><th>first</th><th>last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr>
                <td>{r.job}</td>
                <td>{r.owner ?? dash}</td>
                <td>{r.runs}</td>
                <td class={r.retries >= 3 ? 'warn' : undefined}>{r.retries}{r.retries >= 3 ? ' ⚠' : ''}</td>
                <td class={r.lastStatus === 'fail' ? 'warn' : undefined}>{r.lastStatus}{r.lastStatus === 'fail' ? ' ⚠' : ''}</td>
                <td>{r.lastError ?? dash}</td>
                <td>{r.firstAt}</td>
                <td>{r.lastAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data.badLines > 0 && (
        <p class="mute">
          {data.badLines} {data.badLines === 1 ? "line in the log didn't" : "lines in the log didn't"} parse
        </p>
      )}
    </>
  );
}
