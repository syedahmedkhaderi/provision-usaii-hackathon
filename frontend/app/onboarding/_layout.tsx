// app/onboarding/_layout.tsx
// Stack layout for onboarding — Spec Part 7.2

import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
