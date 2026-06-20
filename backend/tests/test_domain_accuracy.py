"""
test_domain_accuracy.py — Compares hardcoded SNAP values against USDA FNS source-of-truth.
Any mismatch is a defect. This app deals with public benefits — wrong numbers harm people.
"""
from __future__ import annotations

import json
import os

import pytest
import rules_engine as re

FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "snap_fy2026_truth.json")


def load_truth():
    with open(FIXTURE_PATH) as f:
        return json.load(f)["fy2026_snap_limits"]


TRUTH = load_truth()


class TestGrossIncomeLimits:
    """Verify GROSS_LIMIT_130 matches USDA FY2026 130% FPL gross monthly income limits."""

    @pytest.mark.parametrize("size", [1, 2, 3, 4, 5, 6, 7, 8])
    def test_gross_limit_matches_usda(self, size):
        truth_val = TRUTH["gross_monthly_income_130pct_fpl"][str(size)]
        code_val = re.GROSS_LIMIT_130.get(size)
        assert code_val == truth_val, (
            f"Household size {size}: code has ${code_val}, USDA says ${truth_val}. "
            f"Delta: ${truth_val - code_val}"
        )


class TestNetIncomeLimits:
    """Verify FPL_MONTHLY matches USDA FY2026 net monthly income limits (100% FPL)."""

    @pytest.mark.parametrize("size", [1, 2, 3, 4, 5, 6, 7, 8])
    def test_fpl_matches_usda(self, size):
        truth_val = TRUTH["net_monthly_income_100pct_fpl"][str(size)]
        code_val = re.FPL_MONTHLY.get(size)
        assert code_val == truth_val, (
            f"Household size {size}: code has ${code_val}, USDA says ${truth_val}. "
            f"Delta: ${truth_val - code_val}"
        )


class TestMaxAllotment:
    """Verify MAX_ALLOTMENT matches USDA FY2026 maximum monthly allotment."""

    @pytest.mark.parametrize("size", [1, 2, 3, 4, 5, 6, 7, 8])
    def test_allotment_matches_usda(self, size):
        truth_val = TRUTH["max_monthly_allotment"][str(size)]
        code_val = re.MAX_ALLOTMENT.get(size)
        assert code_val == truth_val, (
            f"Household size {size}: code has ${code_val}, USDA says ${truth_val}. "
            f"Delta: ${truth_val - code_val}"
        )


class TestFairHearingDeadline:
    """Both CA and TX have 90-day fair hearing windows."""

    def test_ca_fair_hearing_90_days(self):
        result = re.recovery_plan("CA", "test")
        assert result["fair_hearing_deadline_days"] == 90

    def test_tx_fair_hearing_90_days(self):
        result = re.recovery_plan("TX", "test")
        assert result["fair_hearing_deadline_days"] == 90


class TestReportingDeadline:
    """SNAP changes must typically be reported within 10 days."""

    def test_change_classification_deadline_is_10_days(self):
        result = re.classify_change("CA", "I got a new job")
        assert result["deadline_days"] == 10
