# Current State — Provision

Last updated: 2026-06-20 14:00 UTC

## Repository
- Branch: hermes/win-hackathon-20260620-1400
- Base: origin/main (commit d6c6388)
- Remote: syedahmedkhaderi/provision-usaii-hackathon
- New remote branch: farha-step (friend's latest work)

## What Exists
### Backend (FastAPI + Gemini)
- 6 API routes: /health, /eligibility/check, /roadmap/generate, /report/interpret, /notice/interpret, /recovery/plan
- Deterministic rules engine: eligibility, classify_change, build_roadmap, recovery_plan
- Knowledge base: CA (10 snippets), TX (8 snippets) with real policy citations
- Gemini 2.5 Flash integration with key rotation + fallback
- 121 backend tests (ALL PASSING)
- USDA FY2026 accurate SNAP thresholds
- Input validation on all schemas
- Prompt injection defenses in system prompts

### Frontend (Expo SDK 54, React Native)
- 7 onboarding screens: welcome, state, enrollment, household, income, reporting, changes, complete
- 4 tab screens: home, roadmap, report, scan
- Recovery modal screen
- Settings screen
- Benefits estimator component
- Call script sheet
- Confidence bar, context loading text
- i18n: English + Spanish
- All return-null white screens fixed → loading views
- TypeScript: compiles clean
- Safe area insets on all screens

### Infrastructure
- Dockerfile + Render deployment config
- EAS build config (frontend/eas.json)
- setup.sh + start.sh
- scripts/qa/run_all.sh

### Tests
- 121 backend tests: ALL PASS
- No frontend tests yet (jest-expo not installed)
- No E2E tests

## What Works
- Backend API fully functional
- All routes return disclaimers + citations
- Deterministic rules protected from LLM override
- Prompt injection doesn't remove safeguards
- No API key leakage
- Input validation blocks hostile payloads
- SNAP thresholds match USDA FY2026 exactly

## What's Missing
- Frontend tests (jest-expo not set up)
- Devpost submission materials
- Demo script
- AI architecture documentation
- Responsible AI statement document
- Pitch video script
- Accessibility testing
- E2E test plan
- No demo seed data for judges

## Known Risks
- Frontend has no tests — can't verify screen rendering
- No offline demo fallback documented
- Recovery screen disclaimer was added but needs verification on merged main
- Elderly/disabled eligibility bypass is a known simplification (no net income test)
- classify_change keyword ordering is fragile (substring matching, not word boundary)
