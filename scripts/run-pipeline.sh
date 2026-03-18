#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== AgentRank Pipeline ==="
echo ""

echo "Step 1: Crawl"
cd "$ROOT_DIR/crawler"
npx tsx src/index.ts
echo ""

echo "Step 2: Score"
cd "$ROOT_DIR/scorer"
npx tsx src/index.ts
echo ""

echo "Step 2b: Weekly roundup (Mondays only)"
cd "$ROOT_DIR"
if [ "$(date +%u)" = "1" ]; then
  node scripts/generate-weekly-roundup.mjs
  echo "Weekly roundup generated."
else
  echo "Not Monday, skipping weekly roundup."
fi
echo ""

echo "Step 3: Seed D1"
cd "$ROOT_DIR"
npx tsx scripts/seed-d1.ts
cd "$ROOT_DIR/site"
npx wrangler d1 execute agentrank-db --remote --file="$ROOT_DIR/scripts/d1-schema.sql"
npx wrangler d1 execute agentrank-db --remote --file="$ROOT_DIR/data/d1-seed.sql"
echo ""

echo "Step 4: Build site"
cd "$ROOT_DIR/site"
npm run build
echo ""

echo "Step 5: Deploy"
cd "$ROOT_DIR/site"
npx wrangler pages deploy dist
echo ""

echo "Pipeline complete."
