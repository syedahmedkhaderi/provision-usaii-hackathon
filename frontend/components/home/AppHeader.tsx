// components/home/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BLACK, WHITE } from '../../constants/colors';
import {
  DISPLAY, BODY, BODY_SM, LABEL_SM, CAPTION,
  MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { PAGE_HORIZONTAL, MD, LG } from '../../constants/spacing';
import { RiskProfile, State } from '../../types';
import { SNAP_RULES } from '../../constants/snapRules';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  state?: State;
  riskProfile?: RiskProfile | null;
  nextDeadlineDays?: number | null;
}

export function AppHeader({
  title = 'Your SNAP status',
  subtitle,
  state,
  riskProfile,
  nextDeadlineDays,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const stateName = state ? SNAP_RULES[state].stateName : '';

  const banner = getBanner(riskProfile, nextDeadlineDays);

  return (
    <View style={[styles.header, { paddingTop: insets.top + MD }]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Provision</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.stateLine}>{subtitle}</Text>
          ) : state ? (
            <Text style={styles.stateLine}>{`${stateName} - SNAP`}</Text>
          ) : null}
        </View>
        <View style={styles.initialsCircle}>
          <Text style={styles.initials}>
            {state ? stateName.charAt(0) : 'P'}
          </Text>
        </View>
      </View>

      {banner && (
        <View style={[styles.banner, banner.style]}>
          <Ionicons name={banner.icon} size={20} color={WHITE} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerSub}>{banner.sub}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getBanner(
  risk: RiskProfile | null | undefined,
  nextDays: number | null | undefined
) {
  if (!risk || risk.level === 'low') {
    return {
      icon: 'checkmark-circle-outline' as const,
      title: "You're on track",
      sub: nextDays != null ? `Next action in ${nextDays} days` : 'No deadlines soon',
      style: { backgroundColor: 'rgba(255,255,255,0.10)' },
    };
  }
  if (risk.level === 'medium') {
    return {
      icon: 'time-outline' as const,
      title: 'Action coming up',
      sub: risk.reasons[0] || 'A deadline is approaching',
      style: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
      },
    };
  }
  return {
    icon: 'warning-outline' as const,
    title: 'Attention needed',
    sub: risk.reasons[0] || 'Action required',
    style: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
    },
  };
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BLACK,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingBottom: LG,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: DISPLAY,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  stateLine: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  initialsCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: MD,
    borderRadius: 14,
    padding: 12,
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  bannerSub: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
});
