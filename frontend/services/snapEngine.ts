// services/snapEngine.ts
// Rule computations — deterministic, no AI.
// Spec Part 5.2

import { UserProfile, Deadline, RiskProfile, RiskLevel, Lang } from '../types';
import { SNAP_RULES } from '../constants/snapRules';

const MS_PER_DAY = 86400000;

export function computeDeadlines(profile: UserProfile): Deadline[] {
  const rules = SNAP_RULES[profile.state];
  const enrollDate = new Date(profile.enrollmentDate + 'T00:00:00');
  if (isNaN(enrollDate.getTime())) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlines: Deadline[] = [];

  // Enrollment milestone (always "done")
  deadlines.push({
    id: 'enrolled',
    title: `Enrolled in ${rules.benefitName}`,
    date: profile.enrollmentDate,
    daysUntil: Math.floor((enrollDate.getTime() - today.getTime()) / MS_PER_DAY),
    documents: [],
    consequence: '',
    status: 'done',
  });

  // Interim report (CA only)
  if (rules.interimReportMonths && rules.interimReportName) {
    const interimDate = new Date(enrollDate);
    interimDate.setMonth(interimDate.getMonth() + rules.interimReportMonths);
    const daysUntil = Math.floor((interimDate.getTime() - today.getTime()) / MS_PER_DAY);
    deadlines.push({
      id: 'interim',
      title: `${rules.interimReportName} interim report`,
      date: interimDate.toISOString().split('T')[0],
      daysUntil,
      documents: rules.documents.interimReport,
      consequence: 'Missing this may terminate your benefits',
      status: daysUntil < 0 ? 'overdue' : daysUntil <= 14 ? 'urgent' : 'upcoming',
    });
  }

  // Recertification
  const recertDate = new Date(enrollDate);
  recertDate.setMonth(recertDate.getMonth() + rules.recertPeriodMonths);
  const daysUntilRecert = Math.floor((recertDate.getTime() - today.getTime()) / MS_PER_DAY);
  deadlines.push({
    id: 'recert',
    title: 'Recertification interview',
    date: recertDate.toISOString().split('T')[0],
    daysUntil: daysUntilRecert,
    documents: rules.documents.recertification,
    consequence: 'Benefits end if recertification is not completed',
    status: daysUntilRecert < 0 ? 'overdue' : daysUntilRecert <= 14 ? 'urgent' : 'upcoming',
  });

  return deadlines;
}

export function computeRiskScore(
  profile: UserProfile,
  deadlines: Deadline[]
): RiskProfile {
  let score = 0;
  const reasons: string[] = [];

  // Active issue
  if (profile.issueType !== 'none') {
    score += 45;
    reasons.push('An active issue has been reported');
  }

  // Overdue deadlines — highest risk
  const nextOverdue = deadlines.find((d) => d.status === 'overdue');
  if (nextOverdue) {
    score += 50;
    reasons.push(`${nextOverdue.title} is overdue`);
  }

  // Deadline proximity
  const nextUrgent = deadlines.find((d) => d.status === 'urgent');
  if (nextUrgent) {
    if (nextUrgent.daysUntil <= 7) {
      score += 35;
      reasons.push(`${nextUrgent.title} is due in ${nextUrgent.daysUntil} days`);
    } else if (nextUrgent.daysUntil <= 14) {
      score += 20;
      reasons.push(`${nextUrgent.title} is due in ${nextUrgent.daysUntil} days`);
    }
  }

  // Recent change flagged
  if (profile.recentChange && profile.recentChange.trim().length > 0) {
    score += 10;
    reasons.push('A recent change may require reporting');
  }

  const level: RiskLevel = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  return { level, score: Math.min(score, 100), reasons };
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatDeadlineDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}`;
}

export function daysLabel(daysUntil: number, isoDate?: string, lang: Lang = 'en'): string {
  if (daysUntil === 0) return lang === 'es' ? 'Vence hoy' : 'Due today';
  if (daysUntil > 0) return lang === 'es' ? `${daysUntil} días restantes` : `${daysUntil} days left`;
  if (isoDate) {
    const d = new Date(isoDate + 'T00:00:00');
    const months = lang === 'es' ? MONTHS_ES : MONTHS_EN;
    return lang === 'es'
      ? `Vencido desde ${months[d.getMonth()]} ${d.getFullYear()}`
      : `Overdue since ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return lang === 'es' ? 'Vencido' : 'Overdue';
}
