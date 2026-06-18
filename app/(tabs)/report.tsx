// app/(tabs)/report.tsx — Report a Change
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  BODY, BODY_SM, BODY_LG, CAPTION, LABEL_SM, HEADING_LG,
  MEDIUM, SEMIBOLD, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_MD, RADIUS_LG, RADIUS_PILL, PAGE_HORIZONTAL, MD, LG, SECTION, SM, CARD_PADDING } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AccentCard } from '../../components/ui/AccentCard';
import { ContactBlock } from '../../components/ui/ContactBlock';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { ExampleChips } from '../../components/report/ExampleChips';
import { SNAP_RULES } from '../../constants/snapRules';
import { analyzeChange } from '../../services/llmService';
import { ReportResult } from '../../types';

const EXAMPLES = [
  'Started a new job',
  'Got a one-time payment',
  'My roommate moved out',
  'I lost my job',
  'My income increased',
  'Had a new baby',
];

export default function ReportScreen() {
  const { profile } = useUser();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const rules = SNAP_RULES[profile.state];

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeChange(input, profile);
      if (res) {
        setResult(res);
      } else {
        setError("Couldn't analyze. Check your connection or try again.");
      }
    } catch {
      setError("Couldn't analyze. Check your connection or try again.");
    }
    setLoading(false);
  };

  const handleStartOver = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.question}>Do I need to report this?</Text>
          <Text style={styles.subText}>Describe what changed in plain language.</Text>
        </View>

        {/* Input phase */}
        {!result && (
          <>
            <TextInput
              style={[styles.textarea, { borderColor: input.length > 0 ? BLACK : BORDER }]}
              value={input}
              onChangeText={setInput}
              multiline
              placeholder="e.g. I started a part-time DoorDash job, making about $500 a month..."
              placeholderTextColor={TEXT_MUTED}
              textAlignVertical="top"
            />

            <ExampleChips chips={EXAMPLES} onSelect={setInput} />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={{ marginTop: SECTION, marginBottom: SECTION }}>
              <Button
                label={loading ? 'Analyzing...' : 'Check this change'}
                onPress={handleSubmit}
                disabled={!input.trim() || loading}
                loading={loading}
              />
            </View>
          </>
        )}

        {/* Result phase */}
        {result && (
          <View style={{ gap: MD }}>
            {/* Confidence gate */}
            {result.confidence === 'low' ? (
              <>
                <AccentCard weight="normal" background="tinted" style={{ padding: CARD_PADDING }}>
                  <Text style={styles.verdictText}>
                    This situation is complex. Please contact your caseworker directly.
                  </Text>
                </AccentCard>
                <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />
              </>
            ) : (
              <>
                {/* Classification chip */}
                <View style={styles.classificationRow}>
                  <View style={styles.classificationChip}>
                    <Ionicons name="pricetag-outline" size={11} color={NEAR_BLACK} />
                    <Text style={styles.classificationText}>{result.classification}</Text>
                  </View>
                </View>

                {/* Verdict card */}
                <AccentCard
                  weight={result.needs_to_report ? 'heavy' : 'normal'}
                  background={result.needs_to_report ? 'tinted' : 'white'}
                  style={{ padding: CARD_PADDING }}
                >
                  <Text style={styles.verdictTitle}>{result.verdict}</Text>
                  <Text style={styles.verdictBody}>{result.reasoning}</Text>
                </AccentCard>

                {/* What to do card */}
                <View style={styles.actionCard}>
                  <SectionLabel style={{ marginBottom: SM }}>What to do next</SectionLabel>
                  <Text style={styles.actionText}>{result.what_to_do}</Text>
                  <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />
                  <Text style={styles.disclaimer}>
                    Guidance only. Not legal advice. Verify with your caseworker.
                  </Text>
                </View>
              </>
            )}

            {/* Start over */}
            <TouchableOpacity onPress={handleStartOver} style={styles.startOverLink}>
              <Text style={styles.startOverText}>Start over</Text>
            </TouchableOpacity>

            <View style={{ height: SECTION }} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  content: { paddingHorizontal: PAGE_HORIZONTAL, paddingTop: SECTION },
  header: { marginBottom: MD },
  question: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_LG,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    marginBottom: SM,
  },
  subText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
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
  errorText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: NEAR_BLACK,
    textAlign: 'center',
    marginTop: MD,
  },
  classificationRow: { marginBottom: MD },
  classificationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  classificationText: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: MEDIUM as '500',
    color: NEAR_BLACK,
  },
  verdictTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  verdictBody: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  verdictText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  actionCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
    gap: MD,
  },
  actionText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  disclaimer: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    lineHeight: 16,
    marginTop: SM,
  },
  startOverLink: {
    alignItems: 'center',
    marginTop: MD,
  },
  startOverText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: BLACK,
    fontWeight: MEDIUM as '500',
  },
});
