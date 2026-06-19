# Provision

Provision is an AI assisted SNAP navigation prototype built for the USAII Global AI Hackathon 2026, Undergraduate Track, Challenge 4: Fix Systems People Depend On.

The project focuses on one concrete public system problem: people lose or risk losing food assistance not because they are ineligible, but because reporting rules, deadlines, and official notices are difficult to interpret under stress. Provision turns that confusion into a clear next action.

## 1. Hackathon Fit

This project is aligned to Challenge 4, Direction A: Benefits Navigator.

Provision is not a resource directory. It interprets a user situation, applies state specific SNAP rules, and produces actionable guidance in plain language.

The current MVP is designed for two demo states only.

1. California
2. Texas

The target user is a SNAP recipient who needs fast guidance on reporting obligations, renewal milestones, or notices that may affect benefits.

## 2. Problem Statement

Public benefits systems are operationally complex. Users must understand enrollment cycles, reporting schedules, document requirements, state specific terminology, and time sensitive notices. Under stress, small mistakes can lead to missed deadlines, reduced benefits, or case closure.

For many users, the failure mode is not lack of effort. The failure mode is system opacity.

Provision addresses that gap by helping a user answer three practical questions:

1. What is my next benefits deadline
2. Do I need to report this change
3. What does this notice mean, and what should I do now

## 3. Product Summary

Provision is a mobile first Expo application with a clean decision support flow. The interface is intentionally simple, high contrast, and low friction because the user context is time pressure and uncertainty.

The product experience is organized into five core jobs:

1. Capture a basic user profile during onboarding
2. Compute a benefits roadmap from deterministic state rules
3. Interpret life changes with AI and recommend reporting next steps
4. Read photographed notices and explain them in plain language
5. Generate a recovery roadmap when the case appears at risk

## 4. Frontend Experience

### Onboarding

The onboarding flow collects only the minimum context required to personalize guidance:

1. State
2. Approximate enrollment or recertification date
3. Household size
4. Reporting type
5. Recent change or active issue

This structure reduces cognitive load while still giving the app enough context to compute deadlines and frame AI responses.

### Home Dashboard

The dashboard communicates status at a glance. It shows:

1. A current risk banner
2. A visual journey timeline
3. Upcoming deadlines
4. Quick actions for reporting a change or scanning a notice
5. A recovery entry point when the case looks high risk

This screen is the operational center of the MVP. It converts abstract program rules into a visible timeline.

### Report a Change

The reporting screen lets the user describe a life event in plain language, such as a new job or a household change. The AI classifies the event, estimates whether it likely needs to be reported, explains the reasoning, and recommends a next step.

The output is framed carefully as guidance, not as a final eligibility determination.

### Scan a Notice

The notice scanning flow accepts a photographed letter or an uploaded image. The AI identifies the document type, explains what it means in simple language, highlights time sensitivity, and presents options the user can act on immediately.

This feature is important for the challenge because public systems often fail at document readability, not only at rule complexity.

### Recovery Roadmap

When the user may have missed a reporting event or received an adverse notice, Provision generates a recovery timeline. The screen explains what typically happens next, when a fair hearing may be requested, and how to prepare a hearing request letter.

This is a strong fit for the hackathon brief because it supports action under stress rather than passive information display.

## 5. AI and System Design

Provision uses a hybrid design. Deterministic logic handles known program rules. AI handles interpretation and language simplification.

### Deterministic Layer

The rule engine contains state specific SNAP logic for California and Texas, including:

1. Reporting defaults
2. Recertification periods
3. Interim reporting requirements
4. Required documents
5. Fair hearing windows
6. Helpline contacts

This layer computes deadline cards, roadmap milestones, and a rule based risk score.

### AI Layer

The OpenAI integration performs three bounded tasks:

1. Change interpretation
2. Notice explanation from an image
3. Recovery timeline generation

Each prompt is constrained to structured JSON output. The model is instructed to avoid definitive qualification claims, surface uncertainty, and recommend verification with a caseworker.

### End to End Flow

1. User provides profile context
2. Rule engine computes deadlines and risk state
3. User submits a change or notice
4. AI interprets the case within the state context
5. App returns a plain language explanation and a concrete next step

