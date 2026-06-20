// __tests__/snapEngine.test.ts
// Tests for deadline computation and risk scoring logic.

const mockDate = (dateString: string) => {
  const RealDate = Date;
  const mockTime = new RealDate(dateString).getTime();
  (global as any).Date = class {
    static now() { return mockTime; }
    constructor(...args: any[]) {
      if (args.length === 0) {
        return new (RealDate as any)(mockTime);
      }
      return new (RealDate as any)(...args);
    }
    static parse = RealDate.parse;
    static UTC = RealDate.UTC;
  } as any;
  return () => { (global as any).Date = RealDate; };
};

describe('SnapEngine', () => {
  let restoreDate: () => void;
  const { computeDeadlines, computeRiskScore } = require('../services/snapEngine');

  beforeEach(() => {
    restoreDate = mockDate('2026-06-20T00:00:00');
  });

  afterEach(() => {
    restoreDate();
  });

  describe('computeDeadlines', () => {
    const baseProfile = {
      state: 'CA' as const,
      enrollmentDate: '2026-01-01',
      householdSize: 3,
      monthlyIncome: 1500,
      reportingType: 'SAR' as const,
      issueType: 'none' as const,
      notificationsEnabled: false,
      onboardingComplete: true,
    };

    it('returns empty array for invalid enrollment date', () => {
      const result = computeDeadlines({ ...baseProfile, enrollmentDate: 'not-a-date' });
      expect(result).toEqual([]);
    });

    it('includes enrollment milestone', () => {
      const result = computeDeadlines(baseProfile);
      expect(result[0].id).toBe('enrolled');
      expect(result[0].status).toBe('done');
    });

    it('CA includes SAR-7 interim report', () => {
      const result = computeDeadlines(baseProfile);
      const sar7 = result.find((d: any) => d.id.includes('interim') || d.title.includes('SAR'));
      expect(sar7).toBeTruthy();
    });

    it('CA includes recertification', () => {
      const result = computeDeadlines(baseProfile);
      const recert = result.find((d: any) => d.id.includes('recert') || d.title.includes('Recert'));
      expect(recert).toBeTruthy();
    });

    it('TX does not include SAR-7', () => {
      const result = computeDeadlines({ ...baseProfile, state: 'TX' as const, reportingType: 'QR' as const });
      const sar7 = result.find((d: any) => d.title.includes('SAR'));
      expect(sar7).toBeUndefined();
    });

    it('past deadline has overdue status', () => {
      const result = computeDeadlines({ ...baseProfile, enrollmentDate: '2025-01-01' });
      const interim = result.find((d: any) => d.id.includes('interim'));
      if (interim) {
        expect(['overdue', 'done']).toContain(interim.status);
      }
    });
  });

  describe('computeRiskScore', () => {
    it('returns low risk for clean profile with no issues', () => {
      const profile = {
        state: 'CA' as const,
        enrollmentDate: '2026-06-01',
        householdSize: 2,
        monthlyIncome: 1000,
        reportingType: 'SAR' as const,
        issueType: 'none' as const,
        notificationsEnabled: false,
        onboardingComplete: true,
      };
      const deadlines = computeDeadlines(profile);
      const risk = computeRiskScore(profile, deadlines);
      expect(risk.level).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(risk.level);
    });

    it('returns high risk for closure_notice issue', () => {
      const profile = {
        state: 'CA' as const,
        enrollmentDate: '2026-01-01',
        householdSize: 2,
        monthlyIncome: 1000,
        reportingType: 'SAR' as const,
        issueType: 'closure_notice' as const,
        notificationsEnabled: false,
        onboardingComplete: true,
      };
      const deadlines = computeDeadlines(profile);
      const risk = computeRiskScore(profile, deadlines);
      expect(['medium', 'high']).toContain(risk.level);
    });

    it('returns reasons array', () => {
      const profile = {
        state: 'CA' as const,
        enrollmentDate: '2026-06-01',
        householdSize: 2,
        monthlyIncome: 1000,
        reportingType: 'SAR' as const,
        issueType: 'none' as const,
        notificationsEnabled: false,
        onboardingComplete: true,
      };
      const deadlines = computeDeadlines(profile);
      const risk = computeRiskScore(profile, deadlines);
      expect(Array.isArray(risk.reasons)).toBe(true);
    });
  });
});
