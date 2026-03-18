#!/usr/bin/env bash
# AgentRank production setup / verification script
# Usage:
#   bash scripts/setup-production.sh              # interactive: set all env vars + run D1 migration
#   bash scripts/setup-production.sh --verify-only # just check what's set and what tables exist
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SITE_DIR="$ROOT_DIR/site"
PROJECT_NAME="agentrank-site"
DB_NAME="agentrank-db"

VERIFY_ONLY=false
if [[ "${1:-}" == "--verify-only" ]]; then
  VERIFY_ONLY=true
fi

cd "$SITE_DIR"

echo "=== AgentRank Production Setup ==="
echo ""

# -------------------------------------------------------
# Required env vars
# -------------------------------------------------------
REQUIRED_VARS=(
  "GITHUB_CLIENT_ID"
  "GITHUB_CLIENT_SECRET"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "STRIPE_PRICE_VP_MONTHLY"
  "STRIPE_PRICE_VP_ANNUAL"
  "STRIPE_PRICE_PRO_MONTHLY"
  "STRIPE_PRICE_PRO_ANNUAL"
)

# Required D1 tables
REQUIRED_TABLES=(
  "tools"
  "skills"
  "agents"
  "request_log"
  "rate_limits"
  "claims"
  "rank_history"
  "email_subscribers"
  "install_checkpoints"
  "api_keys"
  "api_usage"
  "score_history"
  "subscriptions"
  "submissions"
)

# -------------------------------------------------------
# Helper: check which secrets are set in Cloudflare Pages
# -------------------------------------------------------
check_secrets() {
  echo "--- Checking Cloudflare Pages secrets ---"
  # wrangler pages secret list exits non-zero if project not found
  SECRET_LIST=$(npx wrangler pages secret list --project-name "$PROJECT_NAME" 2>/dev/null || echo "")

  ALL_SET=true
  for var in "${REQUIRED_VARS[@]}"; do
    if echo "$SECRET_LIST" | grep -q "\"$var\""; then
      echo "  [OK]  $var"
    else
      echo "  [!!]  $var  <-- NOT SET"
      ALL_SET=false
    fi
  done
  echo ""

  if $ALL_SET; then
    echo "All env vars are set."
  else
    echo "Some env vars are missing. See production-checklist.md for instructions."
  fi
  echo ""
}

# -------------------------------------------------------
# Helper: check D1 tables
# -------------------------------------------------------
check_tables() {
  echo "--- Checking D1 tables ($DB_NAME) ---"
  TABLE_LIST=$(npx wrangler d1 execute "$DB_NAME" --remote --command "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "")

  ALL_TABLES=true
  for table in "${REQUIRED_TABLES[@]}"; do
    if echo "$TABLE_LIST" | grep -q "\"$table\""; then
      echo "  [OK]  $table"
    else
      echo "  [!!]  $table  <-- MISSING"
      ALL_TABLES=false
    fi
  done
  echo ""

  if $ALL_TABLES; then
    echo "All D1 tables exist."
  else
    echo "Some tables are missing. Run: bash scripts/setup-production.sh"
  fi
  echo ""
}

# -------------------------------------------------------
# Main: verify-only mode
# -------------------------------------------------------
if $VERIFY_ONLY; then
  check_secrets
  check_tables
  exit 0
fi

# -------------------------------------------------------
# Main: interactive setup
# -------------------------------------------------------

echo "This script will:"
echo "  1. Walk you through setting each required env var as a Cloudflare Pages secret"
echo "  2. Run the D1 migrations to create missing tables"
echo "  3. Verify everything is set"
echo ""
echo "See scripts/production-checklist.md for where to find each value."
echo ""
read -rp "Ready? Press Enter to continue or Ctrl-C to abort..."
echo ""

# Set each env var interactively
for var in "${REQUIRED_VARS[@]}"; do
  echo "Setting $var"
  echo "  (Paste the value at the prompt. Input is hidden.)"
  npx wrangler pages secret put "$var" --project-name "$PROJECT_NAME"
  echo ""
done

# -------------------------------------------------------
# Run D1 migrations
# -------------------------------------------------------
echo "--- Running D1 migrations ---"
echo "Creating any missing tables in $DB_NAME ..."
npx wrangler d1 execute "$DB_NAME" --remote --command "
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  billing TEXT NOT NULL DEFAULT 'monthly',
  current_period_end INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
"
echo "Migration complete."
echo ""

# -------------------------------------------------------
# Final verification
# -------------------------------------------------------
echo "=== Verification ==="
check_secrets
check_tables

echo "=== Done ==="
echo ""
echo "Next: trigger a deployment to pick up the new secrets."
echo "  Option A: push a commit to main"
echo "  Option B: run the pipeline: bash scripts/run-pipeline.sh"
echo ""
echo "Then test the claim flow: https://agentrank-ai.com/tool/modelcontextprotocol/servers"
echo "And test checkout: https://agentrank-ai.com/pricing"