## 6. Responsible AI Design

Challenge 4 requires one realistic risk, one concrete mitigation, and one human in the loop boundary. Provision addresses all three directly.

### Primary Risk

The main risk is over reliance. A user may treat the app output as a final benefits determination and delay contact with the agency.

### Mitigation

Provision reduces that risk through product language and workflow design:

1. It never frames outcomes as guaranteed eligibility
2. It uses guidance language such as likely, may, and verify
3. It shows a direct caseworker or helpline contact
4. It lowers confidence on ambiguous or high stakes cases
5. It routes complex situations toward human confirmation

### Human in the Loop Boundary

Provision does not make the final decision on eligibility, benefit amount, case closure, or legal outcome. Those decisions remain with the agency and the user’s caseworker because they require official records, formal policy interpretation, and due process.

## 7. Why This Fits the Judging Rubric

### Problem Understanding

The product is narrowly scoped to one real public service system, one concrete user stress case, and one high frequency failure mode: missing or misunderstanding SNAP process requirements.

### AI Reasoning

AI is used for interpretation, simplification, and next step recommendation. It is not used as vague decoration and it is not presented as autonomous decision making.

### Solution Design

The system has a clear path from input to output:

1. Profile input
2. Rule computation
3. AI interpretation
4. Actionable guidance

### Impact

The intended impact is procedural retention. If users understand what changed, what a notice means, and what deadline is next, they are less likely to lose access because of avoidable administrative friction.

### Responsible AI

Risk, mitigation, and human oversight are explicit in both the prompts and the interface copy.

## 8. Current MVP Scope

This is a focused hackathon prototype, not a production benefits platform.

Current boundaries:

1. California and Texas only
2. SNAP only
3. Demo level rule coverage
4. No agency system integration
5. No OCR pipeline outside model vision input
6. No final legal or eligibility determination

These boundaries are intentional. They keep the solution specific, defensible, and appropriate for a one week build window from June 14, 2026 to June 21, 2026.

## 9. Technical Stack

1. Expo
2. React Native
3. Expo Router
4. TypeScript
5. AsyncStorage for local persistence
6. OpenAI API for structured reasoning and vision analysis

The frontend is implemented in `provision/` and the official challenge materials are stored in `hackathon-context/`.

## 10. Repository Structure

1. `hackathon-context/`
   Official USAII challenge notes, kickoff material, and submission references
2. `provision/app/`
   App routes, onboarding screens, tabs, and recovery flow
3. `provision/components/`
   Reusable UI and screen level components
4. `provision/constants/`
   Design tokens and deterministic SNAP rules
5. `provision/context/`
   Global profile state, deadline state, and risk state
6. `provision/services/`
   Rule engine, storage, and OpenAI service calls
7. `provision/types/`
   Shared TypeScript models

## 11. Local Run

### Requirements

1. Node.js
2. npm
3. Expo CLI through `npx expo`
4. An OpenAI API key

### Environment

Create an `.env` file inside `provision/` with:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

### Commands

```bash
cd provision
npm install
npm start
```

Then open the app in Expo Go, an iOS simulator, or an Android emulator.

## 12. Demo Narrative

For a 3 to 5 minute hackathon demo, the strongest path is:

1. Start with a SNAP user in California or Texas
2. Complete onboarding in under one minute
3. Show the deadline roadmap and risk banner
4. Enter a realistic change such as a new part time job
5. Scan a sample notice and show the plain language explanation
6. Open the recovery roadmap to show the responsible AI boundary and human referral path

This sequence maps directly to the judges’ lens: a real person, a real system, a clear AI supported next step.

## 13. Submission Positioning

This project should be presented on Devpost as:

1. Track: Undergraduate
2. Challenge: Challenge 4, Fix Systems People Depend On
3. Direction: Benefits Navigator
4. User: SNAP recipient navigating deadlines, reporting, and official notices
5. Decision impact: confusion to clarity, then clarity to action

## 14. Core Claim

Provision does not attempt to replace a caseworker.

Provision helps a user understand what is happening, what may matter, and what to do next before a preventable administrative mistake becomes a benefits crisis.
