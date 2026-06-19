// components/ui/SectionLabel.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TEXT_MUTED } from '../../constants/colors';
import { CAPTION, MEDIUM, FONT_FAMILY, LETTERSPACING_CAPTION } from '../../constants/typography';

interface SectionLabelProps {
  children: React.ReactNode;
  style?: object;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: MEDIUM as '500',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: LETTERSPACING_CAPTION,
  },
});
