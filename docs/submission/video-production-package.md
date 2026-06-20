# Pitch Video Production Package — Provision

## Video Specs
- Duration: 3:00-5:00 minutes
- Format: 16:9 (1280x720 minimum)
- Required by Devpost: (1) Problem and user, (2) How AI works, (3) Walkthrough, (4) Responsible AI

## Recording Setup
- Screen recording: phone screen via Expo Go (or Android emulator)
- Voiceover: separate audio track, clear microphone
- Optional: face cam in corner
- Tools: OBS Studio (free), QuickTime (Mac), or any screen recorder

---

## VOICEOVER SCRIPT (4:00 target)

### [0:00-0:25] PROBLEM
"Every month, thousands of SNAP recipients in California and Texas lose benefits they actually qualify for. Not because their income changed. Because they missed a deadline they didn't understand. A SAR-7 form arrives and looks like junk mail. A notice uses language no stressed parent has time to decode. The system depends on people understanding paperwork under pressure — and when they don't, they lose food assistance."

### [0:25-0:45] INTRODUCING PROVISION
"Provision is a mobile app that turns SNAP confusion into a clear next action. Built for California CalFresh and Texas SNAP recipients, it helps people understand deadlines, interpret notices, decide whether changes need reporting, and recover when benefits are at risk."

### [0:45-1:30] DEMO — ONBOARDING + HOME
*[Screen record: app opens, onboarding flows]*
"Meet Maria. She's a single parent in Los Angeles with a part-time job and CalFresh benefits for her family of three. She opens Provision and completes a 30-second onboarding — her state, enrollment date, household size, and income. Immediately, her Home screen shows the next deadline — the SAR-7 — computed from her enrollment date using official USDA calendar rules. No guessing."

### [1:30-2:15] DEMO — REPORT A CHANGE
*[Screen record: report screen, typing, result]*
"Maria got a raise. She doesn't know if she needs to report it. She opens the Report tab and types: 'I got a raise at work, making $600 more per month.' Provision's AI, grounded in official CalFresh policy snippets, tells her: 'You likely need to report this within 10 days.' It shows the citation — CalFresh Policy Manual section 63-503.44 — a confidence bar, and a disclaimer: guidance only, not legal advice. It even generates a call script for her caseworker."

### [2:15-2:50] DEMO — SCAN + RECOVERY
*[Screen record: scan screen, notice interpretation]*
"If Maria receives a letter she doesn't understand, she can photograph it or type the text. Provision reads it and explains: 'This is a termination notice. You have 90 days to request a fair hearing.' If benefits are at risk, the Recovery screen shows ordered steps — submit the form, call the caseworker, request a hearing — and generates a copy-paste hearing request letter addressed to the County Hearing Office."

### [2:50-3:30] AI ARCHITECTURE
*[Screen record: architecture diagram or README]*  
"Provision uses a hybrid architecture. A deterministic rules engine computes all hard numbers — income thresholds from USDA FY2026 tables, deadline dates, benefit ranges. Gemini 2.5 Flash writes the plain-language explanations, grounded in retrieved policy snippets. The AI never sets a threshold or deadline — those come from code. The AI never makes a final eligibility determination — that's the caseworker's job."

### [3:30-4:00] RESPONSIBLE AI + CLOSING
"Every output includes citations, a disclaimer, and the caseworker phone number. The app uses 'you may qualify' — never 'you qualify.' If Gemini is unavailable, every screen degrades safely to deterministic rules. 127 automated tests verify that SNAP thresholds match USDA published values and that prompt injection can't remove disclaimers. Provision helps people go from confusion to clarity to action — before benefits are disrupted. That's the difference between food on the table and going hungry."

---

## SHOT LIST

| Time | Shot | Duration | Notes |
|---|---|---|---|
| 0:00 | Problem text overlay / B-roll | 25s | Stock footage or text card |
| 0:25 | App logo / title card | 5s | "Provision: SNAP Benefits Navigator" |
| 0:30 | Phone screen: onboarding | 45s | Record Expo Go, show each step |
| 1:15 | Phone screen: home dashboard | 15s | Highlight deadline + risk |
| 1:30 | Phone screen: report typing | 20s | Type the raise text |
| 1:50 | Phone screen: result appears | 25s | Show category, deadline, citation |
| 2:15 | Phone screen: scan | 20s | Type or photograph notice |
| 2:35 | Phone screen: recovery | 15s | Show steps + copy letter |
| 2:50 | Architecture diagram | 20s | Show ai-architecture.md or custom |
| 3:10 | Code/test snippet | 20s | Show pytest output, test file |
| 3:30 | Responsible AI summary | 15s | Text cards with safeguards |
| 3:45 | Closing | 15s | "From confusion to action" |

## TIMING TABLE

| Section | Target | Max |
|---|---|---|
| Problem | 0:25 | 0:30 |
| Product intro | 0:15 | 0:20 |
| Onboarding demo | 0:45 | 1:00 |
| Report demo | 0:45 | 1:00 |
| Scan + Recovery | 0:35 | 0:45 |
| AI Architecture | 0:40 | 1:00 |
| Responsible AI + Close | 0:30 | 0:40 |
| **TOTAL** | **3:35** | **4:45** |

## BACKUP: 60-SECOND EMERGENCY PITCH

"Provision is a SNAP benefits navigator for California and Texas. It helps recipients who depend on food assistance understand deadlines, interpret confusing notices, and know whether life changes need reporting — before a procedural mistake causes benefit loss. The app uses a hybrid architecture: deterministic rules for all hard numbers from USDA FY2026, with Gemini AI for plain-language explanations grounded in real policy sources. Every output includes citations, disclaimers, and a caseworker referral. The AI never makes a final eligibility decision — that's the human caseworker's role. 127 automated tests verify accuracy against USDA published values. Provision helps people go from confusion to action before benefits are disrupted."

## RECORDING CHECKLIST
- [ ] Phone screen recording tool ready
- [ ] Microphone tested
- [ ] App demo flow rehearsed (use demo-script.md)
- [ ] Backend running and health verified
- [ ] Gemini key active
- [ ] Architecture diagram or README visible
- [ ] Test terminal open for pytest screenshot
- [ ] Quiet room for voiceover
- [ ] Export as MP4 1280x720 or higher
