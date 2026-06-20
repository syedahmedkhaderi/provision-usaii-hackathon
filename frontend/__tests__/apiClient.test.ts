// __tests__/apiClient.test.ts
// Tests that the API client constructs correct requests and handles errors.

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('isBackendConfigured', () => {
    it('returns true even without env var (defaults to Render backend)', () => {
      const original = process.env.EXPO_PUBLIC_API_BASE_URL;
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
      jest.isolateModules(() => {
        const { isBackendConfigured } = require('../services/apiClient');
        // Now defaults to Render URL, so always configured
        expect(isBackendConfigured()).toBe(true);
      });
      process.env.EXPO_PUBLIC_API_BASE_URL = original;
    });

    it('returns true when EXPO_PUBLIC_API_BASE_URL is set', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
      jest.isolateModules(() => {
        const { isBackendConfigured } = require('../services/apiClient');
        expect(isBackendConfigured()).toBe(true);
      });
    });
  });

  describe('checkEligibility', () => {
    it('posts the correct eligibility payload', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
      const { api } = require('../services/apiClient');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          likely_eligible: true,
          confidence: 'medium',
          estimated_monthly_benefit_range: [300, 536],
          explanation: 'Test explanation',
          citations: [],
          disclaimer: 'Guidance only',
        }),
      });

      const result = await api.checkEligibility({
        state: 'CA',
        household_size: 2,
        monthly_gross_income: 1200,
        has_elderly_or_disabled: false,
        monthly_rent: 900,
        dependent_care_cost: 0,
      });

      expect(result.likely_eligible).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/eligibility/check');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('throws on backend error', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
      const { api } = require('../services/apiClient');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'server error',
      });

      await expect(
        api.checkEligibility({
          state: 'CA',
          household_size: 2,
          monthly_gross_income: 1200,
          has_elderly_or_disabled: false,
          monthly_rent: 900,
          dependent_care_cost: 0,
        }),
      ).rejects.toThrow();
    });
  });

  describe('interpretChange', () => {
    it('posts report payload and returns result', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
      const { api } = require('../services/apiClient');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          category: 'income_increase',
          must_report: true,
          deadline_days: 10,
          reasoning: 'You should report this.',
          confidence: 'high',
          citations: [{ label: 'Test', source: 'Test' }],
          caseworker_phone: '1-877-847-3663',
          ai_explanation_unavailable: false,
          disclaimer: 'Guidance only',
        }),
      });

      const result = await api.interpretChange({
        state: 'CA',
        change_text: 'I got a raise',
        household_context: { household_size: 2, current_monthly_income: 1200 },
      });

      expect(result.category).toBe('income_increase');
      expect(result.must_report).toBe(true);
      expect(result.deadline_days).toBe(10);
    });
  });

  describe('health', () => {
    it('returns health status', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';
      const { api } = require('../services/apiClient');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok', gemini_available: true }),
      });

      const result = await api.health();
      expect(result.status).toBe('ok');
      expect(result.gemini_available).toBe(true);
    });
  });
});
