import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SAGE, SAGE_LIGHT, CLAY, CLAY_LIGHT, BORDER, TEXT_MUTED, TEXT_PRIMARY } from '../../constants/colors';
import { CAPTION, LABEL_SM, FONT_FAMILY, MEDIUM } from '../../constants/typography';
import { SM } from '../../constants/spacing';

interface ConfidenceBarProps {
  level: 'high' | 'medium' | 'low';
  onCallCaseworker?: () => void;
}

const CONFIG = {
  high: {
    filled: 3,
    message: 'High confidence — based directly on official policy rules',
    barColor: SAGE,
  },
  medium: {
    filled: 2,
    message: 'Estimate — your caseworker can confirm the exact amount',
    barColor: SAGE,
  },
  low: {
    filled: 1,
    message: 'Complex situation — please speak with a caseworker directly',
    barColor: CLAY,
  },
};

export function ConfidenceBar({ level, onCallCaseworker }: ConfidenceBarProps) {
  const cfg = CONFIG[level];

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: i < cfg.filled ? cfg.barColor : BORDER },
            ]}
          />
        ))}
      </View>
      <Text style={styles.message}>{cfg.message}</Text>
      {level === 'low' && onCallCaseworker && (
        <TouchableOpacity onPress={onCallCaseworker} style={styles.callBtn}>
          <Text style={styles.callBtnText}>Call caseworker</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SM,
  },
  barRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  message: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    lineHeight: 15,
  },
  callBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: CLAY_LIGHT,
    marginTop: 2,
  },
  callBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    fontWeight: MEDIUM as '500',
    color: CLAY,
  },
});
