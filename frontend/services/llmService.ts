/**
 * llmService.ts  –  AI feature calls, routed through the Provision backend
 *
 * All functions return null on any error; screens handle gracefully.
 * Set EXPO_PUBLIC_API_BASE_URL in frontend/.env (your machine's LAN IP:8000).
 */

import { UserProfile, ReportResult, ScanResult, RecoveryTimeline, EligibilityEstimate } from '../types';
import { SNAP_RULES } from '../constants/snapRules';
import { api, isBackendConfigured } from './apiClient';

// ── analyzeChange ──────────────────────────────────────────────────────────────

export async function analyzeChange(
  input: string,
  profile: UserProfile,
): Promise<ReportResult | null> {
  if (!isBackendConfigured()) {
    console.warn('[llmService] EXPO_PUBLIC_API_BASE_URL not set — backend not configured');
    return null;
  }

  try {
    const res = await api.interpretChange({
      state: profile.state,
      change_text: input,
      household_context: {
        household_size: profile.householdSize,
        current_monthly_income: profile.monthlyIncome ?? 0,
      },
    });

    const rules = SNAP_RULES[profile.state];
    const deadlineSuffix = res.deadline_days ? ` within ${res.deadline_days} days` : '';

    return {
      classification: res.category,
      needs_to_report: res.must_report,
      verdict: res.must_report
        ? `You likely need to report this${deadlineSuffix}.`
        : 'You likely do not need to report this right now.',
      reasoning: res.reasoning,
      what_to_do: res.deadline_days
        ? `Contact your caseworker${deadlineSuffix} at ${res.caseworker_phone}.`
        : `Confirm with your caseworker at ${res.caseworker_phone}.`,
      contact: res.caseworker_phone || rules.caseworkerPhone,
      confidence: res.confidence ?? 'medium',
      deadline_days: res.deadline_days,
      citations: res.citations,
      ai_explanation_unavailable: res.ai_explanation_unavailable,
      disclaimer: res.disclaimer,
      call_script: (res as any).call_script,
    };
  } catch (err) {
    console.error('[llmService] analyzeChange failed:', err);
    return null;
  }
}

// ── scanDocument ───────────────────────────────────────────────────────────────

export async function scanDocument(
  imageBase64: string,
  profile: UserProfile,
): Promise<ScanResult | null> {
  if (!isBackendConfigured()) {
    console.warn('[llmService] EXPO_PUBLIC_API_BASE_URL not set — backend not configured');
    return null;
  }

  try {
    const res = await api.interpretNotice({
      state: profile.state,
      image_base64: imageBase64,
    });

    const rules = SNAP_RULES[profile.state];

    return {
      document_type: res.notice_type.replace(/_/g, ' '),
      plain_explanation: res.what_it_means,
      deadline_text: res.deadline_days ? `${res.deadline_days} days` : null,
      options: res.options.map((opt) => ({
        action: opt.label,
        detail: opt.detail,
        urgency: res.urgency === 'urgent' ? ('urgent' as const) : ('medium' as const),
      })),
      contact: rules.caseworkerPhone,
      citations: res.citations,
      ai_explanation_unavailable: res.ai_explanation_unavailable,
      disclaimer: res.disclaimer,
      confidence: (res as any).confidence ?? 'medium',
      key_facts: (res as any).key_facts,
    };
  } catch (err) {
    console.error('[llmService] scanDocument failed:', err);
    return null;
  }
}

// ── generateRecoveryTimeline ───────────────────────────────────────────────────

export async function generateRecoveryTimeline(
  profile: UserProfile,
): Promise<RecoveryTimeline | null> {
  if (!isBackendConfigured()) {
    console.warn('[llmService] EXPO_PUBLIC_API_BASE_URL not set — backend not configured');
    return null;
  }

  try {
    const res = await api.recoveryPlan({
      state: profile.state,
      situation: profile.issueType,
    });

    const rules = SNAP_RULES[profile.state];

    return {
      current_situation: profile.issueType.replace(/_/g, ' '),
      steps: res.steps.map((s, i) => ({
        title: s.title,
        description: s.detail,
        days_estimate: i === 0 ? 'Immediately' : 'Within a few days',
        is_critical: i === 0,
      })),
      fair_hearing_days: res.fair_hearing_deadline_days,
      hearing_request_letter: res.letter_template,
      reapply_note: res.reapply_note ?? '',
      contact: rules.caseworkerPhone,
    };
  } catch (err) {
    console.error('[llmService] generateRecoveryTimeline failed:', err);
    return null;
  }
}

// ── simulateEligibility ────────────────────────────────────────────────────────
// Calls /eligibility/check with a modified scenario to power the "What Would Change?" estimator.

interface Scenario {
  id: string;
  label: string;
  incomeChange?: number;
  householdChange?: number;
  isJobLoss?: boolean;
}

export async function simulateEligibility(
  profile: UserProfile,
  scenario: Scenario,
): Promise<EligibilityEstimate | null> {
  if (!isBackendConfigured()) return null;

  try {
    const baseIncome = profile.monthlyIncome ?? 0;
    let simIncome = baseIncome;
    let simHousehold = profile.householdSize;

    if (scenario.incomeChange) simIncome = Math.max(0, baseIncome + scenario.incomeChange);
    if (scenario.householdChange) simHousehold = Math.max(1, simHousehold + scenario.householdChange);
    if (scenario.isJobLoss) simIncome = 0;

    const res = await api.checkEligibility({
      state: profile.state,
      household_size: simHousehold,
      monthly_gross_income: simIncome,
      has_elderly_or_disabled: false,
      monthly_rent: 0,
      dependent_care_cost: 0,
    });

    return {
      likelyEligible: res.likely_eligible,
      benefitRange: res.estimated_monthly_benefit_range,
      confidence: res.confidence,
    };
  } catch (err) {
    console.error('[llmService] simulateEligibility failed:', err);
    return null;
  }
}
