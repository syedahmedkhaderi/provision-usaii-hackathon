// app/onboarding/changes.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BLACK, WHITE, TEXT_PRIMARY, TEXT_MUTED, BORDER,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, BODY_LG, CAPTION,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_MD, RADIUS_PILL, PAGE_HORIZONTAL, MD, LG, SECTION, SM } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { IssueType } from '../../types';

const CHIPS: { label: string; value: IssueType }[] = [
  { label: 'Missed a deadline', value: 'missed_sar7' },
  { label: 'Got a closure notice', value: 'closure_notice' },
  { label: 'Benefits reduced', value: 'reduction_notice' },
  { label: 'None of these', value: 'none' },
];

export default function ChangesScreen() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [text, setText] = useState('');
  const [issueType, setIssueType] = useState<IssueType | null>(null);

  const handleChip = (val: IssueType) => {
    setIssueType(val);
    if (val === 'none') setText('');
  };

  const handleContinue = () => {
    updateProfile({
      recentChange: text,
      issueType: issueType ?? 'none',
    });
    router.push('/onboarding/complete');
  };

  const handleNothingChanged = () => {
    setText('');
    setIssueType('none');
    updateProfile({ recentChange: '', issueType: 'none' });
    router.push('/onboarding/complete');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressDots total={6} current={5} />

        <Text style={styles.question}>Has anything changed recently?</Text>
        <Text style={styles.subText}>
          New job, income change, moved, household change. You can also skip this.
        </Text>

        <SectionLabel style={{ marginBottom: SM }}>Did something go wrong?</SectionLabel>
        <View style={styles.chipsRow}>
          {CHIPS.map((chip) => {
            const isSelected = issueType === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => handleChip(chip.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? BLACK : WHITE,
                    borderColor: isSelected ? BLACK : BORDER,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? WHITE : TEXT_MUTED },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: SECTION }}>
          <SectionLabel style={{ marginBottom: SM }}>Describe what changed</SectionLabel>
          <TextInput
            style={[
              styles.textarea,
              { borderColor: text.length > 0 ? BLACK : BORDER },
            ]}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={5}
            placeholder="e.g. Started a part-time DoorDash job..."
            placeholderTextColor={TEXT_MUTED}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity onPress={handleNothingChanged} style={styles.secondaryLink}>
          <Text style={styles.secondaryText}>Nothing has changed</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={issueType === null}
        />
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SM,
  },
  chip: {
    paddingHorizontal: MD,
    paddingVertical: 7,
    borderRadius: RADIUS_PILL,
    borderWidth: 0.5,
  },
  chipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    fontWeight: MEDIUM as '500',
  },
  textarea: {
    backgroundColor: WHITE,
    borderWidth: 0.5,
    borderRadius: RADIUS_MD,
    padding: MD,
    minHeight: 100,
    fontSize: BODY_LG,
    fontFamily: FONT_FAMILY,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  secondaryLink: {
    alignItems: 'center',
    marginTop: MD,
  },
  secondaryText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
