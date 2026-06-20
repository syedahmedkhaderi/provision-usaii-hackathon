// __tests__/snapRules.test.ts
// Tests that the deterministic SNAP rules in the frontend match expected behavior.

describe('SNAP Rules Constants', () => {
  const SNAP_RULES = require('../constants/snapRules').SNAP_RULES;

  describe('California rules', () => {
    const ca = SNAP_RULES.CA;

    it('has correct state name and program name', () => {
      expect(ca.stateName).toBe('California');
      expect(ca.benefitName).toContain('CalFresh');
    });

    it('has SAR-7 reporting type', () => {
      expect(ca.reportingType).toBe('SAR');
    });

    it('has interim report at 6 months', () => {
      expect(ca.interimReportMonths).toBe(6);
    });

    it('has recertification at 12 months', () => {
      expect(ca.recertPeriodMonths).toBe(12);
    });

    it('has 90-day fair hearing window', () => {
      expect(ca.fairHearingDays).toBe(90);
    });

    it('has caseworker phone number', () => {
      expect(ca.caseworkerPhone).toBeTruthy();
      expect(ca.caseworkerPhone.length).toBeGreaterThan(5);
    });
  });

  describe('Texas rules', () => {
    const tx = SNAP_RULES.TX;

    it('has correct state name and program name', () => {
      expect(tx.stateName).toBe('Texas');
      expect(tx.benefitName).toContain('SNAP');
    });

    it('has QR reporting type', () => {
      expect(tx.reportingType).toBe('QR');
    });

    it('has recertification at 6 months', () => {
      expect(tx.recertPeriodMonths).toBe(6);
    });

    it('has 90-day fair hearing window', () => {
      expect(tx.fairHearingDays).toBe(90);
    });

    it('has 2-1-1 caseworker phone', () => {
      expect(tx.caseworkerPhone).toMatch(/2.*1.*1/);
    });
  });

  describe('Both states', () => {
    it('have caseworker name defined', () => {
      expect(SNAP_RULES.CA.caseworkerName).toBeTruthy();
      expect(SNAP_RULES.TX.caseworkerName).toBeTruthy();
    });
  });
});
