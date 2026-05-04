---
description: Scaffold a new Trivelta Vibe Coders project (GitHub repo from app-template + Railway service + public domain) in one shot.
model: haiku
argument-hint: <project-name> [--db postgres|redis|mysql|mongo] [--public]
allowed-tools: Bash, AskUserQuestion
---

Bootstrap a new vibe-coding project end-to-end via `scripts/vibe-bootstrap.sh`.

> **Install:** copy this file to your project's `.claude/commands/vibe.md` (or `~/.claude/commands/vibe.md` for a global command), and copy `scripts/vibe-bootstrap.sh` to a path on disk. The command shells out to that script.

Arguments: `$ARGUMENTS` — first token is the project name (lowercase, hyphenated, 2–40 chars). Optional flags `--db <kind>` and `--public`.

**Returns:** the receipts block from the script (repo URL, Railway URL, public URL, local path) plus a `next: cd <dir> && claude` so you jump into the new repo for actual work.

## Steps

1. **Validate** — if `$ARGUMENTS` is empty, ask the user for the project name (free-text). If a name is supplied but doesn't match `^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$`, ask once with a corrected suggestion.
2. **Run the script** — `bash scripts/vibe-bootstrap.sh $ARGUMENTS`. Stream output; do not wrap in a subagent.
3. **Surface the receipts** — repeat the URLs from the script's final block as a short chat receipt. No narration.
4. **If the script fails preflight** (missing gh/railway access, Railway GitHub App not installed, repo name collision), surface the exact remediation the script printed. Don't retry without confirmation.

## Notes

- Default repo visibility is **private**. `--public` is opt-in.
- `--db` adds a managed Postgres/Redis/MySQL/Mongo at create time.
- If you hit "Unauthorized" on the Railway link step, the Railway GitHub App needs to be installed for the Trivelta-Vibe-Coders org — see the script's error message for the dashboard path.
