from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class EligibilityRequest(BaseModel):
    state: Literal["CA", "TX"]
    household_size: int = Field(..., ge=1, le=20)
    monthly_gross_income: float = Field(..., ge=0)
    has_elderly_or_disabled: bool
    monthly_rent: float = Field(..., ge=0)
    dependent_care_cost: float = Field(..., ge=0)


class RoadmapRequest(BaseModel):
    state: Literal["CA", "TX"]
    enrollment_date: str
    household_size: int = Field(..., ge=1, le=20)


class HouseholdContext(BaseModel):
    household_size: int = Field(1, ge=1, le=20)
    current_monthly_income: float = Field(0, ge=0)


class ReportRequest(BaseModel):
    state: Literal["CA", "TX"]
    change_text: str = Field(..., max_length=2000)
    household_context: HouseholdContext = Field(default_factory=HouseholdContext)


class NoticeRequest(BaseModel):
    state: Literal["CA", "TX"]
    notice_text: str | None = Field(None, max_length=5000)
    image_base64: str | None = Field(None, max_length=5_000_000)


class RecoveryRequest(BaseModel):
    state: Literal["CA", "TX"]
    situation: str = Field(..., max_length=1000)
