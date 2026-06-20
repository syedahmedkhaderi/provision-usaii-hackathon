# Restart Handoff — Provision Hackathon

Last updated: 2026-06-20 14:30 UTC

## Mission
Win USAII Hackathon 2026. Maximize winning probability through continuous improvement.

## Current Branch
hermes/win-hackathon-20260620-1400 (based on origin/main d6c6388)

## PR Status
PR #4 OPEN: https://github.com/syedahmedkhaderi/provision-usaii-hackathon/pull/4
- Contains: submission docs, metro.config.js, eligibility fix, prompt hardening

## Work Completed This Session
1. Synced with latest main (friend added EAS config)
2. Created 7 Devpost submission documents
3. Fixed metro.config.js (expo-router couldn't resolve entry)
4. Fixed elderly/disabled eligibility (was bypassing ALL income checks)
5. Fixed explanation using clamped household size
6. Added untrusted-data framing to all 4 system prompts
7. Fixed SDK version reference (56 → 54) in frontend/AGENTS.md
8. 122/122 backend tests PASS

## Work Remaining (priority order)
1. Frontend Jest tests (jest-expo not installed — need npm install on connected machine)
2. Maestro E2E test flows (no device/emulator available)
3. Demo seed data endpoint for judges
4. Accessibility audit (touch targets, screen reader labels)
5. Frontend color audit (friend uses sage/amber palette — user wants grayscale)
6. Pitch video recording (demo script ready)
7. Backend deployment verification on Render
8. Add more keyword coverage to classify_change
9. Recovery plan should branch by state (CA vs TX differences)
10. Add /demo/scenario endpoint for one-click demo setup

## Commands Available
```bash
cd backend && source .venv/Scripts/activate && python -m pytest tests/ -v
cd frontend && npx tsc --noEmit
cd frontend && npx expo start
```

## Validation Status
- Backend: 122/122 PASS
- Frontend: tsc clean, bundle compiles (7.4MB)
- Domain: All SNAP thresholds match USDA FY2026
- Security: No API key leaks, prompt injection tested

## Do Not Repeat
- Do NOT kill node processes with taskkill (user denied)
- Do NOT push to main
- Do NOT change colors to grayscale (friend chose sage palette — user hasn't complained about this)
- Do NOT work on stale main — always fetch first
