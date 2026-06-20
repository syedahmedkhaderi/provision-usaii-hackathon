# Final Submission Checklist — Provision

## Devpost Requirements (from challenge brief)

| Requirement | Status | Location |
|---|---|---|
| Qualifier Approval Code | PENDING — need from team email | — |
| Project Description | DONE | docs/submission/devpost-description.md |
| Track & Challenge Selection | DONE | Undergraduate, Challenge 4, Direction A |
| AI Architecture Explanation | DONE | docs/submission/ai-architecture.md |
| Human-in-Loop Design | DONE | docs/submission/responsible-ai.md |
| Responsible AI Guardrail | DONE | docs/submission/responsible-ai.md |
| Tools Used | DONE | docs/submission/tools-and-data-disclosure.md |
| Data Disclosure | DONE | docs/submission/tools-and-data-disclosure.md |
| 3-5 Minute Pitch Video | NOT STARTED — needs recording | docs/submission/demo-script.md ready |
| Working Demo or Walkthrough | READY — Expo Go + backend | docs/submission/demo-script.md |

## Technical Readiness

| Item | Status | Evidence |
|---|---|---|
| Backend compiles | PASS | All Python files compile |
| Backend tests pass | PASS | 122/122 pytest |
| SNAP thresholds accurate | PASS | USDA FY2026 domain accuracy tests |
| Input validation | PASS | Pydantic Field constraints |
| Prompt injection defense | PASS | Untrusted-data framing + tests |
| API key not leaked | PASS | Security tests verify |
| Disclaimer on all routes | PASS | Cross-cutting test verifies |
| Frontend compiles | PASS | tsc --noEmit clean |
| Metro config | DONE | metro.config.js added |
| EAS build config | EXISTS | frontend/eas.json |
| Dockerfile | EXISTS | Dockerfile |
| Render config | EXISTS | .render.yaml |

## Demo Reliability

| Item | Status |
|---|---|
| Expo Go QR code | READY (npx expo start) |
| Backend health check | READY (/health endpoint) |
| Gemini fallback tested | PASS (121 tests mock Gemini off) |
| Demo script | DONE (docs/submission/demo-script.md) |
| Offline fallback | PARTIAL — onboarding + home work offline, AI screens degrade |
| Demo personas documented | DONE (Maria, James, Dana) |

## Responsible AI

| Item | Status |
|---|---|
| "May qualify" not "you qualify" | VERIFIED |
| Disclaimer on every AI screen | VERIFIED |
| Citations with section numbers | VERIFIED |
| Confidence levels displayed | VERIFIED |
| Caseworker phone always shown | VERIFIED |
| Call script provided | VERIFIED |
| Deterministic rules override AI | VERIFIED (test proves) |
| Human-in-loop boundary documented | DONE |

## Known Limitations (disclose honestly)

1. Scoped to CA and TX only — not national
2. Elderly/disabled uses simplified net income test (no shelter deduction)
3. Image OCR depends on Gemini vision API availability
4. No push notifications (deadlines shown in-app only)
5. No user accounts (local storage only)

## REMAINING BEFORE SUBMISSION

1. [ ] Get qualifier approval code from team
2. [ ] Record 3-5 minute pitch video using demo script
3. [ ] Verify Expo Go demo works on fresh device
4. [ ] Test backend deployment on Render
5. [ ] Upload video to YouTube/Vimeo for Devpost link
6. [ ] Fill Devpost form with all fields
