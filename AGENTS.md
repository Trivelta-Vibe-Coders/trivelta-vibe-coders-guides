# Agent Guide

## Repo Purpose

This repo is the Trivelta Vibe Coders guide site. It ships a one-page Astro 5 walkthrough plus a CLI bootstrap script for creating new Vibe Coders projects.

Production runs on Railway. Astro builds a static site into `dist/`, and `server.js` serves that directory with Express using `process.env.PORT`.

## Commands

- `npm install` installs dependencies. Use Node 20 or newer.
- `npm run dev` starts the Astro dev server at `http://localhost:4321`.
- `npm run build` builds the static site into `dist/`.
- `npm start` serves `dist/` with the production Express server.
- `npm run test:e2e` runs the Playwright suite. Its config builds the site and starts `npm start` on port 4321.

## Project Structure

- `src/content/apps/*.md` contains gallery entries.
- `src/content/config.ts` defines the content collection schema. Keep new app frontmatter aligned with this schema; builds fail on invalid content.
- `src/assets/gallery/...` stores gallery screenshots and app artwork.
- `src/styles/tokens.css`, `src/styles/base.css`, and `src/styles/components.css` are the source of truth for the visual system.
- `scripts/pr-screenshots.mjs` captures desktop and mobile PR screenshots.
- `scripts/vibe-bootstrap.sh` scaffolds brand-new Vibe Coders repos from the app template.

## Gallery Workflow

When adding or updating a gallery app:

1. Add screenshots or artwork under `src/assets/gallery/<slug>/`.
2. Add or update `src/content/apps/<slug>.md`.
3. Match the schema in `src/content/config.ts`, including `slug`, `name`, `tagline`, `live`, `internal`, `stack`, `ai_tools`, `live_url`, `hero_image`, `built_by`, `shipped`, and `blurb`.
4. Use `portrait: true` for mascot or portrait-style artwork that should be centered instead of cropped.
5. Keep `tagline` at 120 characters or fewer.

## Style Guidance

Prefer the existing Astro, CSS, and content collection patterns. Keep dependencies minimal, and use the existing design tokens and component styles before adding new abstractions or libraries.

For UI changes, keep the page polished on both desktop and mobile. The site is a guide and gallery, so clarity, fast scanning, and strong visual hierarchy matter more than adding new interaction patterns.

## Verification

Run `npm run build` for content, style, or Astro changes. Run `npm run test:e2e` when changing behavior, layout-critical UI, navigation, gallery rendering, or production serving behavior.

For visual PRs, capture screenshots after opening the PR:

```bash
npm run dev
node scripts/pr-screenshots.mjs --pr <N>
```

The screenshot script publishes images to the orphan `pr-screenshots` branch and comments links on the PR.

## Deployment

Railway deploys from `main`. Do not hard-code ports; `server.js` must keep honoring `process.env.PORT`.

## Important Caveat

The `/vibe` Claude command and `scripts/vibe-bootstrap.sh` are for scaffolding new repos from `Trivelta-Vibe-Coders/app-template`. They are not the normal workflow for editing this Astro guide site unless the task explicitly asks to change the scaffolding flow.
