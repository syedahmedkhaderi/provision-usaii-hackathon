// components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BLACK, WHITE, TEXT_PRIMARY, TEXT_MUTED, CARD_BG, BORDER } from '../../constants/colors';
import { CAPTION, MEDIUM, FONT_FAMILY } from '../../constants/typography';
import { RADIUS_PILL } from '../../constants/spacing';

type BadgeVariant = 'solid' | 'outline' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'outline' }: BadgeProps) {
  const v = getVariantStyle(variant);
  return (
    <View style={[base.container, v.container]}>
      <Text style={[base.label, v.label]}>{label}</Text>
    </View>
  );
}

const base = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS_PILL,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: MEDIUM as '500',
  },
});

function getVariantStyle(variant: BadgeVariant) {
  switch (variant) {
    case 'solid':
      return StyleSheet.create({
        container: { backgroundColor: BLACK },
        label: { color: WHITE },
      });
    case 'muted':
      return StyleSheet.create({
        container: { backgroundColor: CARD_BG },
        label: { color: TEXT_MUTED },
      });
    case 'outline':
    default:
      return StyleSheet.create({
        container: { backgroundColor: 'transparent', borderWidth: 0.5, borderColor: BORDER },
        label: { color: TEXT_PRIMARY },
      });
  }
}
