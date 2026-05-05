# Trivelta Vibe Coders — Guides

How to ship fast at Trivelta. Two routes, one outcome:

- **UI walkthrough** — Connor's 5-step onboarding, rendered as a one-page guide. Deployed at `https://vibe-coders-guides-production.up.railway.app`.
- **CLI bootstrap** — `bash scripts/vibe-bootstrap.sh my-app` collapses all 5 steps into one command. See [`scripts/vibe-bootstrap.sh`](scripts/vibe-bootstrap.sh).

## Run locally

```bash
npm install
npm run dev            # Astro dev server on http://localhost:4321
```

To preview the production build (what Railway serves):

```bash
npm run build          # Astro builds to ./dist
npm start              # Express serves ./dist on process.env.PORT
```

Listens on `process.env.PORT` (Railway sets this automatically).

## Add your app to the gallery

The third section on the page is a community gallery of apps that were vibe-coded at Trivelta.

1. Drop your screenshot(s) in `src/assets/gallery/<slug>/`. PNG or JPG; any size — Astro generates AVIF/WebP at the right resolutions.
2. Copy `src/content/apps/rocco.md` to `src/content/apps/<slug>.md` and edit the frontmatter. Schema is enforced at build time, so a bad PR can't merge silently.
3. Open a PR. Card lands in the grid on merge.

For mascots / illustrations, set `portrait: true` in frontmatter — the card will center the artwork on the dark background instead of cropping it to fill 4:3.

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

## Tech

Astro 5 (static output) → `dist/` → served by `server.js` (Express, listens on `process.env.PORT`). Content collections drive the gallery (`src/content/apps/*.md`). Tokens / base / component CSS in `src/styles/`. Playwright e2e in `tests/e2e/`.

## PR screenshots

For visual changes, snap desktop + mobile screenshots and post them as a comment on a PR:

```bash
npm run dev                                # in one terminal
node scripts/pr-screenshots.mjs --pr <N>   # in another
```

Images live on the orphan `pr-screenshots` branch under `pr-<N>/<shortSha>/`. No third-party image host.

## Contributing

PRs welcome. Keep new dependencies minimal — the design tokens and component CSS in `src/styles/` are the source of truth for the look.
