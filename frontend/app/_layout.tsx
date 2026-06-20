// app/_layout.tsx
// Root layout — safe area, status bar, UserProvider wrapper.
// Spec Part 7.1

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { LanguageProvider } from '../context/LanguageContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
      <UserProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="recovery"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="settings"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      </UserProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
