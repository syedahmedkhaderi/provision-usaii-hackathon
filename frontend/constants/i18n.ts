// constants/i18n.ts
// All user-visible strings in English and Spanish.
// Usage: const t = useT(); then {t.dashTitle} or {t.ofReady(2, 5)}

import { Lang } from '../types';

export interface Strings {
  // AppHeader / status banner
  dashTitle: string;
  onTrack: string;
  actionComingUp: string;
  attentionNeeded: string;
  actionNeededSoon: string;
  actionOverdue: string;
  noDeadlinesSoon: string;
  nextActionDays: (n: number) => string;
  aDeadlineIsApproaching: string;
  actionRequired: string;

  // Dashboard body
  deadlines: string;
  noUpcomingDeadlines: string;
  reportAChange: string;
  scanANotice: string;
  eligibilityEstimateLabel: string;
  perMonth: string;
  lowConfidence: string;
  estimateDisclaimer: string;
  aiLimitsText: string;
  yourSomethingIsOverdue: (title: string) => string;
  yourDeadlineInDays: (title: string, n: number) => string;
  gatherDocumentsFor: (title: string, n: number) => string;
  nextAction: (title: string, n: number) => string;
  upToDate: string;
  reportedRecentChange: string;

  // Roadmap
  roadmapTitle: string;
  noDeadlinesComingUp: string;
  documentsNeeded: string;
  ofReady: (ready: number, total: number) => string;
  shareList: string;
  shareListTitle: (deadlineTitle: string) => string;
  shareListDue: (date: string) => string;
  shareListReady: string;
  shareListStillNeeded: string;

  // Badges / pills (DeadlineCard + RoadmapStep)
  done: string;
  soon: string;
  overdue: string;
  onTrackBadge: string;
  gather: string;
  atRisk: string;
  estimateCaseworkerConfirms: string;

  // Scan
  scanTitle: string;
  scanSubtitle: string;
  aiUnavailable: string;

  // Settings
  profileSettings: string;
  save: string;
  languageLabel: string;
  languageEn: string;
  languageEs: string;
  preferences: string;
  deadlineReminders: string;
  deadlineRemindersSub: string;

  // daysLabel
  dueToday: string;
  daysLeft: (n: number) => string;
  overdueSince: (month: string, year: number) => string;
  overdueLabel: string;
  months: readonly string[];
}

