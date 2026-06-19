from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class EligibilityRequest(BaseModel):
    state: Literal["CA", "TX"]
    household_size: int
    monthly_gross_income: float
    has_elderly_or_disabled: bool
    monthly_rent: float
    dependent_care_cost: float


class RoadmapRequest(BaseModel):
    state: Literal["CA", "TX"]
    enrollment_date: str
    household_size: int


class ReportRequest(BaseModel):
    state: Literal["CA", "TX"]
    change_text: str
    household_context: dict


class NoticeRequest(BaseModel):
    state: Literal["CA", "TX"]
    notice_text: str | None = None


class RecoveryRequest(BaseModel):
    state: Literal["CA", "TX"]
    situation: str
