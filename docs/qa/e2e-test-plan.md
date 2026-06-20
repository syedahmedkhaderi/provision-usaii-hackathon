# E2E Test Plan — Provision (Maestro + Manual)

## Maestro Flow: CA Onboarding → Report → Scan → Recovery

```yaml
# e2e/maestro/ca-full-journey.yaml
appId: host.exp.Exponent  # Expo Go
---
- launchApp
# Wait for Expo Go to load
- waitForVisible:
    text: ".*"
    timeout: 10000

# Note: For Expo Go, the app URL must be entered manually first
# Maestro flows work best with a built APK. For Expo Go, use manual QA checklist.
```

## Expo Go Manual E2E — CA Happy Path

### Step 1: Launch
1. Open Expo Go on phone
2. Enter `exp://<DEV_MACHINE_IP>:8081`
3. Wait for bundle to load (3-5 seconds)

### Step 2: Onboarding (CA, 3-person household)
1. Tap "Get Started"
2. Tap "California" → Tap "Continue"
3. Scroll month picker to "March" → Tap "Continue"
4. Tap "+" to set household to 3 → Tap "Continue"
5. Type "1800" in income → Tap "Continue"
6. Tap "Continue" on reporting (auto SAR-7)
7. Tap "Got a raise" chip → Type "making $600 more" → Tap "Continue"
8. Tap "Done"

**Expected:** Home screen appears with:
- "Maria" or generic greeting
- Deadline: SAR-7 due (computed from enrollment)
- Risk: Medium (has pending change)
- Quick actions visible

### Step 3: Report a Change
1. Tap "Report a change"
2. Type: "I got a raise at work, making $600 more per month"
3. Tap "Check"
4. Wait for loading (2-5 seconds)

**Expected:**
- Category: Income Increase
- "You likely need to report this within 10 days"
- Confidence bar visible
- "How we got this answer" expandable
- Disclaimer visible
- "Prepare for my call" button (if AI available)

### Step 4: Scan a Notice
1. Tap "Scan" tab
2. Type notice text: "Your CalFresh benefits will be discontinued for failure to submit your SAR-7."
3. Tap "Analyze"

**Expected:**
- Type: Termination
- Plain-language explanation
- Options: Call caseworker, Request fair hearing
- Deadline: 90 days
- Disclaimer visible

### Step 5: Recovery
1. Go to Home → tap risk banner (if shown)
2. Recovery screen opens

**Expected:**
- Steps: Submit missed form → Gather documents → Request fair hearing → Reapply
- Fair hearing letter visible
- "Copy" button works
- State-specific: "County Hearing Office" for CA

## Expo Go Manual E2E — TX Happy Path
Same flow but:
- Select Texas
- Household: 2
- No SAR-7 (TX uses QR-7)
- Recovery shows "HHSC" not "County Hearing Office"

## Failure Recovery
- If Expo Go won't connect: kill app, reopen, re-enter URL
- If backend down: app shows cached data, AI screens show fallback
- If Gemini down: all screens work with deterministic fallback
- If white screen: pull down to reload in Expo Go

## APK Build Path (More Reliable for Demo)
```bash
cd frontend
eas build --platform android --profile preview
# APK download link from EAS
```
Use APK for live demo — more reliable than Expo Go.
