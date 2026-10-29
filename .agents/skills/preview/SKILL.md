---
name: preview
description: Put a rig page on a public link for review and take its lane marker off afterwards (ADR 0003), using this repo's GitHub Pages workflow and gh. Use when a plan has a "Preview for review" or "Clean up" section.
---

# preview

The preview is one HTML file of a rig page, deployed to GitHub Pages by
`.github/workflows/preview.yml`. It is never committed: it lives only in the Pages deployment,
so uploading over it really takes the marker off (ADR 0003). The marker comes from the repo
secret `LANE_MARKER`, so run logs show `***`.

Needs `gh`, authenticated, with the `repo` and `workflow` scopes. If `GITHUB_TOKEN` in the
environment is stale, run `gh` and `git push` with it unset.

## Before anything public

**Ask the human first**, each time: what goes public, where, who can see it, how to undo it.
Putting the page up and uploading over it are two separate yeses.

## Put it up

```sh
gh secret set LANE_MARKER            # paste the marker; never echo it into a log
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow   # first time only
gh workflow run preview.yml -f night=<YYYY-MM-DD>
gh run watch <run id> --exit-status
```

Check the link from outside before sending it: `curl -fsS https://<owner>.github.io/<repo>/`
returns 200 and the banner shows the marker. Search the run log for the marker
(`gh run view <id> --log | grep -c <marker>` must be 0).

Send the reviewer the link and the plan's issues. The preview issue stays **open** until the
reviewer has looked; sending is not done.

## Take the marker off (only after the review is in)

```sh
gh secret delete LANE_MARKER
gh workflow run preview.yml -f night=<YYYY-MM-DD>
gh run watch <run id> --exit-status
gh run delete <id of the run that carried the marker>   # drops its stored page now
```

Check the same link again: the banner reads "no marker set" and the marker is nowhere in the
page. Then close the clean-up issue and move the plan to `docs/plans/done/`.

## Don'ts

- No preview file in the repo, on any branch, in issues or in chat attachments.
- Don't take the marker off before the reviewer has looked, and don't close the preview issue
  before then either.
