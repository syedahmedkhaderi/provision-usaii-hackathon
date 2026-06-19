// components/ui/ContactBlock.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLACK, NEAR_BLACK, TEXT_SECONDARY, CARD_BG } from '../../constants/colors';
import { CAPTION, BODY_LG, MEDIUM, FONT_FAMILY } from '../../constants/typography';
import { RADIUS_MD, MD } from '../../constants/spacing';

interface ContactBlockProps {
  label: string;
  phone: string;
}

export function ContactBlock({ label, phone }: ContactBlockProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="call-outline" size={20} color={BLACK} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.phone}>{phone}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: MD,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  phone: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: NEAR_BLACK,
    marginTop: 2,
  },
});
