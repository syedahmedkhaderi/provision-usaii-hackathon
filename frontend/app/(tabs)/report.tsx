import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY,
  TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  BODY, BODY_SM, BODY_LG, LABEL_SM, HEADING_LG, CAPTION,
  MEDIUM, SEMIBOLD, FONT_FAMILY,
} from '../../constants/typography';
import {
  RADIUS_MD, RADIUS_LG, RADIUS_PILL, PAGE_HORIZONTAL,
  MD, LG, SECTION, SM, CARD_PADDING,
} from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/Button';
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
  const insets = useSafeAreaInsets();
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
      style={{ flex: 1, backgroundColor: WHITE }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Page header */}
      <View style={[styles.header, { paddingTop: insets.top + LG }]}>
        <Text style={styles.title}>Report a change</Text>
        <Text style={styles.subtitle}>Describe what changed in plain language.</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Input phase */}
        {!result && (
          <>
            <TextInput
              style={[
                styles.textarea,
                { borderColor: input.length > 0 ? BLACK : BORDER },
              ]}
              value={input}
              onChangeText={setInput}
              multiline
              placeholder="e.g. I started a part-time DoorDash job, making about $500 a month..."
              placeholderTextColor={TEXT_MUTED}
              textAlignVertical="top"
            />

            <ExampleChips chips={EXAMPLES} onSelect={setInput} />

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Info section fills space meaningfully */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>COMMON CHANGES TO REPORT</Text>
              {[
                'New or changed income',
                'Change in household size',
                'New address or phone number',
                'Change in employment',
              ].map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Result phase */}
        {result && (
          <View style={{ gap: MD }}>
            {/* Degradation banner — shown when AI is unavailable but rules-based result is still useful */}
            {result.ai_explanation_unavailable && (
              <View style={styles.degradationBanner}>
                <Ionicons name="information-circle-outline" size={14} color={NEAR_BLACK} />
                <Text style={styles.degradationText}>
                  AI explanation briefly unavailable — showing rule-based answer.
                </Text>
              </View>
            )}

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
                <View style={styles.classificationChip}>
                  <Ionicons name="pricetag-outline" size={11} color={NEAR_BLACK} />
                  <Text style={styles.classificationText}>
                    {result.classification.replace(/_/g, ' ')}
                  </Text>
                </View>

                <AccentCard
                  weight={result.needs_to_report ? 'heavy' : 'normal'}
                  background={result.needs_to_report ? 'tinted' : 'white'}
                  style={{ padding: CARD_PADDING }}
                >
                  <Text style={styles.verdictTitle}>{result.verdict}</Text>
                  <Text style={styles.verdictBody}>{result.reasoning}</Text>
                  {result.deadline_days != null && (
                    <View style={styles.deadlineRow}>
                      <Ionicons name="time-outline" size={12} color={NEAR_BLACK} />
                      <Text style={styles.deadlineText}>
                        Report within {result.deadline_days} days
                      </Text>
                    </View>
                  )}
                </AccentCard>

                {/* Citations */}
                {result.citations && result.citations.length > 0 && (
                  <View style={styles.citationsRow}>
                    {result.citations.map((c, i) => (
                      <View key={i} style={styles.citationChip}>
                        <Ionicons name="bookmark-outline" size={10} color={TEXT_SECONDARY} />
                        <Text style={styles.citationText}>{c.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.actionCard}>
                  <SectionLabel style={{ marginBottom: SM }}>What to do next</SectionLabel>
                  <Text style={styles.actionText}>{result.what_to_do}</Text>
                  <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />
                  <Text style={styles.disclaimer}>
                    {result.disclaimer ?? 'Guidance only. Not legal advice. Verify with your caseworker.'}
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity onPress={handleStartOver} style={styles.startOverLink}>
              <Text style={styles.startOverText}>Start over</Text>
            </TouchableOpacity>

            <View style={{ height: SECTION }} />
          </View>
        )}
      </ScrollView>

      {/* Sticky footer button (only in input phase) */}
      {!result && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + LG }]}>
          <Button
            label={loading ? 'Analyzing...' : 'Check this change'}
            onPress={handleSubmit}
            disabled={!input.trim() || loading}
            loading={loading}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: BLACK,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingBottom: LG,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: 'rgba(255,255,255,0.6)',
  },
  scroll: { flex: 1, backgroundColor: WHITE },
  content: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: LG,
    paddingBottom: LG,
  },
  textarea: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderRadius: RADIUS_MD,
    padding: MD,
    minHeight: 110,
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
  infoSection: {
    marginTop: SECTION,
    paddingTop: SECTION,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  infoLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: MD,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SM,
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT_MUTED,
  },
  infoText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
  },
  footer: {
    backgroundColor: WHITE,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: MD,
  },
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
  degradationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: MD,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  degradationText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SM,
  },
  deadlineText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: NEAR_BLACK,
    fontWeight: MEDIUM as '500',
  },
  citationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SM,
  },
  citationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  citationText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_SECONDARY,
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
