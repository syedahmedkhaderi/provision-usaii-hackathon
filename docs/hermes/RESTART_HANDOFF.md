# Restart Handoff — Provision Hackathon

Last updated: 2026-06-20 14:15 UTC (Cycle 10)

## Mission
Win USAII Hackathon 2026. Maximize winning probability through continuous improvement.

## Current Branch
hermes/win-hackathon-20260620-1400 (based on origin/main d6c6388)
14 commits ahead of main

## PR Status
PR #4 OPEN: https://github.com/syedahmedkhaderi/provision-usaii-hackathon/pull/4

## Work Completed (Cycles 1-10)
1. Created 9 Devpost submission documents
2. Fixed metro.config.js (expo-router couldn't resolve entry)
3. Fixed elderly/disabled eligibility (was bypassing ALL income checks)
4. Added untrusted-data framing to all 4 system prompts
5. Fixed SDK version reference (56→54) in AGENTS.md
6. Recovery plan now branches by state (CA/TX) and situation type
7. Added /demo/scenarios endpoint with 3 judge-ready personas
8. Added testing section to README
9. Accessibility labels on Button, Home, Report, Scan, Recovery
10. Created QA docs: manual checklist, E2E plan, deployment readiness
11. Created video production package with voiceover script
12. Frontend Jest tests: 18 passing (apiClient + snapRules)
13. Fixed frontend SNAP thresholds to USDA FY2026
14. Installed jest-expo with test scripts

## Test Status
- Backend: 127/127 PASS
- Frontend: 18/18 PASS
- Total: 145 tests
- TSC: clean

## Work Remaining (priority order)
1. More accessibility labels on onboarding screens (welcome, state, enrollment, etc.)
2. API contract verification test (frontend types vs backend response)
3. Add snapEngine frontend tests
4. Add storageService frontend tests
5. Add UserContext tests
6. Devpost final review (tighten all written materials)
7. Verify Dockerfile builds locally
8. Add /demo/load endpoint for one-tap demo profile loading
9. Check the ConfidenceBar and CallScriptSheet components for accessibility
10. Add accessibility to BenefitsEstimator component

## Commands
```bash
cd backend && source .venv/Scripts/activate && python -m pytest tests/ -v
cd frontend && npx jest --runInBand --verbose
cd frontend && npx tsc --noEmit
cd frontend && npx expo start
```

## Do Not Repeat
- Do NOT kill node processes with taskkill (user denied)
- Do NOT push to main
- Do NOT change colors (friend chose sage/amber palette)
- Do NOT work on stale main — always fetch first
- Do NOT install jest@30 (incompatible with jest-watch-typeahead in jest-expo)
