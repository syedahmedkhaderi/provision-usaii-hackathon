// app/(tabs)/scan.tsx — Scan a Notice
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
import { Badge } from '../../components/ui/Badge';
import { AccentCard } from '../../components/ui/AccentCard';
import { ContactBlock } from '../../components/ui/ContactBlock';
import { SectionLabel } from '../../components/ui/SectionLabel';
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
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const rules = SNAP_RULES[profile.state];

  const handleCapture = async (useCamera: boolean) => {
    setError(null);
    try {
      let result: ImagePicker.ImagePickerResult | null = null;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError('Camera permission denied.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.7,
        });
      }

      if (!result || result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        setError('Could not read image data.');
        return;
      }

      setStage('loading');
      const res = await scanDocument(asset.base64, profile);
      if (res) {
        setResult(res);
        setStage('result');
      } else {
        setError("Couldn't read this notice. Check your connection or try again.");
        setStage('idle');
      }
    } catch (e) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan a notice</Text>
        <Text style={styles.subText}>Photograph a letter - we'll explain it.</Text>
      </View>

      {/* IDLE */}
      {stage === 'idle' && (
        <>
          <TouchableOpacity onPress={showActionSheet} activeOpacity={0.7}>
            <View style={styles.captureArea}>
              <Ionicons name="camera-outline" size={36} color={BLACK} />
              <Text style={styles.captureTitle}>Tap to photograph</Text>
              <Text style={styles.captureSub}>Or upload from your camera roll</Text>
            </View>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.supportList}>
            <SectionLabel style={{ marginBottom: SM }}>What I can read</SectionLabel>
            {SUPPORTED.map((item, i) => (
              <View key={i} style={styles.supportRow}>
                <Ionicons name="checkmark" size={13} color={BLACK} />
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
          {/* Document type chip */}
          <View style={styles.docTypeChip}>
            <Ionicons name="document-text-outline" size={11} color={NEAR_BLACK} />
            <Text style={styles.docTypeText}>{result.document_type}</Text>
          </View>

          {/* Explanation */}
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

          {/* Options */}
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
                    label={
                      opt.urgency === 'urgent' ? 'Act now' :
                      opt.urgency === 'medium' ? 'Option' : 'If needed'
                    }
                    variant={opt.urgency === 'urgent' ? 'solid' : opt.urgency === 'medium' ? 'outline' : 'muted'}
                  />
                </View>
              ))}
            </View>
          )}

          <ContactBlock label={rules.caseworkerName} phone={rules.caseworkerPhone} />

          <TouchableOpacity onPress={handleScanAgain} style={styles.scanAgainLink}>
            <Text style={styles.scanAgainText}>Scan another notice</Text>
          </TouchableOpacity>

          <View style={{ height: SECTION }} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  content: { paddingHorizontal: PAGE_HORIZONTAL, paddingTop: SECTION },
  header: { marginBottom: MD },
  title: {
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
  captureArea: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: RADIUS_LG,
    padding: SECTION,
    alignItems: 'center',
    marginTop: MD,
  },
  captureTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
    marginTop: MD,
    marginBottom: 4,
  },
  captureSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
  errorText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: NEAR_BLACK,
    textAlign: 'center',
    marginTop: MD,
  },
  supportList: {
    marginTop: SECTION,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: WHITE,
    borderRadius: RADIUS_MD,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 10,
    marginBottom: 5,
  },
  supportText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_PRIMARY,
  },
  loadingCard: {
    backgroundColor: WHITE,
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
});
