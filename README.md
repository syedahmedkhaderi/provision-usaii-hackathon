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
  ├─ schemas.py       — Pydantic request models, state validation
  ├─ rules_engine.py  — deterministic FPL tables, eligibility, deadlines
  ├─ knowledge_base.py — CA/TX policy snippets + keyword retrieval
  ├─ llm_client.py    — Gemini key rotation, SHA-256 cache, backoff
  └─ prompts.py       — system prompts for each AI flow
        │  HTTPS
        ▼
Google Gemini 2.5 Flash
```

**Determinism-first design** — `rules_engine` owns all hard numbers (income thresholds, deadlines, benefit ranges). Gemini only writes the plain-language explanation. The LLM never invents a deadline on its own.

**Graceful degradation** — every AI route returns a safe deterministic answer if all Gemini keys are exhausted. The app never crashes mid-demo.

---

## Stack

- **Frontend**: Expo SDK 54, React Native 0.81, expo-router v6, TypeScript 5.8
- **Backend**: FastAPI, Python 3.10+, httpx, pydantic, python-dotenv
- **AI**: Google Gemini 2.5 Flash — multi-key rotation, SHA-256 prompt cache, 10-minute backoff

---

## Repo layout

```
provision-usaii-hackathon/
├── setup.sh              one-time setup (venv, npm install, .env files)
├── start.sh              start backend + Expo together
├── backend/
│   ├── main.py           FastAPI routes + AI/rules merge logic
│   ├── rules_engine.py   deterministic FPL tables and business rules
│   ├── knowledge_base.py CA/TX policy snippets + keyword retrieval
│   ├── schemas.py        Pydantic request models
│   ├── llm_client.py     Gemini rotator + JSON helper
│   ├── prompts.py        system prompts
│   ├── requirements.txt
│   ├── .env              create via setup.sh (never committed)
│   └── .env.example      template
└── frontend/
    ├── app/              expo-router screens
    │   ├── (tabs)/       home, roadmap, report, scan
    │   ├── onboarding/   7-step onboarding flow
    │   └── recovery.tsx  recovery modal
    ├── components/       UI components
    ├── services/         apiClient, llmService, snapEngine, storageService
    ├── constants/        colors, typography, spacing, snapRules
    ├── context/          UserContext (AsyncStorage)
    ├── types/            TypeScript interfaces
    ├── .env              create via setup.sh (never committed)
    └── .env.example      template
```

---

## Getting started

### Prerequisites

- Python 3.10+
- Node 18+
- [Expo Go](https://expo.dev/go) installed on your phone
- At least one [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 1 — Setup (run once)

```bash
bash setup.sh
```

This creates the Python venv, installs all dependencies, and writes `frontend/.env` with your machine's LAN IP so Expo Go can reach the backend.

Then open `backend/.env` and paste in your Gemini key(s):

```
GEMINI_API_KEYS=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 2 — Start

```bash
bash start.sh
```

Boots the backend on `:8000` and launches Expo in the same terminal. Scan the QR code with **Expo Go** — phone and laptop must be on the same Wi-Fi.

Press `q` or Ctrl+C to stop both.

---

## Demo path

1. Complete onboarding (state → enrollment date → household → issue type → recent change)
2. View the deadline roadmap on the **Roadmap** tab
3. On **Report** tab: type *"I started a part-time job making $600 a month"*
4. On **Scan** tab: photograph or upload a SNAP notice
5. Open the **Recovery** modal from the Home screen

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check + Gemini status |
| `POST` | `/eligibility/check` | Estimate SNAP eligibility and benefit range |
| `POST` | `/roadmap/generate` | Build SAR-7 / recertification timeline |
| `POST` | `/report/interpret` | Classify a life change and determine reporting obligation |
| `POST` | `/notice/interpret` | Explain a SNAP notice in plain language |
| `POST` | `/recovery/plan` | Generate recovery steps and a fair-hearing letter |

Quick smoke test after starting:

```bash
curl http://localhost:8000/health
# {"status":"ok","gemini_available":true}
```

---

## Responsible AI

- All AI answers use hedged language ("you may need to", "this typically means")
- Hard numbers (deadlines, income limits) always come from the rules engine, never from the LLM
- Every response includes a disclaimer and citations from real policy sources
- Low-confidence answers surface a caseworker phone number
- The app never makes a final eligibility determination or legal decision
- Gemini API keys live only on the backend — the client never sees them
