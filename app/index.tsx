// app/index.tsx
// Redirect logic — onboarding vs home.

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useUser } from '../context/UserContext';
import { BLACK } from '../constants/colors';

export default function Index() {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={BLACK} />
      </View>
    );
  }

  if (profile?.onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
