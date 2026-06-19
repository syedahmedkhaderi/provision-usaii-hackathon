// context/UserContext.tsx
// Global user profile state + storage — Spec Part 6

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Deadline, RiskProfile } from '../types';
import { loadProfile, saveProfile, clearProfile as clearStorage } from '../services/storageService';
import { computeDeadlines, computeRiskScore } from '../services/snapEngine';

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  deadlines: Deadline[];
  riskProfile: RiskProfile | null;
  isLoading: boolean;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
  updateProfile: () => {},
  deadlines: [],
  riskProfile: null,
  isLoading: true,
  clearProfile: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    (async () => {
      const stored = await loadProfile();
      if (stored) {
        setProfileState(stored);
      }
      setIsLoading(false);
    })();
  }, []);

  // Recompute deadlines + risk only once onboarding is complete and data is valid
  useEffect(() => {
    if (profile?.onboardingComplete && profile.enrollmentDate && profile.state) {
      const d = computeDeadlines(profile);
      const r = computeRiskScore(profile, d);
      setDeadlines(d);
      setRiskProfile(r);
    } else {
      setDeadlines([]);
      setRiskProfile(null);
    }
  }, [profile]);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveProfile(p);
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const updated = { ...(prev ?? {}), ...partial } as UserProfile;
      saveProfile(updated);
      return updated;
    });
  }, []);

  const clearProfile = useCallback(() => {
    clearStorage();
    setProfileState(null);
    setDeadlines([]);
    setRiskProfile(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ profile, setProfile, updateProfile, deadlines, riskProfile, isLoading, clearProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
