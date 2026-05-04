# Trivelta Vibe Coders — Guides

How to ship fast at Trivelta. Two routes, one outcome:

- **UI walkthrough** — Connor's 5-step onboarding, rendered as a one-page guide. Deployed at `https://vibe-coders-guides.up.railway.app` (live URL once Railway is wired).
- **CLI bootstrap** — `bash scripts/vibe-bootstrap.sh my-app` collapses all 5 steps into one command. See [`scripts/vibe-bootstrap.sh`](scripts/vibe-bootstrap.sh).

## Run locally

```bash
npm install
npm start          # serves public/index.html at http://localhost:3000
```

Listens on `process.env.PORT` (Railway sets this automatically).

## CLI bootstrap

Prereqs: `gh` (authenticated, `repo` + `read:org` + `workflow` scopes), `railway` (logged in), `jq`.

```bash
bash scripts/vibe-bootstrap.sh <project-name> [--db postgres|redis|mysql|mongo] [--public]
```

What it does (the same 5 steps from the UI guide, run as one command):

1. Preflight — check `gh` auth, `railway` auth, and Trivelta-Vibe-Coders org membership.
2. `gh repo create Trivelta-Vibe-Coders/<name> --template Trivelta-Vibe-Coders/app-template --private --clone`.
3. `railway init -n <name> -w "Trivelta Vibe Coders"`.
4. `railway add --service <name> --repo Trivelta-Vibe-Coders/<name>` (auto-deploys on push).
5. Optional `railway add --database <kind>`.
6. `railway domain --service <name>` → public `*.up.railway.app` URL.

Defaults: private repo, no DB. Override with `--public` and `--db`.

## /vibe slash command (Claude Code)

Drop [`.claude/commands/vibe.md`](.claude/commands/vibe.md) into your own project's `.claude/commands/` (or `~/.claude/commands/` for a global command) to get `/vibe <name>` from any Claude Code session.

## Deploy

This repo is itself deployed via the same flow it documents:

1. Repo lives in `Trivelta-Vibe-Coders/trivelta-vibe-coders-guides`.
2. Railway service deploys from `main` on push.
3. Public domain via `railway domain`.

## Contributing

PRs welcome. The guide page (`public/index.html`) is intentionally a single self-contained HTML file — no build step, no framework. Keep it that way unless there's a strong reason.
