// components/ui/Divider.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BORDER } from '../../constants/colors';

interface DividerProps {
  marginVertical?: number;
}

export function Divider({ marginVertical = 10 }: DividerProps) {
  return <View style={[styles.line, { marginVertical }]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 0.5,
    backgroundColor: BORDER,
  },
});
