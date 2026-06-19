from __future__ import annotations

import calendar
from datetime import datetime, timedelta
from typing import Optional, Dict, List

# Federal poverty level (monthly) — FY2026 48-state values
# Source: USDA FNS SNAP Income and Resource Standards, effective Oct 1 2025
# https://www.fns.usda.gov/snap/charts
FPL_MONTHLY = {1: 1255, 2: 1704, 3: 2152, 4: 2601, 5: 3049, 6: 3498, 7: 3946, 8: 4395}
GROSS_LIMIT_130 = {k: int(v * 1.30) for k, v in FPL_MONTHLY.items()}

# Maximum monthly allotment by household size — FY2026
# Source: USDA FNS SNAP Cost of Living Adjustments, effective Oct 1 2025
MAX_ALLOTMENT = {
    1: 281,
    2: 516,
    3: 740,
    4: 939,
    5: 1114,
    6: 1260,
    7: 1412,
    8: 1566,
}


def _size_key(size: int) -> int:
    return min(max(1, size), 8)


def _add_months(dt: datetime, months: int) -> datetime:
    """Add calendar months, clamping the day to the last day of the target month."""
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    day = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


def estimate_eligibility(
    state: str,
    household_size: int,
    monthly_gross_income: float,
    has_elderly_or_disabled: bool,
    monthly_rent: float,
    dependent_care_cost: float,
) -> dict:
    """
    Determines likely eligibility using gross income at 130% FPL (unless elderly/disabled).
    Returns a dict matching the frozen function contract used by the app.
    """
    size = _size_key(household_size)

    gross_limit = GROSS_LIMIT_130.get(size, GROSS_LIMIT_130[8])

    # If household has elderly or disabled member, skip gross test (per spec)
    passes_gross = True if has_elderly_or_disabled else (monthly_gross_income <= gross_limit)

    # Simple deterministic benefit estimate using MAX_ALLOTMENT as a top end.
    # This is a placeholder range; do NOT treat as authoritative.
    max_allot = MAX_ALLOTMENT.get(size, MAX_ALLOTMENT[8])
    low = int(max(0, max_allot * 0.6))
    high = int(max_allot)

    likely = passes_gross
    confidence = "medium"
    explanation = (
        f"Using federal thresholds, the 130% FPL gross-income limit for a {household_size}-person household "
        f"is approximately ${gross_limit:,}/month. "
        f"Your reported gross income of ${int(monthly_gross_income):,} "
        f"{('falls within' if likely else 'exceeds')} that limit."
    )

    return {
        "likely_eligible": likely,
        "confidence": confidence,
        "estimated_monthly_benefit_range": [low, high],
        "explanation": explanation,
    }


def classify_change(state: str, change_text: str) -> Optional[dict]:
    """
    Keyword-based fallback classification. Returns a dict with keys:
      - category (str)
      - must_report (bool)
      - deadline_days (int)

    Returns None when no deterministic keyword match is found.
    """
    t = (change_text or "").lower()

    mappings = [
        ("income_increase", ["increase", "raise", "more hours", "overtime", "got a job", "new job"]),
        ("income_decrease", ["lost job", "reduced hours", "less hours", "pay cut", "furlough"]),
        ("household_change", ["moved in", "moved out", "married", "divorce", "new baby", "birth"]),
        ("address_change", ["moved", "change address", "new address", "moved to"]),
        ("work_hours_change", ["hours", "work less", "work more", "schedule change"]),
        ("asset_change", ["lottery", "inherit", "asset", "savings increased"]),
    ]

    for cat, kws in mappings:
        for kw in kws:
            if kw in t:
                # Deterministic rules: most changes must be reported within 10 days
                return {
                    "category": cat,
                    "must_report": True,
                    "deadline_days": 10,
                }

    return None


def build_roadmap(state: str, enrollment_date: str, household_size: int) -> List[dict]:
    try:
        enroll = datetime.strptime(enrollment_date, "%Y-%m-%d")
    except Exception:
        raise ValueError("enrollment_date must be YYYY-MM-DD")

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    def _status(due: datetime) -> str:
        d = (due - today).days
        return "done" if d < 0 else "urgent" if d <= 14 else "upcoming"

    steps: List[dict] = []

    if state == "CA":
        sar7 = _add_months(enroll, 6)
        steps.append(
            {
                "title": "Submit your SAR-7 interim report",
                "due_date": sar7.strftime("%Y-%m-%d"),
                "window": f"Due by {sar7.strftime('%B %d, %Y')}",
                "documents": [
                    "2 most recent pay stubs",
                    "Bank statement (last 30 days)",
                    "Documentation of any new income",
                ],
                "consequence": "Benefits may stop if SAR-7 is not received on time",
                "status": _status(sar7),
            }
        )
        recert = _add_months(enroll, 12)
        steps.append(
            {
                "title": "Recertification interview",
                "due_date": recert.strftime("%Y-%m-%d"),
                "window": f"Due by {recert.strftime('%B %d, %Y')}",
                "documents": [
                    "Government-issued photo ID",
                    "Proof of income (pay stubs or award letters)",
                    "Proof of rent or mortgage",
                ],
                "consequence": "Benefits may end if recertification is not completed",
                "status": _status(recert),
            }
        )
    else:  # TX
        recert = _add_months(enroll, 6)
        steps.append(
            {
                "title": "Recertification interview",
                "due_date": recert.strftime("%Y-%m-%d"),
                "window": f"Due by {recert.strftime('%B %d, %Y')}",
                "documents": [
                    "Government-issued ID",
                    "Proof of all income",
                    "Proof of residence (utility bill or signed lease)",
                ],
                "consequence": "Benefits may end if recertification is not completed",
                "status": _status(recert),
            }
        )

    return steps


def recovery_plan(state: str, situation: str) -> dict:
    fair_hearing_days = 90
    steps = [
        {
            "title": "Call your caseworker immediately",
            "detail": "Contact your caseworker to understand what happened and what is needed to restore your benefits.",
        },
        {"title": "Gather your documents", "detail": "Collect ID, proof of income, and any notices you have received."},
        {
            "title": "Request a fair hearing if you disagree",
            "detail": (
                "You have 90 days from the notice date to appeal. Requesting within 10 days "
                "may allow benefits to continue during the appeal."
            ),
        },
        {"title": "Reapply if needed", "detail": "If too much time has passed, you may need to reapply."},
    ]

    letter_template = (
        "Dear County Hearing Office,\n\n"
        "I, [YOUR FULL NAME], am requesting a fair hearing regarding [DESCRIBE ISSUE] "
        "dated [NOTICE DATE]. My case number is [CASE NUMBER].\n\n"
        "I believe this decision is incorrect because [YOUR REASON].\n\n"
        "I am requesting that my benefits continue pending the outcome of this hearing.\n\n"
        "Sincerely,\n[YOUR NAME]\n[YOUR ADDRESS]\n[YOUR PHONE NUMBER]\n[DATE]"
    )

    return {
        "steps": steps,
        "fair_hearing_deadline_days": fair_hearing_days,
        "letter_template": letter_template,
        "reapply_note": (
            "If too much time has passed since your termination, you may need to reapply. "
            "Gather your ID, proof of income, and proof of residence to speed up the process."
        ),
    }
