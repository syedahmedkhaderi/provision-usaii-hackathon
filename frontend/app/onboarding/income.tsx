// app/onboarding/income.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SAGE, WHITE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_MD, RADIUS_LG, RADIUS_PILL, PAGE_HORIZONTAL, MD, LG, SECTION, SM } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';

const QUICK_AMOUNTS = [
  { label: 'No income', value: 0 },
  { label: '$500', value: 500 },
  { label: '$1,000', value: 1000 },
  { label: '$1,500', value: 1500 },
  { label: '$2,000', value: 2000 },
];

export default function IncomeScreen() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [rawInput, setRawInput] = useState('');
  const [quickSelected, setQuickSelected] = useState<number | null>(null);

  const parsedIncome =
    quickSelected !== null
      ? quickSelected
      : parseInt(rawInput.replace(/[^0-9]/g, ''), 10) || 0;

  const handleQuick = (val: number) => {
    setQuickSelected(val);
    setRawInput(val === 0 ? '' : val.toLocaleString());
  };

  const handleInputChange = (text: string) => {
    setQuickSelected(null);
    setRawInput(text.replace(/[^0-9]/g, ''));
  };

  const handleContinue = () => {
    updateProfile({ monthlyIncome: parsedIncome });
    router.push('/onboarding/reporting');
  };

  const handleSkip = () => {
    updateProfile({ monthlyIncome: 0 });
    router.push('/onboarding/reporting');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: WHITE }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressDots total={7} current={4} />

          <Text style={styles.question}>What's your monthly household income?</Text>
          <Text style={styles.subText}>Before taxes. An estimate is fine.</Text>

          {/* Dollar input */}
          <View style={[styles.inputRow, { borderColor: rawInput.length > 0 ? SAGE : BORDER }]}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              value={rawInput}
              onChangeText={handleInputChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={TEXT_MUTED}
              maxLength={7}
            />
            <Text style={styles.perMonth}>/mo</Text>
          </View>

          {/* Quick-select chips */}
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((q) => {
              const isSelected = quickSelected === q.value;
              return (
                <TouchableOpacity
                  key={q.value}
                  onPress={() => handleQuick(q.value)}
                  style={[
                    styles.quickChip,
                    isSelected && styles.quickChipSelected,
                  ]}
                >
                  <Text style={[styles.quickChipText, isSelected && styles.quickChipTextSelected]}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.whyCard}>
            <Text style={styles.whyText}>
              We use this to estimate your likely benefit range. Your data stays on your device and is never shared.
            </Text>
          </View>

          <TouchableOpacity onPress={handleSkip} style={styles.skipLink}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS_MD,
    paddingHorizontal: MD,
    paddingVertical: 12,
    marginBottom: MD,
  },
  dollarSign: {
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: 30,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    padding: 0,
  },
  perMonth: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SM,
    marginBottom: SECTION,
  },
  quickChip: {
    paddingHorizontal: MD,
    paddingVertical: 7,
    borderRadius: RADIUS_PILL,
    borderWidth: 0.5,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  quickChipSelected: {
    backgroundColor: SAGE,
    borderColor: SAGE,
  },
  quickChipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    fontWeight: MEDIUM as '500',
    color: TEXT_MUTED,
  },
  quickChipTextSelected: {
    color: WHITE,
  },
  whyCard: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_LG,
    padding: MD,
    marginBottom: MD,
  },
  whyText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  skipLink: {
    alignItems: 'center',
    marginTop: SM,
  },
  skipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: SAGE,
    fontWeight: MEDIUM as '500',
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
