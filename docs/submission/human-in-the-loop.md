# Human-in-the-Loop Design — Provision

## Required by Devpost: One Decision the AI Does NOT Make

**Decision: Final SNAP eligibility determination.**

Provision does not determine whether a user is eligible for SNAP/CalFresh benefits. The county caseworker or state benefits agency makes all final decisions about:

- Whether an application is approved or denied
- The monthly benefit amount
- Whether a reported change affects benefits
- Whether benefits are terminated, reduced, or continued
- Whether a fair hearing request is granted
- Whether an overpayment assessment is correct

## Why a Human Must Remain in Control

An AI cannot:

1. **Verify documentation** — Pay stubs, award letters, lease agreements, and identity documents must be physically or digitally verified by trained staff
2. **Confirm household composition** — Who lives in the home, who buys/prepares food separately, custody arrangements — these require human verification
3. **Adjudicate disputes** — When the agency and recipient disagree about facts, a human hearing officer must weigh evidence
4. **Apply state-specific exceptions** — Categorical eligibility, expedited screening, ABAWD waivers, medical expense deductions, and shelter cost calculations vary by case and require human judgment
5. **Detect fraud or misrepresentation** — Only trained investigators can identify intentional program violations

## What Provision Does Instead

Provision helps the user **prepare** for the human decision:

| Provision's Role | Human's Role |
|---|---|
| Explains what a notice means in plain language | Caseworker determines if the notice is correct |
| Says "you likely need to report this within 10 days" | Caseworker receives the report and processes it |
| Shows upcoming deadlines | Caseworker/agency sends official deadlines |
| Generates a fair hearing letter template | Hearing officer reviews and rules on the appeal |
| Estimates benefit range from USDA tables | Agency calculates exact benefit amount |
| Provides a call script for the caseworker | Caseworker answers questions and gives official guidance |

## The Boundary in Code

- `estimate_eligibility()` returns `likely_eligible: true/false` with `confidence: "medium"` — never "high" and never "eligible"
- `classify_change()` returns `must_report: true` based on keyword matching — but always includes the disclaimer "Guidance only. Not legal advice."
- The app uses "you may qualify" and "likely eligible" — **never** "you qualify" or "you are eligible"
- Every AI screen shows: "AI guidance · Not a caseworker decision"
- Every response includes the caseworker phone number: CA: 1-877-847-3663, TX: 2-1-1

## Demo Evidence

Judges can verify this boundary by:
1. Using the Report screen — the output says "you likely need to report" not "you must report"
2. Checking the ConfidenceBar component — shows "medium" confidence, never "certain"
3. Looking at any AI result — always shows disclaimer + caseworker phone
4. Reading the call script — it says "Can you confirm if this needs to be reported?" — asking the caseworker, not telling the user
