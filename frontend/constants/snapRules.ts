// constants/snapRules.ts
// DETERMINISTIC state rules. No AI. Hard-coded CA + TX data.
// Spec Part 5.1

import { ReportingType } from '../types';

export const SNAP_RULES = {
  CA: {
    stateName: 'California',
    benefitName: 'CalFresh',
    reportingType: 'SAR' as ReportingType,
    recertPeriodMonths: 12,
    interimReportMonths: 6, // SAR-7 at 6-month mark
    interimReportName: 'SAR-7',
    fairHearingDays: 90,
    caseworkerPhone: '1-877-847-3663',
    caseworkerName: 'California Benefits Line',
    incomeReportingThreshold: {
      // 130% FPL gross income limit — FY2026 USDA FNS, matches backend GROSS_LIMIT_130
      1: 1696, 2: 2291, 3: 2887, 4: 3483, 5: 4079,
    } as Record<number, number>,
    documents: {
      interimReport: [
        '2 most recent pay stubs',
        'Bank statement from the last 30 days',
        'Any documentation of new income sources',
      ],
      recertification: [
        'Government-issued photo ID',
        'Proof of income (pay stubs or award letters)',
        'Proof of rent or mortgage',
        'Most recent utility bill',
        'Social Security cards for all household members',
      ],
    },
    reportingChanges: {
      mustReport: [
        'Income exceeds Income Reporting Threshold',
        'Lottery or gambling winnings over $4,250',
        'Change in household composition',
      ],
      mayAffectBenefits: [
        'New employment',
        'Loss of employment',
        'Change in hours worked',
        'Change in address',
      ],
    },
  },
  TX: {
    stateName: 'Texas',
    benefitName: 'SNAP (Texas)',
    reportingType: 'QR' as ReportingType,
    recertPeriodMonths: 6, // shorter cert for many TX households
    interimReportMonths: null, // no mid-period SAR in standard TX
    interimReportName: null,
    fairHearingDays: 90,
    caseworkerPhone: '2-1-1',
    caseworkerName: 'Texas Benefits Helpline (dial 2-1-1)',
    incomeReportingThreshold: null,
    documents: {
      interimReport: [],
      recertification: [
        'Government-issued ID',
        'Social Security card for each household member',
        'Proof of all household income',
        'Proof of residence (utility bill or signed lease)',
        'Documentation of expenses (rent, childcare, utilities)',
      ],
    },
    reportingChanges: {
      mustReport: [
        'Change in income',
        'Change in household size',
        'Change in address',
        'Change in employment status',
      ],
      mayAffectBenefits: [
        'Change in work hours',
        'New income sources',
      ],
    },
  },
};
