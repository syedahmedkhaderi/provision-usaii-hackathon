# Demo Script — Provision (3-5 minutes)

## Setup
- Phone with Expo Go installed, same WiFi as dev machine
- Backend running (or Render deployment active)
- Expo dev server running: `npx expo start`
- Scan QR code → app opens

## Persona
Maria, single parent, Los Angeles, part-time worker, CalFresh recipient

## Flow (4:30 target)

### 0:00-0:25 — Problem Statement
"Thousands of SNAP recipients lose benefits every month — not because they don't qualify, but because they miss procedural deadlines. A form looks like junk mail. A notice is incomprehensible. Under stress, people freeze. Provision fixes this."

### 0:25-0:50 — Onboarding
Open app → "Welcome to Provision"
- Tap "Get Started"
- Select California → Continue
- Enrollment date: scroll to "March 2026" → Continue
- Household: 3 people → Continue
- Income: $1,200/month → Continue
- Reporting: SAR-7 → Continue
- Changes: "Got a raise" → Continue
- Complete → "You're all set"

### 0:50-1:30 — Home Dashboard
"The Home screen immediately shows Maria what matters:
- Risk level: Medium (because she has a pending change)
- Next deadline: SAR-7 due in X days (deterministic computation)
- Quick actions: Report a change, Scan a notice
- Her benefits estimate based on USDA FY2026 thresholds"

### 1:30-2:30 — Report a Change
"Maria got a raise. She doesn't know if she needs to report it."
- Tap "Report" tab
- Type: "I got a raise at work, making $600 more per month"
- Tap "Check"
- Loading: "Reviewing official rules..."
- Result:
  - Category: Income Increase
  - "You likely need to report this within 10 days"
  - Confidence bar shown
  - Citations: CalFresh Policy Manual §63-503.44
  - Disclaimer: "Guidance only. Not legal advice."
  - Call script: "Hi, my name is [NAME]. My case number is [NUMBER]. I'm calling to report an income change..."

### 2:30-3:15 — Scan a Notice (if AI available)
"Maria received a letter from the county. She can't understand it."
- Tap "Scan" tab
- Type or paste notice text (if no camera): "Your CalFresh benefits will be discontinued for failure to submit your SAR-7."
- Result:
  - Type: Termination Notice
  - "Your benefits may stop. Here's what you can do."
  - Options: Call caseworker, Request fair hearing
  - Deadline: 90 days to request hearing
  - Citations shown

### 3:15-3:45 — Recovery
"Benefits are at risk. What happens now?"
- Recovery screen opens (from risk banner on home)
- Steps: Call caseworker → Gather documents → Request fair hearing → Reapply if needed
- Fair hearing letter generated: tap "Copy" → ready to send
- Disclaimer present

### 3:45-4:15 — Responsible AI
"Provision doesn't decide if Maria qualifies. The county does. Every AI output shows citations, disclaimers, and a caseworker phone number. Hard numbers come from deterministic code — not from the AI. The AI only explains."

### 4:15-4:30 — Closing
"Provision helps Maria go from confusion to clarity to action — before benefits are disrupted. That's the difference between food on the table and going hungry."

## Fallback Plan
If AI is unavailable:
- Report screen still works: deterministic classification shows the category, deadline (10 days), and caseworker phone
- Scan screen shows fallback: "We couldn't interpret this notice. Call your caseworker at [number]."
- Recovery screen works fully offline (pure rules engine)

If network fails:
- All screens show cached or deterministic data
- Onboarding and home work fully offline
