// components/home/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  SAGE_DARK, SAGE_LIGHT, SAGE, AMBER_LIGHT, AMBER_MID, CLAY_LIGHT, CLAY, WHITE,
} from '../../constants/colors';
import {
  DISPLAY, BODY, BODY_SM, LABEL_SM, CAPTION,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
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
  title = 'Your dashboard',
  subtitle,
  state,
  riskProfile,
  nextDeadlineDays,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const stateName = state ? SNAP_RULES[state].stateName : '';
  const benefitName = state ? SNAP_RULES[state].benefitName : '';

  const banner = getBanner(riskProfile, nextDeadlineDays);
  const ring = getRingColor(nextDeadlineDays);

  return (
    <View style={[styles.header, { paddingTop: insets.top + MD }]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Provision</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? (
            <Text style={styles.stateLine}>{subtitle}</Text>
          ) : state ? (
            <Text style={styles.stateLine}>{`${stateName} · ${benefitName}`}</Text>
          ) : null}
        </View>

        {/* Countdown ring */}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
          style={[styles.ringOuter, { borderColor: ring.color }]}
        >
          {nextDeadlineDays != null && nextDeadlineDays < 0 ? (
            <Ionicons name="warning" size={18} color={CLAY} />
          ) : nextDeadlineDays != null && nextDeadlineDays <= 60 ? (
            <View style={styles.ringInner}>
              <Text style={[styles.ringDays, { color: ring.color }]}>
                {nextDeadlineDays}
              </Text>
              <Text style={[styles.ringLabel, { color: ring.color }]}>days</Text>
            </View>
          ) : (
            <Ionicons name="checkmark" size={18} color={SAGE} />
          )}
        </TouchableOpacity>
      </View>

      {banner && (
        <View style={[styles.banner, banner.style]}>
          <Ionicons name={banner.icon} size={18} color={banner.iconColor} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: banner.textColor }]}>{banner.title}</Text>
            <Text style={[styles.bannerSub, { color: banner.subColor }]}>{banner.sub}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function getRingColor(days: number | null | undefined) {
  if (days == null || days > 30) return { color: SAGE };
  if (days > 7) return { color: AMBER_MID };
  return { color: CLAY };
}

function getBanner(
  risk: RiskProfile | null | undefined,
  nextDays: number | null | undefined,
) {
  if (!risk || risk.level === 'low') {
    return {
      icon: 'checkmark-circle-outline' as const,
      title: "You're on track",
      sub: nextDays != null && nextDays >= 0 ? `Next action in ${nextDays} days` : 'No deadlines soon',
      style: { backgroundColor: SAGE_LIGHT },
      iconColor: SAGE,
      textColor: SAGE_DARK,
      subColor: SAGE,
    };
  }
  if (risk.level === 'medium') {
    return {
      icon: 'time-outline' as const,
      title: 'Action coming up',
      sub: risk.reasons[0] || 'A deadline is approaching',
      style: { backgroundColor: AMBER_LIGHT },
      iconColor: AMBER_MID,
      textColor: '#7A4F1A',
      subColor: AMBER_MID,
    };
  }
  return {
    icon: 'warning-outline' as const,
    title: 'Attention needed',
    sub: risk.reasons[0] || 'Action required',
    style: { backgroundColor: CLAY_LIGHT },
    iconColor: CLAY,
    textColor: '#6B2518',
    subColor: CLAY,
  };
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: SAGE_DARK,
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
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: DISPLAY,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
  },
  stateLine: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  ringOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDays: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: SEMIBOLD as '600',
    lineHeight: 12,
  },
  ringLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 8,
    lineHeight: 10,
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
  },
  bannerSub: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    marginTop: 1,
  },
});
