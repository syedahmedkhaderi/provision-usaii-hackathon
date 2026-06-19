"""
main.py  –  Provision FastAPI backend
Routes: health, eligibility, roadmap, report, notice, recovery

Each AI route passes inline SNAP rule snippets to Gemini via llm_client.
If Gemini is unavailable, every route returns a safe deterministic fallback
so the app never crashes mid-demo.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import llm_client
from prompts import ELIGIBILITY_SYSTEM, NOTICE_SYSTEM, RECOVERY_SYSTEM, REPORT_SYSTEM

app = FastAPI(title="Provision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Inline SNAP knowledge snippets ────────────────────────────────────────────
# Passed verbatim into every Gemini user prompt so the model reasons from
# real rules rather than hallucinating thresholds.

_KNOWLEDGE: dict[str, list[dict]] = {
    "CA": [
        {
            "label": "CA IRT thresholds FY2026",
            "source": "CalFresh Policy Manual §63-503.44",
            "text": (
                "California uses Semi-Annual Reporting (SAR). Households must report income "
                "that exceeds the Income Reporting Threshold (IRT) within 10 days. "
                "IRT by household size: 1→$1,074/mo, 2→$1,452, 3→$1,830, 4→$2,209, 5+→$2,587. "
                "Other changes (new job, reduced hours) are reported at the SAR-7, not mid-period, "
                "unless income exceeds IRT."
            ),
        },
        {
            "label": "CA mandatory mid-period changes",
            "source": "MPP §63-503.44(b)",
            "text": (
                "California mandatory mid-period report triggers: (1) income exceeds IRT, "
                "(2) lottery or gambling winnings over $4,250 in a month, "
                "(3) change in household composition. Report within 10 days of the change."
            ),
        },
        {
            "label": "CA SAR-7 interim report",
            "source": "CalFresh Handbook §63-504",
            "text": (
                "The SAR-7 is due at the 6-month mark of the certification period. "
                "If not submitted by the 5th of that month, benefits stop on the 1st of the following month. "
                "A late submission may restore benefits without a gap if received by the 11th."
            ),
        },
        {
            "label": "CA recertification",
            "source": "CalFresh Handbook §63-505",
            "text": (
                "California certifications last 12 months. A recertification interview is required. "
                "A notice is sent 60 days before expiration. Missing recertification ends benefits."
            ),
        },
        {
            "label": "CA fair hearing rights",
            "source": "ACL 21-77 / MPP §22-001",
            "text": (
                "Recipients have 90 days from the notice date to request a fair hearing. "
                "If requested within 10 days of a termination or reduction notice and benefits "
                "were active, aid paid pending hearing may continue benefits during the appeal."
            ),
        },
    ],
    "TX": [
        {
            "label": "TX SNAP reporting rules",
            "source": "Texas HHSC FNS Handbook §3500",
            "text": (
                "Texas uses Quarterly Reporting (QR). Households must report ALL changes — "
                "income, household size, address, employment — within 10 days or at the next "
                "quarterly report, whichever comes first. There is no IRT threshold; all income changes must be reported."
            ),
        },
        {
            "label": "TX recertification",
            "source": "Texas HHSC FNS Handbook §3600",
            "text": (
                "Most Texas SNAP households have a 6-month certification period. "
                "Recertification is required before the period ends. "
                "A notice is sent approximately 30 days before expiration."
            ),
        },
        {
            "label": "TX fair hearing rights",
            "source": "Texas HHSC FNS §4000",
            "text": (
                "Recipients have 90 days from the notice date to request a fair hearing. "
                "Aid paid pending a hearing may apply if requested within 10 days of a "
                "termination or reduction notice while benefits were active."
            ),
        },
    ],
}

_DISCLAIMER = (
    "This is guidance only, not legal advice. "
    "Verify all deadlines and actions with your caseworker before acting."
)

_CASEWORKER = {"CA": "1-877-847-3663", "TX": "2-1-1"}


def _snippets(state: str) -> str:
    return "\n\n".join(
        f"[{r['label']}]\n{r['text']}" for r in _KNOWLEDGE.get(state, [])
    )


def _citations(state: str) -> list[dict]:
    return [{"label": r["label"], "source": r["source"]} for r in _KNOWLEDGE.get(state, [])]


# ── Pydantic request models ───────────────────────────────────────────────────

class EligibilityRequest(BaseModel):
    state: str
    household_size: int
    monthly_gross_income: float
    has_elderly_or_disabled: bool
    monthly_rent: float
    dependent_care_cost: float


class RoadmapRequest(BaseModel):
    state: str
    enrollment_date: str
    household_size: int


class ReportRequest(BaseModel):
    state: str
    change_text: str
    household_context: dict


class NoticeRequest(BaseModel):
    state: str
    notice_text: str | None = None
    image_base64: str | None = None


class RecoveryRequest(BaseModel):
    state: str
    situation: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "gemini_available": llm_client.is_gemini_available()}


@app.post("/eligibility/check")
def check_eligibility(req: EligibilityRequest):
    # Federal gross income limit: 130% of FPL (FY2026 values)
    FPL = {1: 1255, 2: 1704, 3: 2152, 4: 2601, 5: 3049, 6: 3498, 7: 3946, 8: 4395}
    size = min(req.household_size, 8)
    gross_limit = FPL.get(size, 4395 + (req.household_size - 8) * 449) * 1.30
    deterministic_likely = req.monthly_gross_income <= gross_limit

    ai_unavailable = not llm_client.is_gemini_available()
    likely = deterministic_likely
    explanation = ""
    confidence = "medium"
    benefit_range = [0, 0]

    if not ai_unavailable:
        try:
            user_prompt = (
                f"State: {req.state}\n"
                f"Household size: {req.household_size}\n"
                f"Monthly gross income: ${req.monthly_gross_income:.0f}\n"
                f"Has elderly or disabled member: {req.has_elderly_or_disabled}\n"
                f"Monthly rent: ${req.monthly_rent:.0f}\n"
                f"Dependent care costs: ${req.dependent_care_cost:.0f}\n\n"
                f"Rule snippets:\n{_snippets(req.state)}"
            )
            r = llm_client.call_gemini_json(ELIGIBILITY_SYSTEM, user_prompt)
            likely = r.get("likely_eligible", deterministic_likely)
            explanation = r.get("explanation", "")
            confidence = r.get("confidence", "medium")
            benefit_range = r.get("estimated_monthly_benefit_range", [0, 0])
        except Exception:
            ai_unavailable = True

    if not explanation:
        explanation = (
            f"Based on a household of {req.household_size} in {req.state}, "
            f"your gross monthly income of ${req.monthly_gross_income:.0f} "
            f"{'falls within' if likely else 'exceeds'} the federal gross income limit of "
            f"${gross_limit:.0f}/month. Contact your caseworker for a final determination."
        )

    return {
        "likely_eligible": likely,
        "confidence": confidence,
        "estimated_monthly_benefit_range": benefit_range,
        "explanation": explanation,
        "citations": _citations(req.state)[:2],
        "disclaimer": _DISCLAIMER,
    }


@app.post("/roadmap/generate")
def generate_roadmap(req: RoadmapRequest):
    try:
        enroll = datetime.strptime(req.enrollment_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=422, detail="enrollment_date must be YYYY-MM-DD")

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    def _status(due: datetime) -> str:
        d = (due - today).days
        return "done" if d < 0 else "urgent" if d <= 14 else "upcoming"

    steps = []

    if req.state == "CA":
        sar7 = enroll + timedelta(days=180)
        steps.append({
            "title": "Submit your SAR-7 interim report",
            "due_date": sar7.strftime("%Y-%m-%d"),
            "window": f"Due by {sar7.strftime('%B %d, %Y')}",
            "documents": [
                "2 most recent pay stubs",
                "Bank statement (last 30 days)",
                "Documentation of any new income",
            ],
            "consequence": "Benefits stop if SAR-7 is not received by the 11th of that month",
            "status": _status(sar7),
        })
        recert = enroll + timedelta(days=365)
        steps.append({
            "title": "Recertification interview",
            "due_date": recert.strftime("%Y-%m-%d"),
            "window": f"Due by {recert.strftime('%B %d, %Y')}",
            "documents": [
                "Government-issued photo ID",
                "Proof of income (pay stubs or award letters)",
                "Proof of rent or mortgage",
                "Most recent utility bill",
                "Social Security cards for all household members",
            ],
            "consequence": "Benefits end if recertification is not completed",
            "status": _status(recert),
        })
    else:  # TX
        recert = enroll + timedelta(days=180)
        steps.append({
            "title": "Recertification interview",
            "due_date": recert.strftime("%Y-%m-%d"),
            "window": f"Due by {recert.strftime('%B %d, %Y')}",
            "documents": [
                "Government-issued ID",
                "Social Security card for each household member",
                "Proof of all income",
                "Proof of residence (utility bill or signed lease)",
                "Documentation of expenses (rent, childcare, utilities)",
            ],
            "consequence": "Benefits end if recertification is not completed",
            "status": _status(recert),
        })

    next_step = next(
        (s["title"] for s in steps if s["status"] != "done"), steps[-1]["title"]
    )
    return {"steps": steps, "next_critical_step": next_step}


@app.post("/report/interpret")
def interpret_change(req: ReportRequest):
    caseworker = _CASEWORKER.get(req.state, "your local SNAP office")
    ai_unavailable = not llm_client.is_gemini_available()
    result: dict = {}

    if not ai_unavailable:
        try:
            user_prompt = (
                f"State: {req.state}\n"
                f"Household size: {req.household_context.get('household_size', 1)}\n"
                f"Monthly income: ${req.household_context.get('current_monthly_income', 0)}\n"
                f"Change described by user: {req.change_text}\n\n"
                f"Rule snippets:\n{_snippets(req.state)}"
            )
            result = llm_client.call_gemini_json(REPORT_SYSTEM, user_prompt)
        except Exception:
            ai_unavailable = True

    if ai_unavailable or not result:
        result = {
            "category": "other",
            "must_report": True,
            "deadline_days": 10,
            "reasoning": (
                "We could not reach the AI at this moment. When in doubt, report the change "
                "within 10 days. Your caseworker can confirm whether it affects your benefits."
            ),
            "confidence": "low",
        }

    return {
        "category": result.get("category", "other"),
        "must_report": result.get("must_report", True),
        "deadline_days": result.get("deadline_days"),
        "reasoning": result.get("reasoning", ""),
        "citations": _citations(req.state)[:3],
        "caseworker_phone": caseworker,
        "ai_explanation_unavailable": ai_unavailable,
        "disclaimer": _DISCLAIMER,
        "confidence": result.get("confidence", "medium"),
    }


@app.post("/notice/interpret")
def interpret_notice(req: NoticeRequest):
    caseworker = _CASEWORKER.get(req.state, "your local SNAP office")
    ai_unavailable = not llm_client.is_gemini_available()
    result: dict = {}

    if not ai_unavailable:
        try:
            snippets = _snippets(req.state)
            if req.image_base64:
                user_prompt = (
                    f"State: {req.state}\n\n"
                    f"Rule snippets:\n{snippets}\n\n"
                    "Please read and interpret the SNAP notice shown in the image."
                )
                result = llm_client.call_gemini_vision_json(
                    NOTICE_SYSTEM, user_prompt, req.image_base64
                )
            else:
                notice_text = req.notice_text or "(no notice text provided)"
                user_prompt = (
                    f"State: {req.state}\n"
                    f"Notice text:\n{notice_text}\n\n"
                    f"Rule snippets:\n{snippets}"
                )
                result = llm_client.call_gemini_json(NOTICE_SYSTEM, user_prompt)
        except Exception:
            ai_unavailable = True

    if ai_unavailable or not result:
        result = {
            "notice_type": "other",
            "what_it_means": (
                "We could not interpret the notice right now. Please call your caseworker "
                "who can explain it and tell you what action is required."
            ),
            "urgency": "urgent",
            "deadline_days": None,
            "options": [
                {
                    "label": "Call your caseworker",
                    "detail": f"Call {caseworker} to get an explanation as soon as possible.",
                },
                {
                    "label": "Request a fair hearing",
                    "detail": "You have 90 days from the notice date to appeal any decision you disagree with.",
                },
            ],
        }

    # Normalise option keys (Gemini may use label/detail or action/detail)
    options = [
        {
            "label": o.get("label") or o.get("action", "Option"),
            "detail": o.get("detail", ""),
        }
        for o in result.get("options", [])
    ]

    return {
        "notice_type": result.get("notice_type", "other"),
        "what_it_means": result.get("what_it_means", ""),
        "urgency": result.get("urgency", "urgent"),
        "deadline_days": result.get("deadline_days"),
        "options": options,
        "citations": _citations(req.state)[:3],
        "ai_explanation_unavailable": ai_unavailable,
        "disclaimer": _DISCLAIMER,
    }


@app.post("/recovery/plan")
def recovery_plan(req: RecoveryRequest):
    caseworker = _CASEWORKER.get(req.state, "your local SNAP office")
    fair_hearing_days = 90
    ai_unavailable = not llm_client.is_gemini_available()
    result: dict = {}

    if not ai_unavailable:
        try:
            user_prompt = (
                f"State: {req.state}\n"
                f"Situation: {req.situation}\n\n"
                f"Rule snippets:\n{_snippets(req.state)}"
            )
            result = llm_client.call_gemini_json(RECOVERY_SYSTEM, user_prompt)
        except Exception:
            ai_unavailable = True

    if ai_unavailable or not result:
        result = {
            "steps": [
                {
                    "title": "Call your caseworker immediately",
                    "detail": f"Contact {caseworker} to understand what happened and what is needed to restore your benefits.",
                },
                {
                    "title": "Gather your documents",
                    "detail": "Collect your ID, proof of income, and any notices you have received.",
                },
                {
                    "title": "Request a fair hearing if you disagree",
                    "detail": (
                        "You have 90 days from the notice date to appeal. "
                        "Requesting within 10 days may allow benefits to continue during the appeal."
                    ),
                },
                {
                    "title": "Reapply if needed",
                    "detail": "If too much time has passed, you may need to reapply. Your caseworker can guide you.",
                },
            ],
            "fair_hearing_deadline_days": fair_hearing_days,
            "letter_template": (
                "Dear County Hearing Office,\n\n"
                "I, [YOUR FULL NAME], am requesting a fair hearing regarding [DESCRIBE ISSUE] "
                "dated [NOTICE DATE]. My case number is [CASE NUMBER].\n\n"
                "I believe this decision is incorrect because [YOUR REASON].\n\n"
                "I am requesting that my benefits continue pending the outcome of this hearing.\n\n"
                "Sincerely,\n[YOUR NAME]\n[YOUR ADDRESS]\n[YOUR PHONE NUMBER]\n[DATE]"
            ),
            "reapply_note": (
                "If your benefits have ended and a hearing is not possible, you can reapply at any time "
                "at BenefitsCal.com (CA) or YourTexasBenefits.com (TX)."
            ),
        }

    return {
        "steps": result.get("steps", []),
        "fair_hearing_deadline_days": result.get("fair_hearing_deadline_days", fair_hearing_days),
        "letter_template": result.get("letter_template", ""),
        "reapply_note": result.get("reapply_note", ""),
        "citations": _citations(req.state),
        "disclaimer": _DISCLAIMER,
    }
