// components/home/DeadlineCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  BODY, BODY_SM, LABEL_SM, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, CARD_PADDING, PAGE_HORIZONTAL, SM, MD } from '../../constants/spacing';
import { Badge } from '../ui/Badge';
import { Deadline } from '../../types';
import { formatDeadlineDate, daysLabel } from '../../services/snapEngine';

interface DeadlineCardProps {
  deadline: Deadline;
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  const isUrgent = deadline.status === 'urgent';
  const isDone = deadline.status === 'done';

  const accentWidth = isUrgent ? 3 : 1;
  const accentColor = isUrgent ? BLACK : isDone ? BORDER : BORDER;
  const bgColor = isUrgent ? CARD_BG : WHITE;
  const borderColor = isUrgent ? '#C0C0C0' : BORDER;

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
            {formatDeadlineDate(deadline.date)} - {daysLabel(deadline.daysUntil)}
          </Text>
        </View>
        <Badge
          label={isDone ? 'Done' : deadline.daysUntil < 14 ? 'Soon' : 'On track'}
          variant={isDone ? 'solid' : isUrgent ? 'solid' : 'outline'}
        />
      </View>

      {/* Documents */}
      {deadline.documents.length > 0 && (
        <View style={styles.docsRow}>
          <Text style={styles.gatherLabel}>Gather:</Text>
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
