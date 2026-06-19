import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SAGE_DARK, SAGE, SAGE_LIGHT, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY,
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
import { ConfidenceBar } from '../../components/ui/ConfidenceBar';
import { ContextLoadingText } from '../../components/ui/ContextLoadingText';
import { CallScriptSheet } from '../../components/report/CallScriptSheet';
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

const LOADING_MESSAGES = [
  'Checking your situation...',
  'Reviewing official rules...',
  'Almost done...',
];

export default function ReportScreen() {
  const { profile } = useUser();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState(false);
  const [showCallScript, setShowCallScript] = useState(false);

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
    setShowCitations(false);
    setShowCallScript(false);
  };

  const handleCallCaseworker = () => {
    Linking.openURL(`tel:${rules.caseworkerPhone}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: WHITE }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Page header */}
      <View style={[styles.header, { paddingTop: insets.top + LG }]}>
        <Text style={styles.title}>Report a change</Text>
        <Text style={styles.subtitle}>Describe what changed in plain language.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Input phase */}
        {!result && !loading && (
          <>
            <TextInput
              style={[
                styles.textarea,
                { borderColor: input.length > 0 ? SAGE : BORDER },
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

        {/* Loading */}
        {loading && (
          <ContextLoadingText messages={LOADING_MESSAGES} />
        )}

        {/* Result phase */}
        {result && !loading && (
          <View style={{ gap: MD }}>
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
                <ConfidenceBar level="low" onCallCaseworker={handleCallCaseworker} />
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
                  accentColorOverride={result.needs_to_report ? SAGE : BORDER}
                  style={{ padding: CARD_PADDING }}
                >
                  <Text style={styles.verdictTitle}>{result.verdict}</Text>

                  {/* Deadline row with Rule-based pill */}
                  {result.deadline_days != null && (
                    <View style={styles.deadlineRow}>
                      <Ionicons name="time-outline" size={12} color={NEAR_BLACK} />
                      <Text style={styles.deadlineText}>
                        Report within {result.deadline_days} days
                      </Text>
                      <View style={styles.ruleBasedPill}>
                        <Text style={styles.ruleBasedText}>Rule-based ✓</Text>
                      </View>
                    </View>
                  )}

                  {/* Reasoning with AI-explanation pill */}
                  <View style={styles.reasoningHeader}>
                    <Text style={styles.reasoningLabel}>EXPLANATION</Text>
                    <View style={styles.aiPill}>
                      <Text style={styles.aiPillText}>AI explanation</Text>
                    </View>
                  </View>
                  <Text style={styles.verdictBody}>{result.reasoning}</Text>

                  <View style={{ marginTop: MD }}>
                    <ConfidenceBar level={result.confidence} onCallCaseworker={handleCallCaseworker} />
                  </View>
                </AccentCard>

                {/* Human-in-loop separator */}
                <View style={styles.hilSeparator}>
                  <Text style={styles.hilText}>AI guidance  ·  Not a caseworker decision</Text>
                </View>

                {/* What to do next */}
                <View style={styles.actionCard}>
                  <SectionLabel style={{ marginBottom: SM }}>What to do next</SectionLabel>
                  <Text style={styles.actionText}>{result.what_to_do}</Text>
                  <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />

                  {/* Citations disclosure */}
                  {result.citations && result.citations.length > 0 && (
                    <TouchableOpacity
                      style={styles.citationToggle}
                      onPress={() => setShowCitations((v) => !v)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.citationToggleText}>How we got this answer</Text>
                      <Ionicons
                        name={showCitations ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={TEXT_MUTED}
                      />
                    </TouchableOpacity>
                  )}
                  {showCitations && result.citations && (
                    <View style={styles.citationsList}>
                      {result.citations.map((c, i) => (
                        <View key={i} style={styles.citationRow}>
                          <Ionicons name="bookmark-outline" size={11} color={TEXT_MUTED} />
                          <Text style={styles.citationItemText}>{c.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={styles.disclaimer}>
                    {result.disclaimer ?? 'Guidance only. Not legal advice. Verify with your caseworker.'}
                  </Text>
                </View>

                {/* Call script CTA */}
                {result.call_script && (
                  <TouchableOpacity
                    style={styles.callScriptLink}
                    onPress={() => setShowCallScript(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={15} color={SAGE} />
                    <Text style={styles.callScriptLinkText}>Prepare for my call →</Text>
                  </TouchableOpacity>
                )}
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
      {!result && !loading && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + LG }]}>
          <Button
            label="Check this change"
            onPress={handleSubmit}
            disabled={!input.trim() || loading}
            loading={loading}
          />
        </View>
      )}

      {/* Call script bottom sheet */}
      {result?.call_script && (
        <CallScriptSheet
          visible={showCallScript}
          script={result.call_script}
          onClose={() => setShowCallScript(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: SAGE_DARK,
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
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SM,
    marginBottom: MD,
    flexWrap: 'wrap',
  },
  deadlineText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: NEAR_BLACK,
    fontWeight: MEDIUM as '500',
    flex: 1,
  },
  ruleBasedPill: {
    backgroundColor: SAGE_LIGHT,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: SAGE,
  },
  ruleBasedText: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: SAGE,
    fontWeight: MEDIUM as '500',
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
    marginBottom: 4,
  },
  reasoningLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
  },
  aiPill: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  aiPillText: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
  },
  hilSeparator: {
    alignItems: 'center',
    paddingVertical: SM,
  },
  hilText: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
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
  citationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SM,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    marginTop: SM,
  },
  citationToggleText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
  citationsList: {
    gap: 6,
    paddingBottom: SM,
  },
  citationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  citationItemText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  callScriptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: SM,
  },
  callScriptLinkText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: SAGE,
  },
  startOverLink: {
    alignItems: 'center',
    marginTop: MD,
  },
  startOverText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: NEAR_BLACK,
    fontWeight: MEDIUM as '500',
  },
});
