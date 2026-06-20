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

import llm_client
from prompts import ELIGIBILITY_SYSTEM, NOTICE_SYSTEM, REPORT_SYSTEM

from schemas import (
    EligibilityRequest,
    RoadmapRequest,
    ReportRequest,
    NoticeRequest,
    RecoveryRequest,
)

import knowledge_base as kb
import rules_engine as rules

app = FastAPI(title="Provision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_DISCLAIMER = (
    "This is guidance only, not legal advice. "
    "Verify all deadlines and actions with your caseworker before acting."
)


def _deterministic_change_reasoning(category: str, deadline_days: int | None) -> str:
    timing = f" within {deadline_days} days" if deadline_days is not None else ""
    reasons = {
        "income_increase": f"A new job or higher income can affect your benefits. This usually needs to be reported{timing}.",
        "income_decrease": f"A job loss or lower income may change your benefit amount. Report it{timing} so your caseworker can review it.",
        "household_change": f"A change in who lives with you can affect SNAP rules and benefit levels. Report it{timing}.",
        "address_change": f"An address change can affect your case record and sometimes your eligibility. Report it{timing}.",
        "work_hours_change": f"A change in work hours can affect your reported income. Report it{timing}.",
        "asset_change": f"A large one-time payment or asset change can affect your case. Report it{timing}.",
    }
    return reasons.get(category, "Contact your caseworker to confirm what to do.")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_available": llm_client.probe_gemini(),
        "gemini_configured": llm_client.is_gemini_available(),
    }


# ── Demo scenarios for judges ─────────────────────────────────────────────────

@app.get("/demo/scenarios")
def demo_scenarios():
    """Returns pre-built demo personas for judges to test the app quickly."""
    return {
        "scenarios": [
            {
                "id": "maria_ca",
                "name": "Maria — California",
                "description": "Single parent, LA, part-time worker, got a raise",
                "profile": {
                    "state": "CA",
                    "household_size": 3,
                    "monthly_income": 1800,
                    "enrollment_date": "2026-01-15",
                    "reporting_type": "SAR",
                    "issue_type": "none",
                    "notifications_enabled": True,
                    "onboarding_complete": True,
                },
                "demo_inputs": {
                    "report_text": "I got a raise at work, making $600 more per month",
                    "notice_text": "Your CalFresh benefits will be discontinued for failure to submit your SAR-7.",
                },
            },
            {
                "id": "james_tx",
                "name": "James — Texas",
                "description": "Houston, missed quarterly report, benefits at risk",
                "profile": {
                    "state": "TX",
                    "household_size": 2,
                    "monthly_income": 1500,
                    "enrollment_date": "2026-02-01",
                    "reporting_type": "QR",
                    "issue_type": "missed_recert",
                    "notifications_enabled": True,
                    "onboarding_complete": True,
                },
                "demo_inputs": {
                    "report_text": "I lost my job last week",
                    "notice_text": "Your SNAP benefits will end unless you complete recertification.",
                },
            },
            {
                "id": "dana_ca_recovery",
                "name": "Dana — California Recovery",
                "description": "Sacramento, benefits terminated, needs fair hearing",
                "profile": {
                    "state": "CA",
                    "household_size": 1,
                    "monthly_income": 1200,
                    "enrollment_date": "2025-06-01",
                    "reporting_type": "SAR",
                    "issue_type": "closure_notice",
                    "notifications_enabled": True,
                    "onboarding_complete": True,
                },
                "demo_inputs": {
                    "report_text": "My benefits were terminated",
                    "notice_text": "Your CalFresh benefits have been terminated effective immediately due to failure to comply with program requirements.",
                },
            },
        ]
    }



@app.post("/eligibility/check")
def check_eligibility(req: EligibilityRequest):
    # Deterministic rules engine result
    det = rules.estimate_eligibility(
        req.state,
        req.household_size,
        req.monthly_gross_income,
        req.has_elderly_or_disabled,
        req.monthly_rent,
        req.dependent_care_cost,
    )

    ai_unavailable = not llm_client.is_gemini_available()
    ai_result = {}

    if not ai_unavailable:
        try:
            user_prompt = (
                f"State: {req.state}\n"
                f"Household size: {req.household_size}\n"
                f"Monthly gross income: ${req.monthly_gross_income:.0f}\n"
                f"Has elderly or disabled member: {req.has_elderly_or_disabled}\n"
                f"Monthly rent: ${req.monthly_rent:.0f}\n"
                f"Dependent care costs: ${req.dependent_care_cost:.0f}\n\n"
                f"Rule snippets:\n{chr(10).join([s['text'] for s in kb.retrieve(req.state, '')])}"
            )
            ai_result = llm_client.call_gemini_json(ELIGIBILITY_SYSTEM, user_prompt)
        except Exception:
            ai_unavailable = True

    # Merge: deterministic rules win on hard numbers (likely_eligible and benefit range)
    likely = det.get("likely_eligible")
    benefit_range = det.get("estimated_monthly_benefit_range")

    # Use AI wording when available for explanation, but never override hard numbers
    explanation = ai_result.get("explanation") if ai_result.get("explanation") else det.get("explanation")
    # Deterministic confidence takes priority over AI confidence.
    confidence = det.get("confidence", ai_result.get("confidence", "medium"))

    return {
        "likely_eligible": likely,
        "confidence": confidence,
        "estimated_monthly_benefit_range": benefit_range,
        "explanation": explanation,
        "citations": [{"label": s["label"], "source": s["source"]} for s in kb.SNIPPETS.get(req.state, [])][:2],
        "disclaimer": _DISCLAIMER,
    }


