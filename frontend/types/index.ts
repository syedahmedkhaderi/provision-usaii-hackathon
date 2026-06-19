// types/index.ts
// Provision — TypeScript Types (Spec Part 4)

export type State = 'CA' | 'TX';
export type ReportingType = 'SAR' | 'QR' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high';

export type IssueType =
  | 'missed_sar7'
  | 'missed_recert'
  | 'closure_notice'
  | 'reduction_notice'
  | 'none';

export type DeadlineStatus = 'done' | 'urgent' | 'upcoming';

export interface UserProfile {
  state: State;
  enrollmentDate: string; // ISO date string 'YYYY-MM-DD'
  lastRecertDate: string | null;
  householdSize: number;
  reportingType: ReportingType;
  recentChange: string;
  issueType: IssueType;
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  date: string; // ISO date string
  daysUntil: number; // negative = past
  documents: string[];
  consequence: string;
  status: DeadlineStatus;
}

export interface RiskProfile {
  level: RiskLevel;
  score: number; // 0-100 rule-based
  reasons: string[];
}

export interface ReportResult {
  classification: string;
  needs_to_report: boolean;
  verdict: string;
  reasoning: string;
  what_to_do: string;
  contact: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RecoveryOption {
  action: string;
  detail: string;
  urgency: 'urgent' | 'medium' | 'low';
}

export interface ScanResult {
  document_type: string;
  plain_explanation: string;
  deadline_text: string | null;
  options: RecoveryOption[];
  contact: string;
}

export interface RecoveryTimeline {
  current_situation: string;
  steps: RecoveryStep[];
  fair_hearing_days: number;
  hearing_request_letter: string;
  reapply_note: string;
  contact: string;
}

export interface RecoveryStep {
  title: string;
  description: string;
  days_estimate: string; // e.g. 'Within 7 days', 'In about 14-30 days'
  is_critical: boolean;
}
