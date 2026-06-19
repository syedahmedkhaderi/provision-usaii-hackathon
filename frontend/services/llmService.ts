// services/llmService.ts
// OpenAI API calls — Spec Part 12
// All calls return null on error; screens handle gracefully.

import { UserProfile, ReportResult, ScanResult, RecoveryTimeline } from '../types';
import { SNAP_RULES } from '../constants/snapRules';

const BASE_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

async function callLLM(
  systemPrompt: string,
  userContent: string | Array<Record<string, unknown>>,
  maxTokens: number
): Promise<string | null> {
  if (!API_KEY) {
    console.warn('[llmService] No API key set — EXPO_PUBLIC_OPENAI_API_KEY missing');
    return null;
  }

  try {
    const body: Record<string, unknown> = {
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('[llmService] API error', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return text ?? null;
  } catch (e) {
    console.error('[llmService] Network error', e);
    return null;
  }
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    // Strip any markdown fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export async function analyzeChange(
  input: string,
  profile: UserProfile
): Promise<ReportResult | null> {
  const rules = SNAP_RULES[profile.state];
  const systemPrompt = `You are Provision, a SNAP benefits navigator AI. The user is in ${profile.state} (${rules.stateName}) with ${profile.reportingType} reporting. Their household size is ${profile.householdSize}. Analyze the change they describe and return ONLY valid JSON with this exact schema — no markdown, no extra text:
{
  "classification": string,
  "needs_to_report": boolean,
  "verdict": string,
  "reasoning": string,
  "what_to_do": string,
  "contact": string,
  "confidence": "high" | "medium" | "low"
}
Set confidence to "low" for complex, ambiguous, or high-stakes cases.
Never say the user definitely qualifies or does not qualify.
Always recommend verifying with a caseworker.
Reasoning should cite state rules. Verdict is one sentence. What_to_do is a specific next action.
Contact should be the caseworker phone: ${rules.caseworkerPhone}.`;

  const raw = await callLLM(systemPrompt, input, 500);
  return safeParse<ReportResult>(raw);
}

export async function scanDocument(
  imageBase64: string,
  profile: UserProfile
): Promise<ScanResult | null> {
  const rules = SNAP_RULES[profile.state];
  const systemPrompt = `You are Provision. The user photographed a SNAP-related notice. They are in ${profile.state} with ${profile.reportingType} reporting. Return ONLY valid JSON:
{
  "document_type": string,
  "plain_explanation": string,
  "deadline_text": string | null,
  "options": [{ "action": string, "detail": string, "urgency": "urgent" | "medium" | "low" }],
  "contact": string
}
Plain explanation: 2-3 sentences in simple language.
Never provide legal advice. Always recommend contacting caseworker.
Contact should be: ${rules.caseworkerPhone}.`;

  const userContent = [
    {
      type: 'text',
      text: 'Please analyze this SNAP notice image and explain what it means.',
    },
    {
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
    },
  ];

  const raw = await callLLM(systemPrompt, userContent as unknown as string, 600);
  return safeParse<ScanResult>(raw);
}

export async function generateRecoveryTimeline(
  profile: UserProfile
): Promise<RecoveryTimeline | null> {
  const rules = SNAP_RULES[profile.state];
  const systemPrompt = `You are Provision. The user's issue is: ${profile.issueType}. They are in ${profile.state} (${rules.stateName}). Return ONLY valid JSON:
{
  "current_situation": string,
  "steps": [{ "title": string, "description": string, "days_estimate": string, "is_critical": boolean }],
  "fair_hearing_days": number,
  "hearing_request_letter": string,
  "reapply_note": string,
  "contact": string
}
hearing_request_letter: a template letter requesting a fair hearing, with [BRACKET] placeholders for user details.
Steps: 3-5 steps max. Describe typical process, not guarantees.
Frame everything as "what typically happens" not "what will happen".
Contact should be: ${rules.caseworkerPhone}.
Fair hearing days for this state: ${rules.fairHearingDays}.`;

  const raw = await callLLM(systemPrompt, profile.recentChange || `Issue: ${profile.issueType}`, 800);
  return safeParse<RecoveryTimeline>(raw);
}
