#!/usr/bin/env bash
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill background jobs when this script exits (Ctrl+C or q in Expo)
cleanup() { kill $(jobs -p) 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "Starting backend on :8000 ..."
(cd "$ROOT/backend" && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000) &

echo "Starting Expo ..."
(cd "$ROOT/frontend" && npx expo start)
