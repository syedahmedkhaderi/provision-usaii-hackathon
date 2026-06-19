import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
import { AccentCard } from '../../components/ui/AccentCard';
import { ContactBlock } from '../../components/ui/ContactBlock';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Badge } from '../../components/ui/Badge';
import { SNAP_RULES } from '../../constants/snapRules';
import { scanDocument } from '../../services/llmService';
import { ScanResult } from '../../types';

type Stage = 'idle' | 'loading' | 'result';

const SUPPORTED = [
  'Closure notice',
  'Reduction in benefits',
  'Interview request letter',
  'Overpayment notice',
  'Renewal reminder',
];

export default function ScanScreen() {
  const { profile } = useUser();
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const rules = SNAP_RULES[profile.state];

  const handleCapture = async (useCamera: boolean) => {
    setError(null);
    try {
      let picked: ImagePicker.ImagePickerResult | null = null;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { setError('Camera permission denied.'); return; }
        picked = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], base64: true, quality: 0.7 });
      } else {
        picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.7 });
      }

      if (!picked || picked.canceled || !picked.assets?.length) return;
      const asset = picked.assets[0];
      if (!asset.base64) { setError('Could not read image data.'); return; }

      setStage('loading');
      const res = await scanDocument(asset.base64, profile);
      if (res) {
        setResult(res);
        setStage('result');
      } else {
        setError("Couldn't read this notice. Check your connection or try again.");
        setStage('idle');
      }
    } catch {
      setError('Something went wrong. Try again.');
      setStage('idle');
    }
  };

  const showActionSheet = () => {
    Alert.alert('Add a notice', undefined, [
      { text: 'Take a photo', onPress: () => handleCapture(true) },
      { text: 'Upload from camera roll', onPress: () => handleCapture(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleScanAgain = () => {
    setStage('idle');
    setResult(null);
    setError(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: WHITE }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + LG }]}>
        <Text style={styles.title}>Scan a notice</Text>
        <Text style={styles.subtitle}>Photograph a letter — we'll explain it.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* IDLE */}
        {stage === 'idle' && (
          <>
            {/* Camera tap area */}
            <TouchableOpacity onPress={showActionSheet} activeOpacity={0.75} style={styles.captureArea}>
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera-outline" size={30} color={BLACK} />
              </View>
              <Text style={styles.captureTitle}>Tap to photograph</Text>
              <Text style={styles.captureSub}>Or upload from your camera roll</Text>
            </TouchableOpacity>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={14} color={NEAR_BLACK} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* What I can read — grouped list */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>WHAT I CAN READ</Text>
            </View>

            <View style={styles.supportCard}>
              {SUPPORTED.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.supportRow,
                    i < SUPPORTED.length - 1 && styles.supportRowBorder,
                  ]}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={BLACK} />
                  <Text style={styles.supportText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* LOADING */}
        {stage === 'loading' && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={BLACK} />
            <Text style={styles.loadingTitle}>Reading your notice...</Text>
            <Text style={styles.loadingSub}>This takes a few seconds</Text>
          </View>
        )}

        {/* RESULT */}
        {stage === 'result' && result && (
          <View style={{ gap: MD }}>
            {/* Degradation banner — shown when AI is unavailable but response is still valid */}
            {result.ai_explanation_unavailable && (
              <View style={styles.degradationBanner}>
                <Ionicons name="information-circle-outline" size={14} color={NEAR_BLACK} />
                <Text style={styles.degradationText}>
                  AI explanation briefly unavailable — showing rule-based answer.
                </Text>
              </View>
            )}

            <View style={styles.docTypeChip}>
              <Ionicons name="document-text-outline" size={11} color={NEAR_BLACK} />
              <Text style={styles.docTypeText}>{result.document_type}</Text>
            </View>

            <AccentCard weight="heavy" background="tinted" style={{ padding: CARD_PADDING }}>
              <SectionLabel style={{ marginBottom: SM }}>What this notice means</SectionLabel>
              <Text style={styles.explanationText}>{result.plain_explanation}</Text>
              {result.deadline_text && (
                <View style={styles.deadlineRow}>
                  <Ionicons name="time-outline" size={12} color={NEAR_BLACK} />
                  <Text style={styles.deadlineText}>Deadline: {result.deadline_text}</Text>
                </View>
              )}
            </AccentCard>

            {result.options.length > 0 && (
              <View style={styles.optionsCard}>
                <SectionLabel style={{ marginBottom: SM }}>Your options</SectionLabel>
                {result.options.map((opt, i) => (
                  <View
                    key={i}
                    style={[
                      styles.optionRow,
                      i < result.options.length - 1 && styles.optionRowBorder,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionAction}>{opt.action}</Text>
                      <Text style={styles.optionDetail}>{opt.detail}</Text>
                    </View>
                    <Badge
                      label={opt.urgency === 'urgent' ? 'Act now' : opt.urgency === 'medium' ? 'Option' : 'If needed'}
                      variant={opt.urgency === 'urgent' ? 'solid' : opt.urgency === 'medium' ? 'outline' : 'muted'}
                    />
                  </View>
                ))}
              </View>
            )}

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

            <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />

            {result.disclaimer && (
              <Text style={styles.disclaimer}>{result.disclaimer}</Text>
            )}

            <TouchableOpacity onPress={handleScanAgain} style={styles.scanAgainLink}>
              <Text style={styles.scanAgainText}>Scan another notice</Text>
            </TouchableOpacity>

            <View style={{ height: SECTION }} />
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingBottom: SECTION,
  },
  captureArea: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: RADIUS_LG,
    paddingVertical: SECTION,
    alignItems: 'center',
    backgroundColor: CARD_BG,
  },
  cameraIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: WHITE,
    borderWidth: 0.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: MD,
  },
  captureTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  captureSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: MD,
    marginTop: MD,
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: NEAR_BLACK,
    flex: 1,
  },
  sectionHeader: {
    marginTop: SECTION,
    marginBottom: SM,
  },
  sectionLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
  },
  supportCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
    paddingVertical: 13,
    paddingHorizontal: CARD_PADDING,
  },
  supportRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  supportText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_PRIMARY,
  },
  loadingCard: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_LG,
    padding: SECTION,
    alignItems: 'center',
    marginTop: MD,
  },
  loadingTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: TEXT_SECONDARY,
    marginTop: MD,
  },
  loadingSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  docTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  docTypeText: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    fontWeight: MEDIUM as '500',
    color: NEAR_BLACK,
  },
  explanationText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
    lineHeight: 20,
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
  },
  optionsCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  optionAction: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  optionDetail: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  scanAgainLink: {
    alignItems: 'center',
    marginTop: MD,
  },
  scanAgainText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: BLACK,
    fontWeight: MEDIUM as '500',
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
  disclaimer: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
});
