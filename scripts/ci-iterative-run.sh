#!/usr/bin/env bash
set -euo pipefail
ITERATIONS=${1:-7}
PROJECT_ROOT="$(pwd)"
mkdir -p logs
for i in $(seq 1 $ITERATIONS); do
  itlog="logs/iteration-$i"
  mkdir -p "$itlog"
  echo "=== ITERATION $i ===" | tee "$itlog/iteration-$i.stdout.log"
  npm ci 2>&1 | tee "$itlog/npm-ci.log"
  if ! npm run lint 2>&1 | tee "$itlog/npm-lint.log"; then
    npm run format 2>&1 | tee "$itlog/npm-format.log" || true
    npx eslint --fix . 2>&1 | tee "$itlog/eslint-fix.log" || true
  fi
  npm test 2>&1 | tee "$itlog/npm-test.log" || true
  npm run build 2>&1 | tee "$itlog/npm-build.log"
  node api/server.js > "$itlog/api.stdout.log" 2> "$itlog/api.stderr.log" &
  API_PID=$!
  # wait for health
  for j in {1..30}; do
    if curl -sS http://localhost:4000/api/health | grep -q '"status":"ok"'; then break; fi
    sleep 1
  done
  npx playwright install --with-deps 2>&1 | tee "$itlog/playwright-install.log"
  npx playwright test 2>&1 | tee "$itlog/playwright-test.log" || true
  node tests/axe-runner.js 2>&1 | tee "$itlog/axe.log" || true
  if command -v lhci >/dev/null 2>&1; then
    lhci autorun 2>&1 | tee "$itlog/lhci.log" || true
  fi
  npm audit --audit-level=high 2>&1 | tee "$itlog/npm-audit.log" || npm audit fix --force 2>&1 | tee "$itlog/npm-audit-fix.log" || true
  kill $API_PID || true
done