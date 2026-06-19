# Provision

SNAP benefits navigator built for the USAII Global AI Hackathon 2026 — Undergraduate Track, Challenge 4: Fix Systems People Depend On.

Provision helps SNAP recipients understand deadlines, interpret notices, and know whether a life change needs to be reported — before a procedural mistake turns into a benefits disruption.

---

## What it does

| Screen | What it solves |
|---|---|
| **Onboarding** | Collects state, enrollment date, household size, and recent changes |
| **Home** | Shows risk level, upcoming deadlines, and quick-action cards |
| **Roadmap** | Full SAR-7 / recertification timeline with documents and consequences |
| **Report** | "Do I need to report this change?" — AI interprets plain-language input |
| **Scan** | "What does this notice mean?" — AI reads a photographed SNAP letter |
| **Recovery** | Recovery steps + a fair-hearing request letter when benefits are at risk |

Demo scope: **California** (CalFresh / SAR) and **Texas** (SNAP / QR).

---

## Architecture

```
Expo / React Native (iOS + Android)
        │  JSON over LAN HTTP
        ▼
FastAPI  (backend/main.py)
  ├─ llm_client.py  — Gemini key rotation, cache, backoff
  ├─ prompts.py     — system prompts for each AI flow
  └─ inline SNAP rules for CA + TX
        │  HTTPS
        ▼
Google Gemini 2.5 Flash
```

**Hybrid AI design** — deterministic rules own hard thresholds and dates; Gemini writes the plain-language explanation and classifies free-text input. The LLM never invents a deadline on its own.

**Degradation** — every AI route has a deterministic fallback. If all Gemini keys are exhausted, the app keeps working and shows a banner instead of crashing.

---

## Stack

- **Frontend**: Expo SDK 54, React Native 0.81, expo-router v6, TypeScript 5.8, AsyncStorage
- **Backend**: FastAPI, Python 3.11+, httpx, pydantic, python-dotenv
- **AI**: Google Gemini 2.5 Flash — 12-key rotation, SHA-256 prompt cache, 10-minute backoff

---

## Repo layout

```
provision-usaii-hackathon/
├── backend/
│   ├── main.py           FastAPI routes
│   ├── llm_client.py     Gemini rotator + JSON helper
│   ├── prompts.py        system prompts
│   ├── requirements.txt
│   ├── .env              create this (never committed)
│   └── .env.example      template
├── frontend/
│   ├── app/              expo-router screens
│   ├── components/       UI components
│   ├── services/         apiClient, llmService, snapEngine
│   ├── constants/        colors, typography, spacing, snapRules
│   ├── context/          UserContext (AsyncStorage)
│   ├── types/            TypeScript interfaces
│   ├── .env              create this (never committed)
│   └── .env.example      template
└── hackathon-context/    challenge briefs and reference material
```

---

## Run locally

### 1 — Backend

```bash
cd backend

# First time only
pip install -r requirements.txt

# Copy the template and add your Gemini keys
cp .env.example .env
# Edit .env: GEMINI_API_KEYS=key1,key2,...

# Start (replace with your LAN IP — see step 2)
uvicorn main:app --host 0.0.0.0 --port 8000
```

Verify: `curl http://localhost:8000/health`
Expected: `{"status":"ok","gemini_available":true}`

### 2 — Frontend

Expo Go runs on your **phone**, not your laptop, so `localhost` will not work — you need your laptop's LAN IP.

```bash
# Find your LAN IP (macOS)
ipconfig getifaddr en0
# e.g. 192.168.1.42
```

```bash
cd frontend

# Copy template and set your LAN IP
cp .env.example .env
# Edit .env: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:8000

# First time only
npm install --legacy-peer-deps

# Start
npx expo start
```

Scan the QR code in **Expo Go** (iOS or Android). Phone and laptop must be on the same Wi-Fi.

---

## Demo path

1. Complete onboarding (state → enrollment date → household → reporting type → recent change)
2. View the deadline roadmap on the Roadmap tab
3. On Report tab: type *"I started a part-time job making $600 a month"*
4. On Scan tab: photograph or upload a SNAP notice
5. Open the Recovery modal from the Home screen

---

## Responsible AI

- All AI answers use hedged language ("you may need to", "this typically means")
- Low-confidence answers surface a caseworker phone number instead of a verdict
- Every response includes a disclaimer and citations from real policy sources
- The app never makes a final eligibility determination or legal decision
- Gemini keys live only on the backend — the client never sees them
