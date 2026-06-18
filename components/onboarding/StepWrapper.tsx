// components/onboarding/StepWrapper.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { WHITE } from '../../constants/colors';
import { PAGE_HORIZONTAL, LG, SECTION } from '../../constants/spacing';

interface StepWrapperProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  progress?: React.ReactNode;
}

export function StepWrapper({ children, footer, progress }: StepWrapperProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {progress && <View style={styles.progressWrap}>{progress}</View>}
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: SECTION,
    paddingBottom: SECTION,
  },
  progressWrap: {
    marginBottom: SECTION,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