@app.post("/roadmap/generate")
def generate_roadmap(req: RoadmapRequest):
    try:
        steps = rules.build_roadmap(req.state, req.enrollment_date, req.household_size)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail={"error": str(exc)})

    next_step = next((s["title"] for s in steps if s.get("status") != "done"), steps[-1]["title"] if steps else None)
    return {"steps": steps, "next_critical_step": next_step}


@app.post("/report/interpret")
def interpret_change(req: ReportRequest):
    caseworker = kb.caseworker_phone(req.state)
    ai_unavailable = not llm_client.is_gemini_available()

    # Deterministic classification
    det = rules.classify_change(req.state, req.change_text)

    ai_result = {}
    if not ai_unavailable:
        try:
            user_prompt = (
                f"State: {req.state}\n"
                f"Household size: {req.household_context.household_size}\n"
                f"Change described by user: {req.change_text}\n\n"
                f"Rule snippets:\n{chr(10).join([s['text'] for s in kb.retrieve(req.state, req.change_text)])}"
            )
            ai_result = llm_client.call_gemini_json(REPORT_SYSTEM, user_prompt)
        except Exception:
            ai_unavailable = True

    # Merge: deterministic values win for must_report/deadline_days when present
    if det:
        category = det.get("category")
        must_report = det.get("must_report")
        deadline_days = det.get("deadline_days")
        reasoning = ai_result.get("reasoning") if ai_result.get("reasoning") else _deterministic_change_reasoning(
            category,
            deadline_days,
        )
    else:
        # fall back to AI if available
        category = ai_result.get("category", "other")
        must_report = ai_result.get("must_report", True)
        deadline_days = ai_result.get("deadline_days")
        reasoning = ai_result.get("reasoning", "Contact your caseworker to confirm what to do.")

    call_script = ai_result.get("call_script") if ai_result.get("call_script") else {
        "opening": "Hi, my name is [YOUR NAME]. My case number should be [CASE NUMBER].",
        "what_to_say": f"I'm calling to report a change in my situation. {req.change_text[:120]}.",
        "what_to_ask": "Can you confirm if this needs to be reported and which form I should use?",
    }

    return {
        "category": category,
        "must_report": must_report,
        "deadline_days": deadline_days,
        "reasoning": reasoning,
        "confidence": ai_result.get("confidence", det.get("confidence", "medium") if det else "medium"),
        "citations": [{"label": s["label"], "source": s["source"]} for s in kb.retrieve(req.state, req.change_text, k=3)],
        "caseworker_phone": caseworker,
        "ai_explanation_unavailable": ai_unavailable,
        "disclaimer": _DISCLAIMER,
        "call_script": call_script,
    }


@app.post("/notice/interpret")
def interpret_notice(req: NoticeRequest):
    caseworker = kb.caseworker_phone(req.state)
    ai_unavailable = not llm_client.is_gemini_available()
    result: dict = {}

    if not ai_unavailable:
        try:
            if req.image_base64:
                text_ctx = (
                    f"State: {req.state}\n"
                    f"Rule snippets:\n{chr(10).join([s['text'] for s in kb.retrieve(req.state, '')])}"
                )
                result = llm_client.call_gemini_vision_json(NOTICE_SYSTEM, text_ctx, req.image_base64)
            else:
                notice_text = req.notice_text or "(no notice text provided)"
                user_prompt = (
                    f"State: {req.state}\n"
                    f"Notice text:\n{notice_text}\n\n"
                    f"Rule snippets:\n{chr(10).join([s['text'] for s in kb.retrieve(req.state, notice_text)])}"
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
        {"label": o.get("label") or o.get("action", "Option"), "detail": o.get("detail", "")}
        for o in result.get("options", [])
    ]

    return {
        "notice_type": result.get("notice_type", "other"),
        "what_it_means": result.get("what_it_means", ""),
        "urgency": result.get("urgency", "urgent"),
        "deadline_days": result.get("deadline_days"),
        "confidence": result.get("confidence", "medium"),
        "key_facts": result.get("key_facts", []),
        "options": options,
        "citations": [{"label": s["label"], "source": s["source"]} for s in kb.retrieve(req.state, req.notice_text or "", k=3)],
        "ai_explanation_unavailable": ai_unavailable,
        "disclaimer": _DISCLAIMER,
    }


@app.post("/recovery/plan")
def recovery_plan(req: RecoveryRequest):
    fair_hearing_days = 90

    # Pure rules-engine response (no Gemini merge per spec)
    det = rules.recovery_plan(req.state, req.situation)

    return {
        "steps": det.get("steps", []),
        "fair_hearing_deadline_days": det.get("fair_hearing_deadline_days", fair_hearing_days),
        "letter_template": det.get("letter_template", ""),
        "reapply_note": det.get("reapply_note", ""),
        "citations": [{"label": s["label"], "source": s["source"]} for s in kb.retrieve(req.state, req.situation, k=3)],
        "disclaimer": _DISCLAIMER,
    }
