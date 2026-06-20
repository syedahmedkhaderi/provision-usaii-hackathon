/**
 * apiClient.ts  –  Typed HTTP client for the Provision backend
 *
 * Set EXPO_PUBLIC_API_BASE_URL in frontend/.env to your dev machine's LAN IP:
 *   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
 *
 * Do NOT use localhost — Expo Go runs on a physical device, so localhost
 * resolves to the phone, not your laptop.
 */

// Default to the deployed Render backend if no env var is set
const DEFAULT_BASE = 'https://provision-usaii-hackathon-fdys.onrender.com';
const BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, '');

// ── Request types ─────────────────────────────────────────────────────────────

export interface EligibilityRequest {
  state: 'CA' | 'TX';
  household_size: number;
  monthly_gross_income: number;
  has_elderly_or_disabled: boolean;
  monthly_rent: number;
  dependent_care_cost: number;
}

export interface RoadmapRequest {
  state: 'CA' | 'TX';
  enrollment_date: string; // YYYY-MM-DD
  household_size: number;
}

export interface ReportRequest {
  state: 'CA' | 'TX';
  change_text: string;
  household_context: {
    household_size: number;
    current_monthly_income: number;
  };
}

export interface NoticeRequest {
  state: 'CA' | 'TX';
  notice_text?: string;
  image_base64?: string; // Farha's route handles OCR when present
}

export interface RecoveryRequest {
  state: 'CA' | 'TX';
  situation: string;
}

// ── Response types (frozen API contract) ──────────────────────────────────────

export interface Citation {
  label: string;
  source: string;
}

export interface EligibilityResponse {
  likely_eligible: boolean;
  confidence: 'high' | 'medium' | 'low';
  estimated_monthly_benefit_range: [number, number];
  explanation: string;
  citations: Citation[];
  disclaimer: string;
}

export interface RoadmapStep {
  title: string;
  due_date: string;
  window: string;
  documents: string[];
  consequence: string;
  status: 'upcoming' | 'urgent' | 'done';
}

export interface RoadmapResponse {
  steps: RoadmapStep[];
  next_critical_step: string;
}

export interface ReportResponse {
  category: string;
  must_report: boolean;
  deadline_days: number | null;
  reasoning: string;
  citations: Citation[];
  caseworker_phone: string;
  ai_explanation_unavailable: boolean;
  disclaimer: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface NoticeOption {
  label: string;
  detail: string;
}

export interface NoticeResponse {
  notice_type: string;
  what_it_means: string;
  urgency: 'urgent' | 'moderate' | 'low';
  deadline_days: number | null;
  options: NoticeOption[];
  citations: Citation[];
  ai_explanation_unavailable: boolean;
  disclaimer: string;
}

export interface RecoveryStep {
  title: string;
  detail: string;
}

export interface RecoveryResponse {
  steps: RecoveryStep[];
  fair_hearing_deadline_days: number;
  letter_template: string;
  reapply_note?: string;
  citations: Citation[];
  disclaimer: string;
}

export interface HealthResponse {
  status: string;
  gemini_available: boolean;
}

// ── HTTP helpers ───────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const api = {
  health: () =>
    get<HealthResponse>('/health'),

  checkEligibility: (body: EligibilityRequest) =>
    post<EligibilityResponse>('/eligibility/check', body),

  generateRoadmap: (body: RoadmapRequest) =>
    post<RoadmapResponse>('/roadmap/generate', body),

  interpretChange: (body: ReportRequest) =>
    post<ReportResponse>('/report/interpret', body),

  interpretNotice: (body: NoticeRequest) =>
    post<NoticeResponse>('/notice/interpret', body),

  recoveryPlan: (body: RecoveryRequest) =>
    post<RecoveryResponse>('/recovery/plan', body),
};

/** True when the base URL is configured in the environment. */
export function isBackendConfigured(): boolean {
  return BASE.length > 0;
}
