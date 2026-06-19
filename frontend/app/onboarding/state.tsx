// app/onboarding/state.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BLACK, WHITE, TEXT_PRIMARY, TEXT_MUTED, BORDER, CARD_BG } from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, HEADING_SM,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, PAGE_HORIZONTAL, MD, LG, SECTION } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';
import { State } from '../../types';

const STATES: { id: State; name: string; sub: string }[] = [
  { id: 'CA', name: 'California', sub: 'CalFresh - SAR reporting' },
  { id: 'TX', name: 'Texas', sub: 'SNAP - Quarterly reporting' },
];

export default function StateScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const [selected, setSelected] = useState<State | null>(profile?.state ?? null);

  const handleContinue = () => {
    if (!selected) return;
    updateProfile({ state: selected });
    router.push('/onboarding/enrollment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ProgressDots total={7} current={1} />

        <Text style={styles.question}>Which state are you in?</Text>
        <Text style={styles.subText}>Provision supports California and Texas for this demo.</Text>

        <View style={styles.cards}>
          {STATES.map((s) => {
            const isSelected = selected === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelected(s.id)}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  {
                    borderWidth: isSelected ? 2 : 0.5,
                    borderColor: isSelected ? BLACK : BORDER,
                  },
                ]}
              >
                <View
                  style={[
                    styles.stateCircle,
                    { backgroundColor: isSelected ? BLACK : CARD_BG },
                  ]}
                >
                  <Text
                    style={[
                      styles.stateAbbr,
                      { color: isSelected ? WHITE : TEXT_PRIMARY },
                    ]}
                  >
                    {s.id}
                  </Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardSub}>{s.sub}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={BLACK} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selected} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: SECTION,
    paddingBottom: SECTION,
  },
  question: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_LG,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    marginBottom: MD,
  },
  subText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
    marginBottom: SECTION,
  },
  cards: { gap: MD },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
    padding: LG,
    borderRadius: RADIUS_LG,
    backgroundColor: WHITE,
  },
  stateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateAbbr: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    fontWeight: SEMIBOLD as '600',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  cardSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
