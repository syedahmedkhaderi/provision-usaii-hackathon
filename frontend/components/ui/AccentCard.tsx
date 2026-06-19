// components/ui/AccentCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { WHITE, SAGE_DARK, BORDER, CARD_BG, SAGE } from '../../constants/colors';
import { RADIUS_LG } from '../../constants/spacing';

type AccentWeight = 'heavy' | 'normal';

interface AccentCardProps {
  weight?: AccentWeight;
  background?: 'white' | 'tinted';
  children: React.ReactNode;
  style?: ViewStyle;
  accentColorOverride?: string;
  backgroundOverride?: string;
}

export function AccentCard({
  weight = 'normal',
  background = 'white',
  children,
  style,
  accentColorOverride,
  backgroundOverride,
}: AccentCardProps) {
  const accentWidth = weight === 'heavy' ? 3 : 2;
  const accentColor = accentColorOverride ?? (weight === 'heavy' ? SAGE : BORDER);
  const bgColor = backgroundOverride ?? (background === 'tinted' ? CARD_BG : WHITE);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderLeftWidth: accentWidth,
          borderLeftColor: accentColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS_LG,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: BORDER,
  },
});
