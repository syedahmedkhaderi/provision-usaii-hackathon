# Manual QA Checklist — Provision

## Pre-Test Setup
- [ ] Backend running: `cd backend && uvicorn main:app --reload`
- [ ] Health check passes: `curl http://localhost:8000/health` → `{"status":"ok"}`
- [ ] Expo server running: `cd frontend && npx expo start`
- [ ] Phone and computer on same WiFi
- [ ] Expo Go installed on phone

## Onboarding Flow
- [ ] App opens to Welcome screen
- [ ] "Get Started" button is visible and tappable
- [ ] State selection: CA and TX both selectable
- [ ] Enrollment date: month/year pickers scroll
- [ ] Household size: can increase/decrease
- [ ] Income input: numeric keyboard, accepts value
- [ ] Reporting type: auto-set based on state (CA=SAR, TX=QR)
- [ ] Changes screen: chips selectable, text input works
- [ ] Complete screen: shows summary, notifications toggle works
- [ ] Tapping "Done" navigates to Home

## Home Screen
- [ ] Shows user name/state in header
- [ ] Risk level visible (if applicable)
- [ ] Next deadline shown with date and days remaining
- [ ] "Report a change" button navigates to Report tab
- [ ] "Scan a notice" button navigates to Scan tab
- [ ] Benefits estimator shows range (if income provided)
- [ ] Loading state shows if backend is slow

## Roadmap Screen
- [ ] Shows timeline of upcoming deadlines
- [ ] Each step has: title, due date, documents, consequence
- [ ] Status badges: done/urgent/upcoming
- [ ] CA shows SAR-7 + recertification
- [ ] TX shows recertification only

## Report Screen
- [ ] Text input accepts free text
- [ ] Example chips fill the input
- [ ] "Check" button triggers analysis
- [ ] Loading state with rotating messages
- [ ] Result shows: category, must_report, deadline
- [ ] Result shows: reasoning (AI explanation)
- [ ] Result shows: confidence bar
- [ ] Result shows: citations (expandable)
- [ ] Result shows: disclaimer text
- [ ] Call script button opens sheet (if available)
- [ ] "Start over" button clears result
- [ ] Backend unavailable: shows error, not crash

## Scan Screen
- [ ] Camera button opens action sheet
- [ ] Can choose camera or photo library
- [ ] Text input fallback works
- [ ] Analysis shows: notice type, explanation, urgency
- [ ] Options list shows actions
- [ ] Citations and disclaimer present
- [ ] "Scan again" button works
- [ ] Backend unavailable: shows error, not crash

## Recovery Screen
- [ ] Opens from Home risk banner
- [ ] Shows recovery steps
- [ ] Fair hearing letter displayed
- [ ] "Copy" button copies to clipboard
- [ ] Shows "Copied" confirmation
- [ ] Reapply note shown
- [ ] Disclaimer present
- [ ] Back button returns to Home

## Settings Screen
- [ ] Shows current profile info
- [ ] State, household size, enrollment date editable
- [ ] Notifications toggle works
- [ ] Language switch works (EN/ES)
- [ ] "Clear data" resets to onboarding

## Edge Cases
- [ ] Kill backend → app shows cached data, AI screens show fallback
- [ ] Airplane mode → onboarding and home work offline
- [ ] Rapid tab switching → no crashes
- [ ] Type 2000+ chars in report → doesn't lag
- [ ] Empty text in report → handles gracefully
- [ ] Back navigation during loading → no crash

## Gemini Unavailable Simulation
- [ ] Set GEMINI_API_KEY to invalid → health shows gemini_available: false
- [ ] Report still works (deterministic classification)
- [ ] Scan shows fallback message
- [ ] All screens show "AI explanation unavailable" where relevant
