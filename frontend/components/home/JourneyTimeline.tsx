// components/home/JourneyTimeline.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, BORDER, TEXT_MUTED, TEXT_SECONDARY, NEAR_BLACK, CARD_BG, CLAY,
} from '../../constants/colors';
import { FONT_FAMILY, CAPTION, BODY_SM, MEDIUM } from '../../constants/typography';
import { Deadline } from '../../types';
import { formatDeadlineDate } from '../../services/snapEngine';

interface JourneyTimelineProps {
  deadlines: Deadline[];
}

export function JourneyTimeline({ deadlines }: JourneyTimelineProps) {
  const doneCount = deadlines.filter((d) => d.status === 'done').length;
  const total = deadlines.length || 1;
  const progressPercent = (doneCount / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your journey</Text>

      <View style={styles.timelineArea}>
        {/* Background line */}
        <View style={styles.bgLine} />
        {/* Progress line */}
        <View style={[styles.progressLine, { width: `${progressPercent}%` }]} />

        {/* Dots row */}
        <View style={styles.dotsRow}>
          {deadlines.map((d) => {
            const isDone = d.status === 'done';
            const isOverdue = d.status === 'overdue';
            const isUrgent = d.status === 'urgent';

            return (
              <View key={d.id} style={styles.dotColumn}>
                <View
                  style={[
                    styles.dot,
                    isDone && styles.dotDone,
                    isOverdue && styles.dotOverdue,
                    isUrgent && styles.dotUrgent,
                    !isDone && !isOverdue && !isUrgent && styles.dotUpcoming,
                  ]}
                >
                  <Ionicons
                    name={
                      isDone ? 'checkmark' : isOverdue ? 'flag' : isUrgent ? 'alert' : 'ellipsis-horizontal'
                    }
                    size={13}
                    color={isDone || isOverdue || isUrgent ? WHITE : TEXT_MUTED}
                  />
                </View>
                <Text
                  style={[
                    styles.dotLabel,
                    { color: isDone ? BLACK : isOverdue ? CLAY : isUrgent ? NEAR_BLACK : TEXT_MUTED },
                  ]}
                  numberOfLines={1}
                >
                  {d.title.length > 12 ? d.title.substring(0, 12) + '...' : d.title}
                </Text>
                <Text style={styles.dotDate}>{formatDeadlineDate(d.date)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: LG_MARGIN(),
    borderWidth: 0.5,
    borderColor: BORDER,
    marginHorizontal: 14,
    marginTop: 14,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: MEDIUM as '500',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: LG_MARGIN(),
  },
  timelineArea: {
    position: 'relative',
  },
  bgLine: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: BORDER,
  },
  progressLine: {
    position: 'absolute',
    top: 14,
    left: 14,
    height: 1,
    backgroundColor: BLACK,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  dotColumn: {
    alignItems: 'center',
    gap: 5,
    width: 60,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: BLACK,
  },
  dotOverdue: {
    backgroundColor: CLAY,
  },
  dotUrgent: {
    backgroundColor: NEAR_BLACK,
    borderWidth: 2,
    borderColor: CARD_BG,
  },
  dotUpcoming: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  dotLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    fontWeight: MEDIUM as '500',
    textAlign: 'center',
  },
  dotDate: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: TEXT_MUTED,
  },
});

function LG_MARGIN() {
  return 16;
}
