#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# ── Colours ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
step() { echo -e "\n${BOLD}$1${NC}"; }

echo -e "${BOLD}Provision — setup${NC}"
echo "────────────────────────────────────────"

# ── 1. Prerequisites ───────────────────────────────────────────────────────────
step "Checking prerequisites"

command -v python3 >/dev/null 2>&1 || err "python3 not found. Install Python 3.10+."
PY_MINOR=$(python3 -c 'import sys; print(sys.version_info.minor)')
[ "$PY_MINOR" -ge 10 ] || err "Python 3.10+ required (found 3.$PY_MINOR)."
ok "Python $(python3 --version | cut -d' ' -f2)"

command -v node >/dev/null 2>&1 || err "node not found. Install Node 18+."
ok "Node $(node --version)"

command -v npm >/dev/null 2>&1 || err "npm not found."
ok "npm $(npm --version)"

# ── 2. Backend ─────────────────────────────────────────────────────────────────
step "Setting up backend"

cd "$BACKEND"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  ok "Created .venv"
else
  ok ".venv already exists"
fi

.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt
ok "Backend dependencies installed"

if [ ! -f ".env" ]; then
  cp .env.example .env
  warn ".env created from .env.example — add your GEMINI_API_KEYS before starting"
else
  ok ".env already exists"
fi

# ── 3. Frontend ────────────────────────────────────────────────────────────────
step "Setting up frontend"

cd "$FRONTEND"

npm install --silent
ok "Frontend dependencies installed"

# Detect LAN IP (works on macOS and Linux)
LAN_IP=""
if command -v ipconfig >/dev/null 2>&1; then
  LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
fi
if [ -z "$LAN_IP" ] && command -v hostname >/dev/null 2>&1; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
fi
if [ -z "$LAN_IP" ]; then
  LAN_IP="192.168.x.x"
  warn "Could not detect LAN IP — edit frontend/.env and set EXPO_PUBLIC_API_BASE_URL manually"
fi

if [ ! -f ".env" ]; then
  echo "EXPO_PUBLIC_API_BASE_URL=http://${LAN_IP}:8000" > .env
  ok "frontend/.env created: EXPO_PUBLIC_API_BASE_URL=http://${LAN_IP}:8000"
else
  ok "frontend/.env already exists ($(cat .env | grep EXPO_PUBLIC_API_BASE_URL || echo 'check it'))"
fi

# ── 4. Done ─────────────────────────────────────────────────────────────────────
cd "$ROOT"

echo ""
echo -e "${GREEN}${BOLD}Setup complete.${NC}"
echo "────────────────────────────────────────"
echo -e "${BOLD}Start the backend${NC} (terminal 1):"
echo "  cd backend && .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo -e "${BOLD}Start Expo${NC} (terminal 2):"
echo "  cd frontend && npx expo start"
echo ""
echo "Then scan the QR code with Expo Go on your phone."
if [ "$LAN_IP" != "192.168.x.x" ]; then
  echo -e "Backend URL on device: ${YELLOW}http://${LAN_IP}:8000${NC}"
fi
echo "────────────────────────────────────────"
