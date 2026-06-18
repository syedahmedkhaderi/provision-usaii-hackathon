// components/report/ExampleChips.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WHITE, TEXT_MUTED, BORDER } from '../../constants/colors';
import { BODY_SM, MEDIUM, FONT_FAMILY } from '../../constants/typography';
import { RADIUS_PILL, SM } from '../../constants/spacing';

interface ExampleChipsProps {
  chips: string[];
  onSelect: (text: string) => void;
}

export function ExampleChips({ chips, onSelect }: ExampleChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Examples:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.row}>
          {chips.map((chip, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onSelect(chip)}
              activeOpacity={0.7}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    fontWeight: MEDIUM as '500',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SM,
  },
  scroll: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS_PILL,
    backgroundColor: WHITE,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  chipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
});
