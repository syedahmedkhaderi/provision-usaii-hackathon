// __tests__/storageService.test.ts
// Tests for AsyncStorage profile persistence.

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = require('@react-native-async-storage/async-storage');

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadProfile', () => {
    it('returns null when no stored profile', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      const { loadProfile } = require('../services/storageService');
      const result = await loadProfile();
      expect(result).toBeNull();
    });

    it('returns parsed profile when stored', async () => {
      const mockProfile = {
        state: 'CA',
        householdSize: 3,
        monthlyIncome: 1500,
        enrollmentDate: '2026-01-01',
        onboardingComplete: true,
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockProfile));
      const { loadProfile } = require('../services/storageService');
      const result = await loadProfile();
      expect(result).toEqual(mockProfile);
    });

    it('returns null on invalid JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('not valid json');
      const { loadProfile } = require('../services/storageService');
      const result = await loadProfile();
      expect(result).toBeNull();
    });
  });

  describe('saveProfile', () => {
    it('calls AsyncStorage.setItem with serialized profile', async () => {
      const { saveProfile } = require('../services/storageService');
      const profile = {
        state: 'CA',
        householdSize: 2,
        onboardingComplete: true,
      } as any;
      await saveProfile(profile);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      const [key, value] = mockAsyncStorage.setItem.mock.calls[0];
      expect(key).toBeTruthy();
      expect(JSON.parse(value)).toEqual(profile);
    });
  });

  describe('clearProfile', () => {
    it('calls AsyncStorage.removeItem', async () => {
      const { clearProfile } = require('../services/storageService');
      await clearProfile();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    });
  });
});
