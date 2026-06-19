from __future__ import annotations

from typing import List, Dict
import re

from rules_engine import GROSS_LIMIT_130, MAX_ALLOTMENT

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
