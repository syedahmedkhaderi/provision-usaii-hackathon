// components/home/DeadlineCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
  CLAY, CLAY_LIGHT, AMBER_MID,
} from '../../constants/colors';
import {
  BODY, BODY_SM, LABEL_SM, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, CARD_PADDING, PAGE_HORIZONTAL, SM, MD } from '../../constants/spacing';
import { Badge } from '../ui/Badge';
import { Deadline, EligibilityEstimate } from '../../types';
import { formatDeadlineDate, daysLabel } from '../../services/snapEngine';
import { useLanguage } from '../../context/LanguageContext';

function formatAtRisk(range: [number, number]): string {
  const [lo, hi] = range;
  if (lo === hi) return `~$${lo.toLocaleString()}/mo`;
  return `$${lo.toLocaleString()}–$${hi.toLocaleString()}/mo`;
}

interface DeadlineCardProps {
  deadline: Deadline;
  eligibilityEstimate?: EligibilityEstimate | null;
}

export function DeadlineCard({ deadline, eligibilityEstimate }: DeadlineCardProps) {
  const { t, lang } = useLanguage();
  const isUrgent = deadline.status === 'urgent';
  const isDone = deadline.status === 'done';
  const isOverdue = deadline.status === 'overdue';

  const accentWidth = isOverdue || isUrgent ? 3 : 1;
  const accentColor = isOverdue ? CLAY : isUrgent ? BLACK : isDone ? BORDER : BORDER;
  const bgColor = isOverdue ? CLAY_LIGHT : isUrgent ? CARD_BG : WHITE;
  const borderColor = isOverdue ? CLAY : isUrgent ? '#C0C0C0' : BORDER;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderLeftWidth: accentWidth,
          borderLeftColor: accentColor,
          borderTopColor: borderColor,
          borderRightColor: borderColor,
          borderBottomColor: borderColor,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{deadline.title}</Text>
          <Text
            style={[
              styles.date,
              { color: isUrgent ? BLACK : TEXT_MUTED },
            ]}
          >
            {formatDeadlineDate(deadline.date)} - {daysLabel(deadline.daysUntil, deadline.date, lang)}
          </Text>
        </View>
        <Badge
          label={isDone ? t.done : isOverdue ? t.overdue : deadline.daysUntil < 14 ? t.soon : t.onTrackBadge}
          variant={isDone || isOverdue || isUrgent ? 'solid' : 'outline'}
        />
      </View>

      {/* At-risk benefit estimate */}
      {eligibilityEstimate && (isOverdue || isUrgent) && (
        <View style={styles.atRiskRow}>
          <Text style={[styles.atRiskAmount, isOverdue && styles.atRiskAmountOverdue]}>
            {formatAtRisk(eligibilityEstimate.benefitRange)} {t.atRisk}
          </Text>
          <Text style={styles.atRiskHedge}>{t.estimateCaseworkerConfirms}</Text>
        </View>
      )}

      {/* Documents */}
      {deadline.documents.length > 0 && (
        <View style={styles.docsRow}>
          <Text style={styles.gatherLabel}>{t.gather}</Text>
          <Text style={styles.docsText}>
            {deadline.documents.join(' - ')}
          </Text>
        </View>
      )}

      {/* Consequence */}
      {deadline.consequence ? (
        <View style={styles.consequenceRow}>
          <Ionicons name="information-circle-outline" size={12} color={NEAR_BLACK} />
          <Text style={styles.consequenceText}>{deadline.consequence}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS_LG,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    padding: CARD_PADDING,
    marginHorizontal: PAGE_HORIZONTAL,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  date: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    marginTop: 2,
  },
  atRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
    marginTop: SM,
    flexWrap: 'wrap',
  },
  atRiskAmount: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    fontWeight: MEDIUM as '500',
    color: AMBER_MID,
  },
  atRiskAmountOverdue: {
    color: CLAY,
  },
  atRiskHedge: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
  },
  docsRow: {
    flexDirection: 'row',
    marginTop: SM,
    flexWrap: 'wrap',
  },
  gatherLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
  docsText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    fontWeight: MEDIUM as '500',
    color: NEAR_BLACK,
    flexShrink: 1,
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SM,
  },
  consequenceText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: NEAR_BLACK,
    marginLeft: 4,
  },
});
