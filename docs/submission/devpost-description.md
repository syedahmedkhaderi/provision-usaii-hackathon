# Devpost Project Description — Provision

## Project Title
Provision: AI-Powered SNAP Benefits Navigator

## Track & Challenge
Undergraduate Track, Challenge 4: Fix Systems People Depend On (Direction A: Benefits Navigator)

## Problem

Every month, thousands of SNAP recipients in California and Texas lose benefits they qualify for — not because their situation changed, but because they missed a procedural deadline. A SAR-7 form arrives and looks like junk mail. A notice says "recertification required" in language no stressed parent has time to decode. A job change happens and nobody knows if it needs reporting. The system depends on people understanding paperwork under pressure.

The problem isn't eligibility. The problem is navigation. SNAP is a system people depend on for food security, and its procedural complexity causes preventable benefit loss precisely for the people it's designed to help.

## Who It Helps

Maria is a single parent in Los Angeles working part-time. She receives CalFresh benefits. She got a raise at work, and a letter from the county she doesn't understand. She has 10 days to report the income change, but she doesn't know that. She's afraid that if she reports it, she'll lose benefits. She's afraid that if she doesn't, she'll get in trouble. She's paralyzed.

Provision is built for Maria — and for James in Houston who missed his quarterly report, and for Dana in Sacramento whose benefits were terminated and doesn't know she can request a fair hearing within 90 days.

## What Provision Does

Provision turns SNAP confusion into a clear next action. It's a mobile app that:

1. **Guides onboarding** — collects state, enrollment date, household size, income, reporting type
2. **Shows deadlines** — SAR-7 (CA), QR-7 (TX), recertification dates computed from enrollment
3. **Interprets life changes** — user describes a change in plain language, AI classifies whether it must be reported and by when
4. **Decodes notices** — user photographs or types a notice, AI explains what it means and what to do
5. **Recovers from disruption** — if benefits are at risk, shows recovery steps, fair hearing timeline, and generates a hearing request letter

Every output includes citations to actual policy sources, a disclaimer that it's guidance not legal advice, and the caseworker phone number.

## Why AI Is Necessary

A static benefits directory can't interpret "my roommate moved out and I got a raise." It can't read a scanned termination notice and extract the deadline. It can't explain why a SAR-7 matters in plain language specific to the user's situation.

Provision uses AI for interpretation — turning unstructured, stressful input into structured, actionable understanding. But hard numbers (income thresholds, deadlines, benefit ranges) are computed deterministically by the rules engine. AI explains; the rules engine decides.

## AI Architecture Explanation

**Inputs:**
- User profile: state, enrollment date, household size, income, reporting type
- Life change description (plain text) OR notice text/photograph
- Official rule snippets retrieved from the knowledge base

**AI Capability:** Natural language understanding + retrieval-augmented generation

**Processing:**
1. User input → deterministic rules engine computes hard numbers (FPL thresholds, deadlines, benefit ranges)
2. Rule snippets retrieved via keyword overlap from state-specific knowledge base (CA: 10 snippets, TX: 8 snippets with real policy citations)
3. Gemini 2.5 Flash generates plain-language explanation grounded ONLY in retrieved snippets
4. System merges: deterministic values override AI values on all hard numbers
5. Confidence assessment: low confidence routes user to caseworker

**Outputs:**
- Plain-language explanation of what to do
- Classification (report / don't report / confirm with caseworker)
- Deadline (days, from deterministic calculation)
- Citations (actual policy section numbers)
- Call script (what to say when calling the caseworker)
- Disclaimer (guidance only, not legal advice)

The AI never sets eligibility thresholds, deadlines, or benefit amounts. Those come from USDA FNS FY2026 published values, hardcoded and tested against authoritative sources.

## Human-in-the-Loop Design

**Decision the AI does NOT make: Final eligibility determination.**

Provision uses "you may qualify" and "likely eligible" — never "you qualify." The county caseworker or state benefits agency makes all final decisions about eligibility, benefit amounts, notices, and appeals. Provision helps the user understand, prepare, and act — but the human caseworker remains the decision-maker.

This boundary exists because an AI cannot verify income documentation, confirm household composition, or adjudicate disputes. Pretending it could would create over-reliance risk and potential harm to vulnerable users.

## Responsible AI Guardrail

**Risk:** A user may over-rely on an AI explanation and miss a deadline or misunderstand their eligibility — causing the exact benefit loss the app is trying to prevent.

**Mitigation:** Provision keeps all hard numbers (income thresholds, deadlines, benefit ranges) in deterministic code, tested against USDA FY2026 source values. Gemini only writes plain-language explanations from retrieved policy snippets. Outputs use cautious wording, show citations with section numbers, include disclaimers on every AI screen, display confidence levels, and route low-confidence or urgent cases to the caseworker with a pre-generated call script. The app never makes a final eligibility, legal, or benefits decision.

## Tools Used

- **Gemini 2.5 Flash** (Google AI Studio, free tier) — plain-language explanation generation
- **FastAPI** (Python) — backend API server
- **React Native / Expo SDK 54** — cross-platform mobile app (iOS + Android)
- **Pydantic** — input validation and schema enforcement
- **Hermes Agent** (Nous Research) — AI coding assistance (fully disclosed)
- **GitHub Copilot CLI** — code generation assistance (fully disclosed)
- All data sources are public government documents (USDA FNS, CalFresh Policy Manual, Texas HHSC FNS Handbook)

## Data Disclosure

- **SNAP income thresholds:** USDA FNS SNAP Income Eligibility Standards, FY2026 (effective Oct 1, 2025 — Sep 30, 2026). Source: https://www.fns.usda.gov/snap/eligibility/income
- **SNAP maximum allotments:** USDA FNS Cost of Living Adjustments, FY2026.
- **CA policy rules:** CalFresh Policy Manual (MPP), CalFresh Handbook, ACL citations
- **TX policy rules:** Texas HHSC FNS Handbook
- **All test scenarios are synthetic** — no real user data is collected, stored, or transmitted.
- **No personal data is sent to Gemini** — only the change description or notice text for interpretation, plus state code and household size for context.

## Demo

The app runs on Expo Go for iOS and Android. Scan a QR code to launch. The backend runs on Render (free tier) with Gemini API integration. A full demo walkthrough is available in the pitch video.

## Limitations

- Scoped to California (CalFresh) and Texas (SNAP) — not national
- Elderly/disabled households use a simplified eligibility check (gross test bypass only; full net income test not implemented)
- Image-based notice interpretation depends on Gemini vision API availability
- Not a replacement for official agency communication
- No user accounts — data stored locally on device via AsyncStorage

## Future Roadmap

- Expand to all 50 states with state-specific rule engines
- Push notifications for deadline reminders
- Direct integration with state benefits portals for form submission
- Multilingual support beyond English/Spanish
- Community organization dashboard for case managers
