// app/recovery.tsx — Recovery Roadmap Modal
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  CLAY, BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../constants/colors';
import {
  BODY, BODY_SM, BODY_LG, CAPTION, LABEL_SM, HEADING_LG,
  MEDIUM, SEMIBOLD, FONT_FAMILY,
} from '../constants/typography';
import { RADIUS_LG, RADIUS_MD, PAGE_HORIZONTAL, MD, LG, SECTION, SM, CARD_PADDING } from '../constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { AccentCard } from '../components/ui/AccentCard';
import { ContactBlock } from '../components/ui/ContactBlock';
import { SectionLabel } from '../components/ui/SectionLabel';
import { SNAP_RULES } from '../constants/snapRules';
import { generateRecoveryTimeline } from '../services/llmService';
import { RecoveryTimeline as TimelineType, RecoveryStep } from '../types';

export default function RecoveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useUser();
  const [timeline, setTimeline] = useState<TimelineType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile) return;
    let mounted = true;
    (async () => {
      const res = await generateRecoveryTimeline(profile);
      if (!mounted) return;
      setTimeline(res ?? getFallbackTimeline(profile));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [profile]);

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <Text style={{ color: '#2C2C2C', fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }
  const rules = SNAP_RULES[profile.state];

  const handleCopy = async () => {
    if (!timeline) return;
    await Clipboard.setStringAsync(timeline.hearing_request_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + MD }]}>
        <Text style={styles.headerTitle}>Recovery roadmap</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Building your recovery plan...</Text>
          </View>
        ) : timeline ? (
          <>
            {/* Situation block */}
            <AccentCard weight="heavy" background="tinted" style={styles.situationCard}>
              <SectionLabel style={{ marginBottom: SM, color: NEAR_BLACK }}>Where you likely are now</SectionLabel>
              <Text style={styles.situationText}>{timeline.current_situation}</Text>
            </AccentCard>

            {/* Timeline steps */}
            <View style={styles.timelineSection}>
              <SectionLabel style={{ marginBottom: MD }}>What typically happens next</SectionLabel>
              {timeline.steps.map((step, i) => (
                <RecoveryStepCard key={i} step={step} isLast={i === timeline.steps.length - 1} />
              ))}
            </View>

            {/* Fair hearing block */}
            <View style={styles.hearingCard}>
              <SectionLabel style={{ marginBottom: SM }}>Fair hearing</SectionLabel>
              <Text style={styles.hearingFact}>
                You generally have up to {timeline.fair_hearing_days} days from the date on your notice to request a hearing.
              </Text>
              <Text style={styles.hearingNote}>
                The hearing pauses benefit termination in most cases while your case is reviewed.
              </Text>
              <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />
            </View>

            {/* Letter copy block */}
            <View style={styles.letterCard}>
              <SectionLabel style={{ marginBottom: SM }}>Fair hearing request</SectionLabel>
              <Text style={styles.letterPreview} numberOfLines={4}>
                {timeline.hearing_request_letter}
              </Text>
              <TouchableOpacity
                onPress={handleCopy}
                style={[styles.copyBtn, { backgroundColor: copied ? TEXT_SECONDARY : CLAY }]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={copied ? "Copied to clipboard" : "Copy hearing request letter"}
                accessibilityHint="Copy the fair hearing request letter so you can paste it and send it"
              >
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={WHITE} />
                <Text style={styles.copyBtnText}>
                  {copied ? 'Copied to clipboard' : 'Copy hearing request letter'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reapply note */}
            <View style={styles.reapplyCard}>
              <Ionicons name="information-circle-outline" size={16} color={CLAY} />
              <Text style={styles.reapplyText}>{timeline.reapply_note}</Text>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimerText}>
              Guidance only. Not legal advice. Verify with your caseworker.
            </Text>
          </>

        ) : null}
      </ScrollView>
    </View>
  );
}

function RecoveryStepCard({ step, isLast }: { step: RecoveryStep; isLast: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepLeftCol}>
        <View style={[styles.stepDot, step.is_critical && styles.stepDotCritical]}>
          <Ionicons
            name={step.is_critical ? 'warning' : 'ellipse-outline'}
            size={13}
            color={WHITE}
          />
        </View>
        {!isLast && <View style={styles.stepConnector} />}
      </View>
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDays}>{step.days_estimate}</Text>
        <Text style={styles.stepDesc}>{step.description}</Text>
        {step.is_critical && (
          <View style={styles.criticalRow}>
            <Ionicons name="alert-circle-outline" size={11} color={NEAR_BLACK} />
            <Text style={styles.criticalText}>Act during this window</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function getFallbackTimeline(profile: { state: 'CA' | 'TX'; issueType: string }): TimelineType {
  const rules = SNAP_RULES[profile.state];
  return {
    current_situation: 'Your benefits may be at risk due to a procedural issue. Here is what typically happens next.',
    steps: [
      {
        title: 'Contact your caseworker',
        description: 'Call immediately to understand what happened and what documentation is needed.',
        days_estimate: 'Within 24 hours',
        is_critical: true,
      },
      {
        title: 'Request a fair hearing',
        description: 'If you disagree with the decision, you can request a hearing to have your case reviewed.',
        days_estimate: `Within ${rules.fairHearingDays} days`,
        is_critical: true,
      },
      {
        title: 'Reapply if needed',
        description: 'If benefits were terminated, you can reapply at any time. The process is faster with documentation ready.',
        days_estimate: 'Anytime',
        is_critical: false,
      },
    ],
    fair_hearing_days: rules.fairHearingDays,
    hearing_request_letter: `Dear [Agency Name],

I am requesting a fair hearing regarding my SNAP benefits.

Name: [YOUR NAME]
Case Number: [YOUR CASE NUMBER]
Date of Notice: [DATE ON NOTICE]
Reason for request: [EXPLAIN WHY YOU DISAGREE]

I request that my benefits continue while this is being reviewed.

Sincerely,
[YOUR NAME]
[YOUR ADDRESS]
[YOUR PHONE]`,
    reapply_note: 'If your benefits were terminated, you can reapply at any time. Gather your ID, proof of income, and proof of residence to speed up the process.',
    contact: rules.caseworkerPhone,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  header: {
    backgroundColor: CLAY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingBottom: LG,
    gap: MD,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_LG,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  scroll: { flex: 1 },
  loadingWrap: {
    padding: SECTION,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: TEXT_SECONDARY,
  },
  situationCard: {
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
    padding: CARD_PADDING,
  },
  situationText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: TEXT_PRIMARY,
  },
  timelineSection: {
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: SECTION,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  stepLeftCol: {
    width: 28,
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCritical: {
    backgroundColor: CLAY,
  },
  stepConnector: {
    flex: 1,
    width: 1,
    minHeight: 16,
    marginVertical: 3,
    backgroundColor: BORDER,
  },
  stepCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 13,
    marginBottom: 10,
  },
  stepTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  stepDays: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  stepDesc: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginTop: 6,
  },
  criticalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  criticalText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: NEAR_BLACK,
  },
  hearingCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: SECTION,
  },
  hearingFact: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
    marginTop: SM,
    marginBottom: SM,
    lineHeight: 20,
  },
  hearingNote: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: MD,
  },
  letterCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
  },
  letterPreview: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: SM,
    marginBottom: MD,
    lineHeight: 18,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS_MD,
  },
  copyBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: WHITE,
  },
  reapplyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: MD,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: MD,
    marginHorizontal: PAGE_HORIZONTAL,
    marginTop: MD,
  },
  reapplyText: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  disclaimerText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: MD,
    marginHorizontal: PAGE_HORIZONTAL,
  },
});
