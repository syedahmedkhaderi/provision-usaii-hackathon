# Provision

Provision is an AI assisted SNAP navigation prototype built for the USAII Global AI Hackathon 2026, Undergraduate Track, Challenge 4: Fix Systems People Depend On.

It helps users understand deadlines, reporting obligations, and official notices before a procedural mistake turns into a benefits disruption.

## Hackathon Fit

Challenge 4  
Direction A: Benefits Navigator

Target user:
1. SNAP recipient
2. Caregiver or household member managing benefits
3. User under time pressure, uncertainty, or stress

## What the App Does

1. Builds a personalized SNAP roadmap from state rules
2. Tells the user whether a life change may need to be reported
3. Explains photographed notices in plain language
4. Generates a recovery path when benefits may be at risk

Current demo scope:
1. California
2. Texas

## Product Flow

1. Onboarding collects state, enrollment timing, household size, reporting type, and recent changes
2. The dashboard shows risk, upcoming deadlines, and quick actions
3. The report flow interprets user described changes
4. The scan flow explains notices and next steps
5. The recovery flow outlines what typically happens next and when to contact a human

## AI Architecture

Provision uses a hybrid system.

Deterministic layer:
1. State specific SNAP rules
2. Deadline generation
3. Risk scoring
4. Document and contact references

AI layer:
1. Change interpretation
2. Notice explanation from images
3. Recovery timeline generation

The app uses structured JSON outputs and avoids definitive eligibility claims.

## Responsible AI

Primary risk:
Over reliance on AI guidance in a high stakes public benefits context.

Mitigations:
1. Guidance is framed as likely or may, not guaranteed
2. Low confidence cases are escalated to human follow up
3. Caseworker or helpline contact is shown in key flows
4. The app does not make final eligibility or legal decisions

Human in the loop:
Eligibility, benefit amount, case closure, and legal outcomes remain with the agency and caseworker.

## Stack

1. Expo
2. React Native
3. Expo Router
4. TypeScript
5. AsyncStorage
6. OpenAI API

## Repo Layout

1. `frontend/` application code
2. `hackathon-context/` challenge notes and reference material

## Run Locally

Create `frontend/.env`:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

Run:

```bash
cd frontend
npm install
npm start
```

## Validation

Verified with:

```bash
cd frontend
npx tsc --noEmit
npx expo export --platform web
```

## Demo Path

1. Complete onboarding
2. Show the deadline roadmap
3. Enter a realistic change such as a new job
4. Scan a notice
5. Open the recovery flow

Core claim:
Provision does not replace a caseworker. It helps a user understand what may matter and what to do next.
