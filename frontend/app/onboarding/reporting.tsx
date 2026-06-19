// app/onboarding/reporting.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  SAGE, WHITE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, HEADING_SM, CAPTION,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, RADIUS_MD, PAGE_HORIZONTAL, MD, LG, SECTION } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';
import { State, ReportingType } from '../../types';

interface Option {
  value: ReportingType;
  title: string;
  sub: string;
}

export default function ReportingScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const defaultVal: ReportingType = profile?.state === 'TX' ? 'QR' : 'SAR';
  const [selected, setSelected] = useState<ReportingType | null>(defaultVal);

  const options: Option[] = [
    { value: 'SAR', title: 'SAR - Semi-Annual', sub: 'Report income twice a year. Required mid-period report (SAR-7).' },
    { value: 'QR', title: 'QR - Quarterly', sub: 'Report changes every three months. Common in Texas.' },
    { value: 'unknown', title: "I don't know", sub: "We'll use your state's default reporting rules." },
  ];

  const handleContinue = () => {
    if (!selected) return;
    updateProfile({ reportingType: selected });
    router.push('/onboarding/changes');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ProgressDots total={7} current={5} />

        <Text style={styles.question}>Do you know your reporting type?</Text>
        <Text style={styles.subText}>
          This is usually on your approval notice. We've pre-selected your state's default.
        </Text>

        <View style={styles.cards}>
          {options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.7}
                style={[
                  styles.card,
                  {
                    borderWidth: isSelected ? 2 : 0.5,
                    borderColor: isSelected ? SAGE : BORDER,
                  },
                ]}
              >
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{opt.title}</Text>
                  <Text style={styles.cardSub}>{opt.sub}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={SAGE} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selected && (
          <View style={styles.explainBox}>
            <Ionicons name="information-circle-outline" size={16} color={TEXT_SECONDARY} />
            <Text style={styles.explainText}>
              {selected === 'SAR' && 'You will need to file a SAR-7 report 6 months after enrollment.'}
              {selected === 'QR' && 'You will need to report changes every 3 months.'}
              {selected === 'unknown' && "We will use your state's default reporting rules."}
            </Text>
          </View>
        )}
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
    padding: LG,
    borderRadius: RADIUS_LG,
    backgroundColor: WHITE,
  },
  cardBody: { flex: 1 },
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
  explainBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: MD,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: MD,
    marginTop: SECTION,
  },
  explainText: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
