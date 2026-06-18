// app/(tabs)/roadmap.tsx — Renewal Roadmap
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  BODY, BODY_SM, CAPTION, LABEL_SM, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, PAGE_HORIZONTAL, SM, MD } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { AppHeader } from '../../components/home/AppHeader';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Deadline } from '../../types';
import { formatDeadlineDate, daysLabel } from '../../services/snapEngine';

export default function RoadmapScreen() {
  const { profile, deadlines } = useUser();

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Renewal roadmap"
          state={profile.state}
        />

        <View style={styles.content}>
          {deadlines.map((deadline, index) => (
            <RoadmapStep
              key={deadline.id}
              deadline={deadline}
              isLast={index === deadlines.length - 1}
            />
          ))}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function RoadmapStep({ deadline, isLast }: { deadline: Deadline; isLast: boolean }) {
  const isDone = deadline.status === 'done';
  const isUrgent = deadline.status === 'urgent';

  return (
    <View style={styles.stepRow}>
      {/* Left column: dot + connector */}
      <View style={styles.leftCol}>
        <View
          style={[
            styles.dot,
            isDone && styles.dotDone,
            isUrgent && styles.dotUrgent,
            !isDone && !isUrgent && styles.dotUpcoming,
          ]}
        >
          <Ionicons
            name={isDone ? 'checkmark' : isUrgent ? 'alert' : 'time-outline'}
            size={13}
            color={isDone || isUrgent ? WHITE : TEXT_MUTED}
          />
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>

      {/* Right column: card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isUrgent ? CARD_BG : WHITE,
            borderColor: BORDER,
          },
        ]}
      >
        <Text style={styles.cardTitle}>{deadline.title}</Text>
        <Text style={[styles.cardDate, { color: isUrgent ? BLACK : TEXT_MUTED }]}>
          {formatDeadlineDate(deadline.date)} - {daysLabel(deadline.daysUntil)}
        </Text>

        {deadline.documents.length > 0 && (
          <View style={styles.docsSection}>
            <SectionLabel style={{ marginBottom: SM }}>Documents needed</SectionLabel>
            {deadline.documents.map((doc, i) => (
              <View key={i} style={styles.docRow}>
                <Ionicons name="arrow-forward" size={10} color={BLACK} />
                <Text style={styles.docText}>{doc}</Text>
              </View>
            ))}
          </View>
        )}

        {deadline.consequence ? (
          <View style={styles.consequenceRow}>
            <Ionicons name="alert-circle-outline" size={11} color={NEAR_BLACK} />
            <Text style={styles.consequenceText}>{deadline.consequence}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: MD,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
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
  connector: {
    flex: 1,
    width: 1,
    minHeight: 16,
    marginVertical: 3,
    backgroundColor: BORDER,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    padding: 13,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  cardDate: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    fontWeight: MEDIUM as '500',
    marginTop: 2,
  },
  docsSection: {
    marginTop: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  docText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: NEAR_BLACK,
  },
  consequenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  consequenceText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: NEAR_BLACK,
  },
});
