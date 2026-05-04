#!/usr/bin/env bash
# vibe-bootstrap.sh — scaffold a new Trivelta Vibe Coders project end-to-end.
#
# Collapses the 5-step "Vibe Coding at Trivelta" onboarding into one command:
#   1. preflight (gh + railway auth, org membership)
#   2. create repo from app-template in Trivelta-Vibe-Coders org
#   3. railway init in Trivelta Vibe Coders workspace
#   4. add GitHub-linked service (auto-deploys on push)
#   5. optional database
#   6. generate public *.up.railway.app domain
#
# Usage:
#   bash scripts/vibe-bootstrap.sh <project-name> [--db postgres|redis|mysql|mongo] [--public] [--parent-dir <dir>]
#
# Defaults: private repo, no db, clones into $PWD.

set -euo pipefail

GH_ORG="Trivelta-Vibe-Coders"
RW_WORKSPACE="Trivelta Vibe Coders"
TEMPLATE="${GH_ORG}/app-template"

die() { echo "✗ $*" >&2; exit 1; }
say() { echo "→ $*"; }
ok()  { echo "✓ $*"; }

NAME=""
DB=""
VISIBILITY="--private"
PARENT_DIR="$PWD"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db)         DB="${2:-}"; shift 2 ;;
    --public)     VISIBILITY="--public"; shift ;;
    --parent-dir) PARENT_DIR="${2:-}"; shift 2 ;;
    -h|--help)    sed -n '2,18p' "$0"; exit 0 ;;
    -*)           die "unknown flag: $1" ;;
    *)            [[ -z "$NAME" ]] || die "unexpected arg: $1"; NAME="$1"; shift ;;
  esac
done

[[ -n "$NAME" ]] || die "usage: $0 <project-name> [--db <kind>] [--public]"
[[ "$NAME" =~ ^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$ ]] || die "name must be lowercase, hyphenated, 2–40 chars: '$NAME'"
[[ -d "$PARENT_DIR" ]] || die "parent dir does not exist: $PARENT_DIR"

if [[ -n "$DB" ]]; then
  case "$DB" in postgres|redis|mysql|mongo) ;; *) die "--db must be postgres|redis|mysql|mongo (got: $DB)";; esac
fi

say "preflight"
command -v gh      >/dev/null || die "gh not installed (brew install gh)"
command -v railway >/dev/null || die "railway not installed (brew install railway)"
command -v jq      >/dev/null || die "jq not installed (brew install jq)"

gh auth status >/dev/null 2>&1 || die "gh not authenticated — run: gh auth login"
railway whoami >/dev/null 2>&1 || die "railway not authenticated — run: railway login"

gh api "orgs/${GH_ORG}" >/dev/null 2>&1 \
  || die "no access to ${GH_ORG} org — accept invite at github.com, then run: gh auth refresh -s repo,read:org,workflow"

if gh api "repos/${GH_ORG}/${NAME}" >/dev/null 2>&1; then
  die "repo ${GH_ORG}/${NAME} already exists"
fi
ok "preflight"

TARGET_DIR="${PARENT_DIR%/}/${NAME}"
[[ ! -e "$TARGET_DIR" ]] || die "directory already exists: $TARGET_DIR"

say "creating ${GH_ORG}/${NAME} from ${TEMPLATE}"
( cd "$PARENT_DIR" && \
  gh repo create "${GH_ORG}/${NAME}" --template "${TEMPLATE}" ${VISIBILITY} --clone >/dev/null )
ok "repo cloned to ${TARGET_DIR}"

cd "$TARGET_DIR"

if [[ -f .gitignore ]]; then
  grep -qxF '.railway' .gitignore || printf '\n.railway\n' >> .gitignore
else
  echo '.railway' > .gitignore
fi

say "railway init (workspace: ${RW_WORKSPACE})"
RW_INIT_RAW="$(railway init -n "$NAME" -w "$RW_WORKSPACE" --json 2>&1)"
RW_INIT_JSON="$(grep -E '^\{.*\}$' <<<"$RW_INIT_RAW" | tail -1)"
PROJECT_ID="$(jq -r '.project.id // .id // empty' <<<"$RW_INIT_JSON" 2>/dev/null || true)"
[[ -n "$PROJECT_ID" ]] || die "railway init: could not parse project id. Raw output:
$RW_INIT_RAW"
ok "railway project ${PROJECT_ID}"

say "linking service to GitHub repo"
if ! railway add --service "$NAME" --repo "${GH_ORG}/${NAME}" 2>&1 | tee /tmp/vibe-add.log | grep -qiE 'unauthorized'; then
  ok "service '${NAME}' linked"
else
  cat <<EOF >&2

✗ railway could not link the GitHub repo (Unauthorized).

This usually means the Railway GitHub App is not installed for the
${GH_ORG} org. Fix:
  1. Open https://railway.com/dashboard, switch to the "${RW_WORKSPACE}" workspace.
  2. Open project "${NAME}" → New Service → Deploy from GitHub Repo.
  3. If the repo isn't listed, click "Configure GitHub App" and grant access
     to the ${GH_ORG} org (an org owner may need to approve).
  4. Once linked in the UI, future projects can use this CLI flow.
EOF
  exit 2
fi

if [[ -n "$DB" ]]; then
  say "adding ${DB} database"
  railway add --database "$DB" >/dev/null
  ok "${DB} provisioned"
fi

say "generating public domain"
DOMAIN_JSON="$(railway domain --service "$NAME" --json 2>/dev/null || true)"
PUBLIC_URL="$(jq -r '.. | .domain? // empty' <<<"$DOMAIN_JSON" 2>/dev/null | head -1)"
if [[ -z "$PUBLIC_URL" ]]; then
  PUBLIC_URL="$(railway domain --service "$NAME" 2>&1 | grep -oE '[a-z0-9-]+\.up\.railway\.app' | head -1 || true)"
fi
[[ -n "$PUBLIC_URL" ]] && ok "public URL: https://${PUBLIC_URL}" || echo "  (domain not parsed — check 'railway domain' manually)"

REPO_URL="https://github.com/${GH_ORG}/${NAME}"
RAILWAY_URL="https://railway.com/project/${PROJECT_ID}"

cat <<EOF

──────── done ────────
repo:    ${REPO_URL}
railway: ${RAILWAY_URL}
public:  ${PUBLIC_URL:+https://}${PUBLIC_URL:-<run: railway domain>}
local:   ${TARGET_DIR}

reminder: app must listen on process.env.PORT (Railway injects it).

next:
  cd ${TARGET_DIR} && claude
──────────────────────
EOF
