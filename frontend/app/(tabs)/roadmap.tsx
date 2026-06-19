import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  BODY, BODY_SM, LABEL_SM, MEDIUM, SEMIBOLD, FONT_FAMILY, CAPTION,
} from '../../constants/typography';
import { RADIUS_LG, PAGE_HORIZONTAL, SM, MD, LG, SECTION, CARD_PADDING } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Deadline } from '../../types';
import { formatDeadlineDate, daysLabel } from '../../services/snapEngine';
import { SNAP_RULES } from '../../constants/snapRules';

export default function RoadmapScreen() {
  const { profile, deadlines } = useUser();
  const insets = useSafeAreaInsets();

  if (!profile) return null;
  const rules = SNAP_RULES[profile.state];
  const nextUpcoming = deadlines.find(d => d.status !== 'done');

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dark header */}
        <View style={[styles.header, { paddingTop: insets.top + LG }]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Provision</Text>
              <Text style={styles.title}>Renewal roadmap</Text>
              <Text style={styles.subtitle}>{rules.stateName} · {rules.benefitName}</Text>
            </View>
            <View style={styles.initialsCircle}>
              <Text style={styles.initials}>{profile.state}</Text>
            </View>
          </View>

          {/* Status banner */}
          <View style={styles.statusBanner}>
            <Ionicons
              name={nextUpcoming?.status === 'urgent' ? 'warning-outline' : 'checkmark-circle-outline'}
              size={18}
              color={WHITE}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {nextUpcoming?.status === 'urgent' ? 'Action needed soon' : "You're on track"}
              </Text>
              <Text style={styles.bannerSub}>
                {nextUpcoming
                  ? `${nextUpcoming.title} — ${daysLabel(nextUpcoming.daysUntil)}`
                  : 'No deadlines coming up'}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.content}>
          {deadlines.map((deadline, index) => (
            <RoadmapStep
              key={deadline.id}
              deadline={deadline}
              isLast={index === deadlines.length - 1}
            />
          ))}
        </View>

        <View style={{ height: SECTION }} />
      </ScrollView>
    </View>
  );
}

function RoadmapStep({ deadline, isLast }: { deadline: Deadline; isLast: boolean }) {
  const isDone = deadline.status === 'done';
  const isUrgent = deadline.status === 'urgent';

  return (
    <View style={styles.stepRow}>
      {/* Left: dot + connector */}
      <View style={styles.leftCol}>
        <View style={[styles.dot, isDone && styles.dotDone, isUrgent && styles.dotUrgent, !isDone && !isUrgent && styles.dotUpcoming]}>
          <Ionicons
            name={isDone ? 'checkmark' : isUrgent ? 'alert' : 'time-outline'}
            size={13}
            color={isDone || isUrgent ? WHITE : TEXT_MUTED}
          />
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>

      {/* Right: card */}
      <View style={[styles.card, isDone && styles.cardDone]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, isDone && styles.cardTitleDone]}>{deadline.title}</Text>
          {isUrgent && (
            <View style={styles.urgentPill}>
              <Text style={styles.urgentText}>Soon</Text>
            </View>
          )}
        </View>

        <Text style={[styles.cardDate, isUrgent && styles.cardDateUrgent]}>
          {formatDeadlineDate(deadline.date)} · {daysLabel(deadline.daysUntil)}
        </Text>

        {deadline.documents.length > 0 && (
          <View style={styles.docsSection}>
            <Text style={styles.docsLabel}>DOCUMENTS NEEDED</Text>
            {deadline.documents.map((doc, i) => (
              <View key={i} style={styles.docRow}>
                <View style={styles.docDot} />
                <Text style={styles.docText}>{doc}</Text>
              </View>
            ))}
          </View>
        )}

        {!!deadline.consequence && (
          <View style={styles.consequenceRow}>
            <Ionicons name="information-circle-outline" size={12} color={TEXT_MUTED} />
            <Text style={styles.consequenceText}>{deadline.consequence}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },

  // Header
  header: {
    backgroundColor: BLACK,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingBottom: LG,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: MD,
  },
  eyebrow: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 3,
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
    fontSize: BODY_SM,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  bannerTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  bannerSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },

  // Timeline
  content: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: LG,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  leftCol: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: BLACK },
  dotUrgent: { backgroundColor: NEAR_BLACK, borderWidth: 2, borderColor: '#E8E8E8' },
  dotUpcoming: { backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  connector: {
    flex: 1,
    width: 1,
    minHeight: 16,
    marginVertical: 3,
    backgroundColor: BORDER,
  },

  // Cards
  card: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
    marginBottom: 12,
  },
  cardDone: {
    backgroundColor: CARD_BG,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SM,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
    flex: 1,
  },
  cardTitleDone: {
    color: TEXT_MUTED,
  },
  urgentPill: {
    backgroundColor: BLACK,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  urgentText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: WHITE,
    fontWeight: MEDIUM as '500',
  },
  cardDate: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    marginTop: 3,
    fontWeight: MEDIUM as '500',
  },
  cardDateUrgent: {
    color: TEXT_PRIMARY,
  },
  docsSection: {
    marginTop: MD,
    paddingTop: MD,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  docsLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: SM,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 3,
  },
  docDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT_SECONDARY,
    marginTop: 5,
  },
  docText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    flex: 1,
    lineHeight: 18,
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: SM,
    paddingTop: SM,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  consequenceText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    flex: 1,
  },
});
