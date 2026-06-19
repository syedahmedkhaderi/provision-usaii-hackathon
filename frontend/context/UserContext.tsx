// context/UserContext.tsx
// Global user profile state + storage — Spec Part 6

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Deadline, DeadlineStatus, RiskProfile, EligibilityEstimate } from '../types';
import { loadProfile, saveProfile, clearProfile as clearStorage } from '../services/storageService';
import { computeDeadlines, computeRiskScore } from '../services/snapEngine';
import { api, isBackendConfigured } from '../services/apiClient';
import { SNAP_RULES } from '../constants/snapRules';

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  deadlines: Deadline[];
  riskProfile: RiskProfile | null;
  eligibilityEstimate: EligibilityEstimate | null;
  isLoading: boolean;
  clearProfile: () => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
  updateProfile: () => {},
  deadlines: [],
  riskProfile: null,
  eligibilityEstimate: null,
  isLoading: true,
  clearProfile: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [eligibilityEstimate, setEligibilityEstimate] = useState<EligibilityEstimate | null>(null);
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

  // Recompute deadlines + risk + fetch eligibility when profile is complete
  useEffect(() => {
    if (profile?.onboardingComplete && profile.enrollmentDate && profile.state) {
      // Compute immediately from local rules (fast, offline)
      const localDeadlines = computeDeadlines(profile);
      const localRisk = computeRiskScore(profile, localDeadlines);
      setDeadlines(localDeadlines);
      setRiskProfile(localRisk);

      if (isBackendConfigured()) {
        // Fetch server-side roadmap and replace local deadlines when ready
        api.generateRoadmap({
          state: profile.state,
          enrollment_date: profile.enrollmentDate,
          household_size: profile.householdSize,
        }).then((res) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const enrollDate = new Date(profile.enrollmentDate + 'T00:00:00');
          const serverDeadlines: Deadline[] = [
            {
              id: 'enrolled',
              title: `Enrolled in ${SNAP_RULES[profile.state].benefitName}`,
              date: profile.enrollmentDate,
              daysUntil: Math.floor((enrollDate.getTime() - today.getTime()) / 86400000),
              documents: [],
              consequence: '',
              status: 'done' as const,
            },
            ...res.steps.map((step, i) => {
              const dueDate = new Date(step.due_date + 'T00:00:00');
              const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / 86400000);
              return {
                id: `step_${i}`,
                title: step.title,
                date: step.due_date,
                daysUntil,
                documents: step.documents,
                consequence: step.consequence,
                status: (daysUntil < 0 ? 'overdue' : daysUntil <= 14 ? 'urgent' : 'upcoming') as DeadlineStatus,
              };
            }),
          ];
          setDeadlines(serverDeadlines);
          setRiskProfile(computeRiskScore(profile, serverDeadlines));
        }).catch(() => {
          // local computation already set above — silently fall back
        });

        // Fetch eligibility estimate when income is available
        const income = profile.monthlyIncome ?? 0;
        if (income > 0) {
          api.checkEligibility({
            state: profile.state,
            household_size: profile.householdSize,
            monthly_gross_income: income,
            has_elderly_or_disabled: false,
            monthly_rent: 0,
            dependent_care_cost: 0,
          }).then((res) => {
            setEligibilityEstimate({
              likelyEligible: res.likely_eligible,
              benefitRange: res.estimated_monthly_benefit_range,
              confidence: res.confidence,
            });
          }).catch(() => {
            // eligibility is nice-to-have, fail silently
          });
        }
      }
    } else {
      setDeadlines([]);
      setRiskProfile(null);
      setEligibilityEstimate(null);
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
    setEligibilityEstimate(null);
  }, []);

  return (
    <UserContext.Provider
      value={{ profile, setProfile, updateProfile, deadlines, riskProfile, eligibilityEstimate, isLoading, clearProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
