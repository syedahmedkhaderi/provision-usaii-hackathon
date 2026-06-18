// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { BLACK, WHITE, TEXT_MUTED, NEAR_BLACK, BORDER } from '../../constants/colors';
import { BODY_LG, MEDIUM, FONT_FAMILY } from '../../constants/typography';
import { RADIUS_MD } from '../../constants/spacing';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const bgColor = disabled ? BORDER : isPrimary ? BLACK : WHITE;
  const textColor = disabled ? TEXT_MUTED : isPrimary ? WHITE : NEAR_BLACK;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.base, { backgroundColor: bgColor }, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS_MD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
  },
});
