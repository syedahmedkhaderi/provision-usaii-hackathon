// app/onboarding/enrollment.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BLACK, WHITE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, HEADING_SM, CAPTION,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_MD, PAGE_HORIZONTAL, MD, LG, SM, SECTION } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function EnrollmentScreen() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const computeDate = (): string => {
    if (month !== null && year !== null) {
      return `${year}-${String(month + 1).padStart(2, '0')}-15`;
    }
    // Default: 3 months ago
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  };

  const handleContinue = () => {
    updateProfile({ enrollmentDate: computeDate() });
    router.push('/onboarding/household');
  };

  const handleSkip = () => {
    updateProfile({ enrollmentDate: computeDate() });
    router.push('/onboarding/household');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ProgressDots total={6} current={2} />

        <Text style={styles.question}>When did you last enroll or recertify?</Text>
        <Text style={styles.subText}>Check your approval letter. An estimate is fine.</Text>

        <View style={styles.pickersRow}>
          {/* Month picker */}
          <View style={styles.pickerCol}>
            <SectionLabel>Month</SectionLabel>
            <View style={styles.pickerWindow}>
              <ScrollView
                snapToInterval={48}
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  setMonth(Math.round(e.nativeEvent.contentOffset.y / 48));
                }}
              >
                <View style={{ height: 48 }} />
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMonth(i)}
                    style={styles.pickerItem}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        month === i && styles.pickerTextSelected,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={{ height: 96 }} />
              </ScrollView>
            </View>
          </View>

          {/* Year picker */}
          <View style={styles.pickerCol}>
            <SectionLabel>Year</SectionLabel>
            <View style={styles.pickerWindow}>
              <ScrollView
                snapToInterval={48}
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  setYear(Math.round(e.nativeEvent.contentOffset.y / 48));
                }}
              >
                <View style={{ height: 48 }} />
                {YEARS.map((y) => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setYear(y)}
                    style={styles.pickerItem}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        year === y && styles.pickerTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={{ height: 96 }} />
              </ScrollView>
            </View>
          </View>
        </View>

        <Text style={styles.helpText}>Don't know? Tap Skip and we'll estimate.</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipLink}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} />
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
  pickersRow: {
    flexDirection: 'row',
    gap: MD,
  },
  pickerCol: {
    flex: 1,
  },
  pickerWindow: {
    height: 144,
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: RADIUS_MD,
    overflow: 'hidden',
  },
  pickerItem: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    color: TEXT_MUTED,
  },
  pickerTextSelected: {
    color: BLACK,
    fontWeight: SEMIBOLD as '600',
  },
  helpText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: SECTION,
  },
  skipLink: {
    alignItems: 'center',
    marginTop: SM,
  },
  skipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: BLACK,
    fontWeight: MEDIUM as '500',
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
