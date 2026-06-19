import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import {
  WHITE, BORDER, CARD_BG, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  SAGE, SAGE_LIGHT, SAGE_DARK,
} from '../../constants/colors';
import {
  BODY, BODY_SM, BODY_LG, CAPTION, LABEL_SM, HEADING_SM,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, RADIUS_MD, PAGE_HORIZONTAL, MD, LG, SM, CARD_PADDING } from '../../constants/spacing';
import { CallScript } from '../../types';

interface CallScriptSheetProps {
  visible: boolean;
  script: CallScript;
  onClose: () => void;
}

export function CallScriptSheet({ visible, script, onClose }: CallScriptSheetProps) {
  const [copied, setCopied] = React.useState(false);
  const { height } = useWindowDimensions();

  const handleCopy = async () => {
    const full = `Opening: ${script.opening}\n\nWhat to say: ${script.what_to_say}\n\nWhat to ask: ${script.what_to_ask}`;
    await Clipboard.setStringAsync(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: height * 0.8 }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>What to say when you call</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <ScriptSection label="OPENER" text={script.opening} editable />
            <ScriptSection label="WHAT TO SAY" text={script.what_to_say} />
            <ScriptSection label="WHAT TO ASK" text={script.what_to_ask} />
            <View style={{ height: MD }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: copied ? '#6B6B6B' : SAGE }]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={WHITE} />
              <Text style={styles.copyBtnText}>
                {copied ? 'Copied!' : 'Copy full script'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeLink} onPress={onClose}>
              <Text style={styles.closeLinkText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ScriptSection({ label, text, editable }: { label: string; text: string; editable?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={[styles.sectionBox, editable && styles.sectionBoxEditable]}>
        <Text style={styles.sectionText}>{text}</Text>
        {editable && (
          <Text style={styles.editHint}>Fill in your name and case number before calling</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAGE_HORIZONTAL,
    marginBottom: MD,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
  },
  divider: {
    height: 0.5,
    backgroundColor: BORDER,
  },
  scrollArea: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: LG,
  },
  section: {
    marginBottom: MD,
  },
  sectionLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: SM,
  },
  sectionBox: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_MD,
    padding: CARD_PADDING,
    borderWidth: 0.5,
    borderColor: BORDER,
  },
  sectionBoxEditable: {
    backgroundColor: SAGE_LIGHT,
    borderColor: SAGE,
  },
  sectionText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  editHint: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: SAGE,
    marginTop: SM,
  },
  footer: {
    padding: PAGE_HORIZONTAL,
    paddingBottom: LG,
    gap: SM,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
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
  closeLink: {
    alignItems: 'center',
    paddingVertical: SM,
  },
  closeLinkText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
  },
});
