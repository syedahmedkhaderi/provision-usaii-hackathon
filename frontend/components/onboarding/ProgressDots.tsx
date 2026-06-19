// components/onboarding/ProgressDots.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SAGE, BORDER, TEXT_MUTED } from '../../constants/colors';
import { LABEL_SM, FONT_FAMILY } from '../../constants/typography';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepsLabel}>
        Step {current} of {total}
      </Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < current ? SAGE : BORDER },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  stepsLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
