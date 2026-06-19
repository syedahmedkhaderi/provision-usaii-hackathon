from __future__ import annotations

from typing import List, Dict
import re

from rules_engine import FPL_MONTHLY, GROSS_LIMIT_130, MAX_ALLOTMENT

# Snippets must match the numbers used in rules_engine.py so citations line up.
SNIPPETS: Dict[str, List[Dict[str, str]]] = {
    "CA": [
        {
            "label": "CA IRT thresholds FY2026",
            "source": "CalFresh Policy Manual §63-503.44",
            "text": (
                "California uses Semi-Annual Reporting (SAR). Households must report income "
                "that exceeds the Income Reporting Threshold (IRT) within 10 days. "
                f"IRT by household size (monthly): 1→${GROSS_LIMIT_130[1]}, 2→${GROSS_LIMIT_130[2]}, "
                f"3→${GROSS_LIMIT_130[3]}, 4→${GROSS_LIMIT_130[4]}, 5→${GROSS_LIMIT_130[5]}."
            ),
        },
        {
            "label": "CA mandatory mid-period changes",
            "source": "MPP §63-503.44(b)",
            "text": (
                "California requires reporting mid-period for specific triggers: income above the IRT, "
                "large one-time assets (lottery), and household composition changes. Report within 10 days."
            ),
        },
        {
            "label": "CA SAR-7 interim report",
            "source": "CalFresh Handbook §63-504",
            "text": (
                "The SAR-7 is due at the 6-month mark of the certification period. "
                "If not submitted by the 5th of that month, benefits stop on the 1st of the following month."
            ),
        },
        {
            "label": "CA recertification",
            "source": "CalFresh Handbook §63-505",
            "text": "California certifications typically last 12 months; a recertification interview is required.",
        },
        {
            "label": "CA fair hearing rights",
            "source": "ACL 21-77 / MPP §22-001",
            "text": "Recipients have 90 days from the notice date to request a fair hearing.",
        },
        {
            "label": "CA elderly/disabled net income test",
            "source": "CalFresh Handbook §63-503.3",
            "text": (
                "Households with a member who is age 60+ or disabled are exempt from the gross income test. "
                "They must only meet the net income limit at 100% FPL. "
                f"Net income limits (monthly): 1→${FPL_MONTHLY[1]}, 2→${FPL_MONTHLY[2]}, "
                f"3→${FPL_MONTHLY[3]}, 4→${FPL_MONTHLY[4]}."
            ),
        },
        {
            "label": "CA ABAWD work requirements",
            "source": "CalFresh Handbook §63-410",
            "text": (
                "Able-Bodied Adults Without Dependents (ABAWDs) aged 18–49 must work or participate in "
                "a work program at least 20 hours per week to receive SNAP beyond 3 months in a 36-month period. "
                "Exemptions include being pregnant, having a dependent child under 18, or meeting a disability criterion."
            ),
        },
        {
            "label": "CA address change reporting",
            "source": "MPP §63-503.44(b)",
            "text": (
                "An address change does not need to be reported mid-period unless it affects eligibility "
                "(e.g., moving to a county with a different cost-of-living area). It must be reported at SAR-7."
            ),
        },
        {
            "label": "CA overpayment recovery",
            "source": "CalFresh Handbook §63-801",
            "text": (
                "If the county determines an overpayment occurred, they may recover it by reducing future benefits "
                "by up to 10% (or $10, whichever is greater). You have the right to a fair hearing to dispute any "
                "overpayment determination."
            ),
        },
        {
            "label": "CA lottery and lump-sum income",
            "source": "ACL 13-07 / MPP §63-503.44(a)",
            "text": (
                "Lottery or gambling winnings of $4,250 or more must be reported within 10 days regardless of the "
                "SAR reporting period. Inheritances and lump-sum payments are treated as income in the month received."
            ),
        },
    ],
    "TX": [
        {
            "label": "TX SNAP reporting rules",
            "source": "Texas HHSC FNS Handbook §3500",
            "text": (
                "Texas uses Quarterly Reporting (QR). Households should report changes — income, household size, "
                "address, employment — within 10 days or at the next quarterly report. There is no IRT threshold."
            ),
        },
        {
            "label": "TX recertification",
            "source": "Texas HHSC FNS Handbook §3600",
            "text": "Most Texas SNAP households have a 6-month certification period and must recertify accordingly.",
        },
        {
            "label": "TX fair hearing rights",
            "source": "Texas HHSC FNS §4000",
            "text": "Recipients have 90 days from the notice date to request a fair hearing.",
        },
        {
            "label": "TX QR-7 quarterly report",
            "source": "Texas HHSC FNS Handbook §3520",
            "text": (
                "Texas SNAP households must file a QR-7 (Quarterly Report) every 3 months to maintain benefits. "
                "The QR-7 is mailed about 30 days before it is due. If not returned by the due date, benefits may stop "
                "at the end of the benefit month. Benefits can be restored within 30 days by submitting the QR-7."
            ),
        },
        {
            "label": "TX ABAWD work requirements",
            "source": "Texas HHSC FNS Handbook §4000",
            "text": (
                "Able-Bodied Adults Without Dependents (ABAWDs) aged 18–49 in Texas must work or participate in "
                "a qualifying program at least 20 hours per week. Failure to meet this requirement limits benefits "
                "to 3 months in a 36-month period. Exemptions apply for pregnancy, caring for a child under 6, "
                "and certain disability criteria."
            ),
        },
        {
            "label": "TX address change reporting",
            "source": "Texas HHSC FNS Handbook §3500",
            "text": (
                "Address changes must be reported within 10 days or at the next quarterly report, whichever comes first. "
                "Moving to a different county may require a new application at the receiving county office."
            ),
        },
        {
            "label": "TX overpayment collection",
            "source": "Texas HHSC FNS Handbook §6000",
            "text": (
                "Texas HHSC may recover SNAP overpayments by reducing your monthly benefit by up to 10% "
                "(minimum $10). You will receive a written notice before any collection begins and have the "
                "right to a fair hearing to dispute the overpayment amount."
            ),
        },
        {
            "label": "TX income reporting — mid-period",
            "source": "Texas HHSC FNS Handbook §3500",
            "text": (
                "Texas does not use an IRT like California. Most income changes should be reported at the next "
                "quarterly report. However, households must report immediately if income drops to zero or if a "
                "household member leaves, as this may increase benefits."
            ),
        },
    ],
}

CASEWORKER = {"CA": "1-877-847-3663", "TX": "2-1-1"}


def retrieve(state: str, query: str, k: int = 3) -> List[Dict[str, str]]:
    """
    Very simple keyword overlap scoring against the snippet pool.
    Returns top-k snippets as a list of {label, source, text}.
    """
    pool = SNIPPETS.get(state, [])
    if not query:
        return pool[:k]

    q_tokens = set(re.findall(r"\w+", query.lower()))

    scored = []
    for s in pool:
        text = (s.get("text") or "").lower()
        label = (s.get("label") or "").lower()
        txt_tokens = set(re.findall(r"\w+", text + " " + label))
        score = len(q_tokens & txt_tokens)
        scored.append((score, s))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for score, s in scored[:k]]


def caseworker_phone(state: str) -> str:
    return CASEWORKER.get(state, "your local SNAP office")
