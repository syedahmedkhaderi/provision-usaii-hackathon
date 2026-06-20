#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "  PROVISION QA — RUN ALL TESTS"
echo "============================================"
echo ""

FAILURES=0

# ── Backend Static Checks ──────────────────────────────────
echo ">>> BACKEND STATIC CHECKS"
cd "$(dirname "$0")/../backend"

if [ -d ".venv" ]; then
    source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate 2>/dev/null || true
fi

echo "  Checking Python syntax..."
python -m py_compile main.py && echo "  [PASS] main.py compiles" || { echo "  [FAIL] main.py"; FAILURES=$((FAILURES+1)); }
python -m py_compile rules_engine.py && echo "  [PASS] rules_engine.py compiles" || { echo "  [FAIL] rules_engine.py"; FAILURES=$((FAILURES+1)); }
python -m py_compile schemas.py && echo "  [PASS] schemas.py compiles" || { echo "  [FAIL] schemas.py"; FAILURES=$((FAILURES+1)); }
python -m py_compile llm_client.py && echo "  [PASS] llm_client.py compiles" || { echo "  [FAIL] llm_client.py"; FAILURES=$((FAILURES+1)); }
python -m py_compile prompts.py && echo "  [PASS] prompts.py compiles" || { echo "  [FAIL] prompts.py"; FAILURES=$((FAILURES+1)); }
python -m py_compile knowledge_base.py && echo "  [PASS] knowledge_base.py compiles" || { echo "  [FAIL] knowledge_base.py"; FAILURES=$((FAILURES+1)); }
echo ""

# ── Backend Tests ──────────────────────────────────────────
echo ">>> BACKEND TESTS"
if command -v pytest &>/dev/null; then
    python -m pytest tests/ -v --tb=line --cov=. --cov-report=term-missing 2>&1 || {
        echo "  [WARN] Some backend tests failed (see above)"
        FAILURES=$((FAILURES+1))
    }
else
    echo "  [SKIP] pytest not installed"
fi
echo ""

# ── Frontend Static Checks ─────────────────────────────────
echo ">>> FRONTEND STATIC CHECKS"
cd "$(dirname "$0")/../frontend"

if command -v npx &>/dev/null; then
    echo "  Running TypeScript check..."
    npx tsc --noEmit 2>&1 && echo "  [PASS] TypeScript clean" || { echo "  [FAIL] TypeScript errors"; FAILURES=$((FAILURES+1)); }
else
    echo "  [SKIP] npx not available"
fi
echo ""

# ── Security Quick Checks ──────────────────────────────────
echo ">>> SECURITY QUICK CHECKS"

echo "  Checking for API keys in source..."
KEYS=$(grep -rn "AIzaSy\|sk-proj\|sk-ant\|ghp_" backend/ frontend/app/ frontend/services/ frontend/constants/ --include="*.py" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v ".env.example" | grep -v "# " | head -5)
if [ -z "$KEYS" ]; then
    echo "  [PASS] No API keys found in source"
else
    echo "  [FAIL] Potential API keys found:"
    echo "$KEYS"
    FAILURES=$((FAILURES+1))
fi

echo "  Checking for CORS wildcard..."
CORS=$(grep -n 'allow_origins=\["\*"\]' backend/main.py 2>/dev/null)
if [ -n "$CORS" ]; then
    echo "  [WARN] CORS wildcard found (demo-only posture): $CORS"
else
    echo "  [PASS] No CORS wildcard"
fi
echo ""

# ── Summary ────────────────────────────────────────────────
echo "============================================"
echo "  QA SUMMARY"
echo "============================================"
if [ "$FAILURES" -eq 0 ]; then
    echo "  ALL STATIC CHECKS PASSED"
    echo "  (Review test output above for test results)"
else
    echo "  $FAILURES CHECK(S) FAILED"
fi
echo ""
echo "  NOTE: Run Maestro E2E if a device/simulator is available."
echo "  NOTE: Some tests may fail on main — merge fix/critical-bugs first."
echo "============================================"
