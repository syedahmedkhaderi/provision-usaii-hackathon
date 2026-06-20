// app/(tabs)/index.tsx — Home / Dashboard
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  SAGE, SAGE_DARK, SAGE_LIGHT, CLAY, CLAY_LIGHT, WHITE,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG, NEAR_BLACK,
} from '../../constants/colors';
import {
  BODY, BODY_LG, BODY_SM, CAPTION, LABEL_SM, FONT_FAMILY, MEDIUM, SEMIBOLD,
} from '../../constants/typography';
import { PAGE_HORIZONTAL, RADIUS_MD, RADIUS_LG, MD, LG, SECTION, SM } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import { AppHeader } from '../../components/home/AppHeader';
import { JourneyTimeline } from '../../components/home/JourneyTimeline';
import { DeadlineCard } from '../../components/home/DeadlineCard';
import { BenefitsEstimator } from '../../components/home/BenefitsEstimator';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { SNAP_RULES } from '../../constants/snapRules';
import { Deadline, RiskProfile } from '../../types';
import { Strings } from '../../constants/i18n';

function getInsight(
  deadlines: Deadline[],
  riskProfile: RiskProfile | null,
  recentChange: string,
  t: Strings,
): string {
  const next = deadlines.find((d) => d.status !== 'done');
  if (!next) return t.upToDate;
  if (next.daysUntil < 0) return t.yourSomethingIsOverdue(next.title);
  if (next.daysUntil <= 7) return t.yourDeadlineInDays(next.title, next.daysUntil);
  if (next.daysUntil <= 30) return t.gatherDocumentsFor(next.title, next.daysUntil);
  if (recentChange && recentChange !== 'none' && recentChange !== '')
    return t.reportedRecentChange;
  return t.nextAction(next.title, next.daysUntil);
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, deadlines, riskProfile, eligibilityEstimate } = useUser();
  const { t } = useLanguage();

  if (!profile) return null;

  const rules = SNAP_RULES[profile.state];
  const activeDeadlines = deadlines.filter((d) => d.status !== 'done');
  const nextDeadline = activeDeadlines[0];
  const showRecovery = riskProfile?.level === 'high';

  const insight = getInsight(deadlines, riskProfile ?? null, profile.recentChange, t);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <AppHeader
          state={profile.state}
          riskProfile={riskProfile}
          nextDeadlineDays={nextDeadline?.daysUntil ?? null}
        />

        {/* Recovery banner */}
        {showRecovery && (
          <TouchableOpacity
            onPress={() => router.push('/recovery')}
            activeOpacity={0.7}
            style={styles.recoveryBanner}
          >
            <Ionicons name="warning-outline" size={18} color={CLAY} />
            <Text style={styles.recoveryText}>
              Something may have gone wrong. See your recovery steps.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={CLAY} />
          </TouchableOpacity>
        )}

        {/* Journey Timeline */}
        <JourneyTimeline deadlines={deadlines} />

        {/* Deadline cards */}
        <View style={styles.deadlinesSection}>
          <SectionLabel style={styles.sectionLabel}>{t.deadlines}</SectionLabel>
          {activeDeadlines.length > 0 ? (
            activeDeadlines.map((d) => (
              <DeadlineCard key={d.id} deadline={d} eligibilityEstimate={eligibilityEstimate} />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color={SAGE} />
              <Text style={styles.emptyText}>{t.noUpcomingDeadlines}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.qaPrimary}
            onPress={() => router.push('/(tabs)/report')}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle-outline" size={14} color={WHITE} />
            <Text style={styles.qaPrimaryText}>{t.reportAChange}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.qaSecondary}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={14} color={TEXT_PRIMARY} />
            <Text style={styles.qaSecondaryText}>{t.scanANotice}</Text>
          </TouchableOpacity>
        </View>

        {/* "What Would Change?" Estimator */}
        <View style={styles.estimatorSection}>
          <BenefitsEstimator profile={profile} baseline={eligibilityEstimate ?? null} />
        </View>

        {/* Proactive Insight Card */}
        <TouchableOpacity
          style={styles.insightCard}
          onPress={() => router.push('/(tabs)/roadmap')}
          activeOpacity={0.8}
        >
          <Ionicons name="bulb-outline" size={18} color={SAGE} />
          <Text style={styles.insightText}>{insight}</Text>
        </TouchableOpacity>

        {/* Eligibility estimate card */}
        {eligibilityEstimate && (
          <View style={styles.eligibilityCard}>
            <Text style={styles.eligibilityLabel}>{t.eligibilityEstimateLabel}</Text>
            <Text style={styles.eligibilityRange}>
              ${eligibilityEstimate.benefitRange[0].toLocaleString()} – ${eligibilityEstimate.benefitRange[1].toLocaleString()}
              <Text style={styles.eligibilityUnit}> {t.perMonth}</Text>
            </Text>
            <Text style={styles.eligibilitySub}>
              {profile.householdSize}-person household · {profile.state === 'CA' ? 'California' : 'Texas'}
              {eligibilityEstimate.confidence === 'low' ? t.lowConfidence : ''}
            </Text>
            <View style={styles.eligibilityDivider} />
            <Text style={styles.eligibilityDisclaimer}>
              {t.estimateDisclaimer}
            </Text>
          </View>
        )}

        {/* Responsible AI disclosure */}
        <View style={styles.aiLimitsCard}>
          <Ionicons name="information-circle-outline" size={15} color={TEXT_MUTED} />
          <Text style={styles.aiLimitsText}>
            {t.aiLimitsText}
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  scroll: { flex: 1 },
  recoveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
    backgroundColor: CLAY_LIGHT,
    borderRadius: 14,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: CLAY,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: CLAY,
  },
  recoveryText: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: CLAY,
  },
  deadlinesSection: {
    marginTop: SECTION,
  },
  sectionLabel: {
    marginHorizontal: PAGE_HORIZONTAL,
    marginBottom: MD,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SECTION,
    backgroundColor: WHITE,
    borderRadius: 14,
    marginHorizontal: PAGE_HORIZONTAL,
    borderWidth: 0.5,
    borderColor: BORDER,
    gap: MD,
  },
  emptyText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
  },
  qaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: SAGE,
    padding: 13,
    borderRadius: RADIUS_MD,
  },
  qaPrimaryText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  qaSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: WHITE,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 13,
    borderRadius: RADIUS_MD,
  },
  qaSecondaryText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  estimatorSection: {
    marginTop: MD,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SM,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
    padding: MD,
    backgroundColor: SAGE_LIGHT,
    borderRadius: RADIUS_MD,
    borderWidth: 0.5,
    borderColor: SAGE,
  },
  insightText: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: SAGE_DARK,
    lineHeight: 18,
  },
  eligibilityCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
    padding: LG,
  },
  eligibilityLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: SM,
  },
  eligibilityRange: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
  },
  eligibilityUnit: {
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_SECONDARY,
  },
  eligibilitySub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  eligibilityDivider: {
    height: 0.5,
    backgroundColor: BORDER,
    marginVertical: MD,
  },
  eligibilityDisclaimer: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
  aiLimitsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SM,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
    padding: MD,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  aiLimitsText: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
});
