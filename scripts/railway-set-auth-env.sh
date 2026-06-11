#!/usr/bin/env bash
# Set Supabase auth env vars on the vibe-coders-guides Railway service.
# Requires: railway CLI authenticated (`railway login`) and project linked.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

say() { printf '→ %s\n' "$*"; }
die() { printf '✗ %s\n' "$*" >&2; exit 1; }

command -v railway >/dev/null || die "railway not installed (brew install railway)"
railway whoami >/dev/null 2>&1 || die "railway not authenticated — run: railway login"

# Muninn Supabase (shared with ravens dashboard)
PUBLIC_SUPABASE_URL="${PUBLIC_SUPABASE_URL:-https://hxatztxnwzhfdaypoicw.supabase.co}"

if [[ -z "${PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  if [[ -f "$HOME/Projects/ravens/.env" ]]; then
    PUBLIC_SUPABASE_ANON_KEY="$(grep '^SUPABASE_ANON_KEY=' "$HOME/Projects/ravens/.env" | cut -d= -f2- || true)"
  fi
fi

[[ -n "${PUBLIC_SUPABASE_ANON_KEY:-}" ]] || die "Set PUBLIC_SUPABASE_ANON_KEY or ensure ~/Projects/ravens/.env has SUPABASE_ANON_KEY"

say "Setting Railway variables on linked vibe-coders-guides service"
railway variable set \
  "PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}" \
  "PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}"

say "Done. Railway will redeploy with auth enabled."
say "Ensure Muninn Auth redirect URLs include:"
say "  https://vibe-coders-guides-production.up.railway.app/auth/callback"
say "  http://localhost:4321/auth/callback"