const en: Strings = {
  dashTitle: 'Your dashboard',
  onTrack: "You're on track",
  actionComingUp: 'Action coming up',
  attentionNeeded: 'Attention needed',
  actionNeededSoon: 'Action needed soon',
  actionOverdue: 'Action overdue',
  noDeadlinesSoon: 'No deadlines soon',
  nextActionDays: (n) => `Next action in ${n} days`,
  aDeadlineIsApproaching: 'A deadline is approaching',
  actionRequired: 'Action required',

  deadlines: 'Deadlines',
  noUpcomingDeadlines: 'No upcoming deadlines.',
  reportAChange: 'Report a change',
  scanANotice: 'Scan a notice',
  eligibilityEstimateLabel: 'ELIGIBILITY ESTIMATE',
  perMonth: '/ month',
  lowConfidence: ' · Low confidence',
  estimateDisclaimer: 'Estimate only. Your caseworker makes the final eligibility determination.',
  aiLimitsText: 'Provision never decides your eligibility. We say "you likely qualify." Only your caseworker can make that determination.',
  yourSomethingIsOverdue: (title) => `Your ${title} is overdue. Contact your caseworker immediately.`,
  yourDeadlineInDays: (title, n) => `Your ${title} deadline is in ${n} days. Start calling your caseworker today.`,
  gatherDocumentsFor: (title, n) => `Start gathering documents for your ${title}. Due in ${n} days.`,
  nextAction: (title, n) => `Your next action: ${title} in ${n} days. Check your roadmap.`,
  upToDate: "You're up to date. Check back when your next renewal period approaches.",
  reportedRecentChange: "You reported a recent change. Make sure you've contacted your caseworker within the required window.",

  roadmapTitle: 'Renewal roadmap',
  noDeadlinesComingUp: 'No deadlines coming up',
  documentsNeeded: 'DOCUMENTS NEEDED',
  ofReady: (ready, total) => `${ready} of ${total} ready`,
  shareList: 'Share list',
  shareListTitle: (title) => `Provision: ${title}`,
  shareListDue: (date) => `Due: ${date}`,
  shareListReady: '✓ Ready:',
  shareListStillNeeded: 'Still needed:',

  done: 'Done',
  soon: 'Soon',
  overdue: 'Overdue',
  onTrackBadge: 'On track',
  gather: 'Gather:',
  atRisk: 'at risk',
  estimateCaseworkerConfirms: 'Estimate. Your caseworker confirms.',

  scanTitle: 'Scan a notice',
  scanSubtitle: 'Photograph a letter. We\'ll explain it.',
  aiUnavailable: 'AI explanation briefly unavailable. Showing rule-based answer.',

  profileSettings: 'Profile & Settings',
  save: 'Save',
  languageLabel: 'Language',
  languageEn: 'English',
  languageEs: 'Español',
  preferences: 'PREFERENCES',
  deadlineReminders: 'Deadline reminders',
  deadlineRemindersSub: '30, 14, 7, and 2 days before each deadline',

  dueToday: 'Due today',
  daysLeft: (n) => `${n} days left`,
  overdueSince: (month, year) => `Overdue since ${month} ${year}`,
  overdueLabel: 'Overdue',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const es: Strings = {
  dashTitle: 'Tu panel',
  onTrack: 'Estás al día',
  actionComingUp: 'Acción próxima',
  attentionNeeded: 'Atención requerida',
  actionNeededSoon: 'Acción necesaria pronto',
  actionOverdue: 'Acción vencida',
  noDeadlinesSoon: 'Sin fechas límite próximas',
  nextActionDays: (n) => `Próxima acción en ${n} días`,
  aDeadlineIsApproaching: 'Una fecha límite se acerca',
  actionRequired: 'Se requiere acción',

  deadlines: 'Fechas límite',
  noUpcomingDeadlines: 'Sin fechas límite próximas.',
  reportAChange: 'Reportar un cambio',
  scanANotice: 'Escanear un aviso',
  eligibilityEstimateLabel: 'ESTIMACIÓN DE ELEGIBILIDAD',
  perMonth: '/ mes',
  lowConfidence: ' · Baja confianza',
  estimateDisclaimer: 'Solo estimación. Su trabajador/a social determina la elegibilidad final.',
  aiLimitsText: 'Provision nunca decide su elegibilidad. Decimos "probablemente califica." Solo su trabajador/a social puede tomar esa decisión.',
  yourSomethingIsOverdue: (title) => `Su ${title} está vencido. Contacte a su trabajador/a social de inmediato.`,
  yourDeadlineInDays: (title, n) => `Su fecha límite de ${title} es en ${n} días. Comience a llamar a su trabajador/a social hoy.`,
  gatherDocumentsFor: (title, n) => `Comience a reunir documentos para su ${title}. Vence en ${n} días.`,
  nextAction: (title, n) => `Su próxima acción: ${title} en ${n} días. Revise su hoja de ruta.`,
  upToDate: 'Está al día. Vuelva cuando se acerque su próximo período de renovación.',
  reportedRecentChange: 'Reportó un cambio reciente. Asegúrese de haber contactado a su trabajador/a social dentro del plazo requerido.',

  roadmapTitle: 'Hoja de ruta de renovación',
  noDeadlinesComingUp: 'Sin fechas límite próximas',
  documentsNeeded: 'DOCUMENTOS NECESARIOS',
  ofReady: (ready, total) => `${ready} de ${total} listos`,
  shareList: 'Compartir lista',
  shareListTitle: (title) => `Provision: ${title}`,
  shareListDue: (date) => `Vence: ${date}`,
  shareListReady: '✓ Listo:',
  shareListStillNeeded: 'Aún necesario:',

  done: 'Completado',
  soon: 'Pronto',
  overdue: 'Vencido',
  onTrackBadge: 'Al día',
  gather: 'Reunir:',
  atRisk: 'en riesgo',
  estimateCaseworkerConfirms: 'Estimación. Su trabajador/a social confirma.',

  scanTitle: 'Escanear un aviso',
  scanSubtitle: 'Fotografíe una carta. Se la explicaremos.',
  aiUnavailable: 'Explicación de IA no disponible momentáneamente. Mostrando respuesta basada en reglas.',

  profileSettings: 'Perfil y Configuración',
  save: 'Guardar',
  languageLabel: 'Idioma',
  languageEn: 'Inglés',
  languageEs: 'Español',
  preferences: 'PREFERENCIAS',
  deadlineReminders: 'Recordatorios de fechas',
  deadlineRemindersSub: '30, 14, 7 y 2 días antes de cada fecha límite',

  dueToday: 'Vence hoy',
  daysLeft: (n) => `${n} días restantes`,
  overdueSince: (month, year) => `Vencido desde ${month} ${year}`,
  overdueLabel: 'Vencido',
  months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
};

export const S: Record<Lang, Strings> = { en, es };
