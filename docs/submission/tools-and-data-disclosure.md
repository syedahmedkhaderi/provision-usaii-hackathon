# Tools and Data Disclosure — Provision

## AI Tools Used

| Tool | Purpose | Free/Paid |
|---|---|---|
| Gemini 2.5 Flash | Plain-language explanation generation (report, notice, recovery) | Free tier (Google AI Studio) |
| Hermes Agent (Nous Research) | AI coding assistance — code generation, debugging, testing | Paid (development tool, not in app) |
| GitHub Copilot CLI | Code generation assistance (development tool) | Paid (development tool, not in app) |

## Development Tools

| Tool | Purpose |
|---|---|
| Expo SDK 54 | React Native cross-platform mobile app framework |
| FastAPI | Python backend API framework |
| Pydantic | Input validation and schema enforcement |
| pytest | Backend testing |
| httpx | HTTP client for Gemini API calls |
| uvicorn | ASGI server for FastAPI |
| Render | Backend deployment (free tier) |
| GitHub | Version control, pull requests, code review |

## Data Sources

All data is from public government documents. No private, proprietary, or user data is used.

| Source | What It Provides | URL |
|---|---|---|
| USDA FNS SNAP Income Eligibility Standards FY2026 | Gross/net income limits, max allotments | https://www.fns.usda.gov/snap/eligibility/income |
| CalFresh Policy Manual (MPP) | CA reporting rules, IRT thresholds, SAR-7 requirements | https://www.cdss.ca.gov/inforesources/ACL/Legal-Regulations |
| Texas HHSC FNS Handbook | TX reporting rules, QR-7, recertification | https://hhs.texas.gov/services/food/snap-food-benefits |
| USDA FNS SNAP SCRR (State Options Report) | State-specific SNAP administration rules | https://www.fns.usda.gov/snap/state-options-report |

## Synthetic Data Explanation

All user scenarios, test profiles, and demo data are **synthetic** — created by the development team to represent realistic SNAP recipient situations. No real user data is collected, stored, or transmitted.

Demo personas:
- **Maria** — single parent, Los Angeles, part-time worker, CalFresh recipient with income change
- **James** — Houston, SNAP recipient who missed quarterly report
- **Dana** — Sacramento, CalFresh recipient whose benefits were terminated

## Privacy Posture

- User profile data is stored locally on-device via AsyncStorage
- No user accounts, no server-side user data storage
- No personal data sent to Gemini — only the change description or notice text for interpretation
- Gemini API key is backend-only, never bundled in the frontend app
- No analytics, tracking, or third-party data sharing
