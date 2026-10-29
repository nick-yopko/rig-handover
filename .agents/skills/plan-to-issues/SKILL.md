---
name: plan-to-issues
description: Split this repo's plan.md into GitHub issues with gh, one per unit of work, after a human has reviewed the split. Use when a plan is ready and has no issues yet.
---

# plan-to-issues

Turns `plan.md` into GitHub issues that workers can pick up cold. Easiest with `gh`, authenticated,
in a shell this agent can run.

## Steps

1. Read `plan.md`, `AGENTS.md` and `docs/adr/`.
2. Draft the split as a table: title · plan section · scope · done when · blocked by.
   One issue per unit of work.
3. **Stop and show the table to the human.** Publish nothing until they approve it.
4. Ask the human what every issue here must carry (fields, labels, wording), unless it is
   already written down in this session or in the repo. It is, below: "What every issue carries".
5. Create each issue in dependency order, so blocked-by can cite real numbers:

   ```sh
   gh issue create --title "<title>" --body-file <tmp.md>
   ```

6. Record every issue URL from gh's output (not from memory) and reply with the list.

Closing one, with the closing comment from AGENTS.md:

```sh
gh issue close <n> -c "<closing comment>"
```

## What every issue carries

Agreed with the human on 2026-10-29 (plan morning-digest). The body opens with the source line,
then these sections, in this order:

```md
Source: plan.md § <n>

## Scope
## Done when
## Blocked by
## Suggested model
## How to close
```

- Label: `plan:<plan name from plan.md's frontmatter>`, e.g. `plan:morning-digest`. Create it
  with `gh label create` if the repo doesn't have it yet.
- Suggested model: the strongest for logic, a cheaper one for views and tests (AGENTS.md).
- How to close: the closing comment shape from AGENTS.md, and "close only when Done when holds".
- **Done when names who it waits on.** If an issue waits on a person (a reviewer, an approver),
  its done line says so, e.g. "the reviewer has looked at the preview", not "the link is sent".
  Sending is not done; the issue stays open until they answer, and anything after it (a
  clean-up) is blocked by that answer, not by the send.
- A pushed commit with `closes #n` (styleguide) closes the issue on GitHub before any closing
  comment. Post the comment anyway: `gh issue comment <n> -b "<closing comment>"`.

## No `gh`

Steps 1–4 hold either way. GitHub reachable another way (a connector, the REST API, the web UI):
the same issues, made that way. GitHub issues out of reach altogether: write them as files in
`docs/issues/`, format in ADR 0004, then commit and push.

## Don'ts

- Don't paste the whole plan into one issue, and don't keep issues only in chat.
- Don't invent sections the plan doesn't have. If the plan is unclear, ask.
