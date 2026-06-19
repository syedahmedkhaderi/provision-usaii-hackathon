import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  SAGE, SAGE_LIGHT, SAGE_DARK, AMBER_LIGHT, AMBER_MID,
  CLAY, CLAY_LIGHT, WHITE, BORDER, CARD_BG, TEXT_PRIMARY,
  TEXT_SECONDARY, TEXT_MUTED,
} from '../../constants/colors';
import {
  HEADING_SM, BODY, BODY_SM, LABEL_SM, CAPTION,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { RADIUS_LG, RADIUS_MD, RADIUS_PILL, PAGE_HORIZONTAL, MD, LG, SM, CARD_PADDING } from '../../constants/spacing';
import { ConfidenceBar } from '../ui/ConfidenceBar';
import { simulateEligibility } from '../../services/llmService';
import { UserProfile, EligibilityEstimate } from '../../types';

interface Scenario {
  id: string;
  label: string;
  incomeChange?: number;
  householdChange?: number;
  isJobLoss?: boolean;
}

const SCENARIOS: Scenario[] = [
  { id: 'income_up', label: 'My income went up $500/mo', incomeChange: 500 },
  { id: 'income_down', label: 'My income dropped $500/mo', incomeChange: -500 },
  { id: 'moved_out', label: 'Someone moved out', householdChange: -1 },
  { id: 'lost_job', label: 'I lost my job', isJobLoss: true },
];

interface BenefitsEstimatorProps {
  profile: UserProfile;
  baseline: EligibilityEstimate | null;
}

export function BenefitsEstimator({ profile, baseline }: BenefitsEstimatorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    modified: EligibilityEstimate;
    reportNote?: string;
  } | null>(null);

  const handleScenario = async (scenario: Scenario) => {
    if (selected === scenario.id) {
      setSelected(null);
      setResult(null);
      return;
    }
    setSelected(scenario.id);
    setLoading(true);
    setResult(null);

    try {
      const modified = await simulateEligibility(profile, scenario);
      if (modified) {
        const reportNote =
          scenario.incomeChange || scenario.isJobLoss
            ? 'Must report within 10 days'
            : scenario.householdChange
            ? 'Must report within 10 days'
            : undefined;
        setResult({ modified, reportNote });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = () => {
    router.push('/(tabs)/report');
  };

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="swap-horizontal-outline" size={18} color={SAGE} />
        <Text style={styles.cardTitle}>What would change if...?</Text>
      </View>

      <View style={styles.chipRow}>
        {SCENARIOS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.chip,
              selected === s.id && styles.chipSelected,
            ]}
            onPress={() => handleScenario(s)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, selected === s.id && styles.chipTextSelected]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={SAGE} />
          <Text style={styles.loadingText}>Calculating...</Text>
        </View>
      )}

      {result && baseline && !loading && (
        <View style={styles.resultArea}>
          <View style={styles.resultColumns}>
            <View style={styles.resultCol}>
              <Text style={styles.colLabel}>NOW</Text>
              <Text style={styles.colRange}>
                {fmt(baseline.benefitRange[0])}–{fmt(baseline.benefitRange[1])}
              </Text>
              <Text style={styles.colUnit}>/mo</Text>
            </View>

            <View style={styles.resultArrow}>
              <Ionicons name="arrow-forward" size={16} color={TEXT_MUTED} />
            </View>

            <View style={styles.resultCol}>
              <Text style={styles.colLabel}>WITH CHANGE</Text>
              <Text style={[
                styles.colRange,
                result.modified.benefitRange[0] < baseline.benefitRange[0]
                  ? styles.rangeDown
                  : styles.rangeUp,
              ]}>
                {fmt(result.modified.benefitRange[0])}–{fmt(result.modified.benefitRange[1])}
              </Text>
              <Text style={styles.colUnit}>/mo</Text>
            </View>
          </View>

          {result.reportNote && (
            <View style={styles.reportNoteRow}>
              <View style={styles.reportNotePill}>
                <Text style={styles.reportNoteText}>{result.reportNote}</Text>
              </View>
            </View>
          )}

          <ConfidenceBar level={result.modified.confidence} />

          <TouchableOpacity style={styles.reportBtn} onPress={handleReportChange} activeOpacity={0.8}>
            <Text style={styles.reportBtnText}>Report this change →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SAGE_LIGHT,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: SAGE,
    borderLeftWidth: 3,
    marginHorizontal: PAGE_HORIZONTAL,
    padding: CARD_PADDING,
    gap: MD,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    fontWeight: SEMIBOLD as '600',
    color: SAGE_DARK,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SM,
  },
  chip: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_PILL,
    borderWidth: 0.5,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSelected: {
    backgroundColor: SAGE,
    borderColor: SAGE,
  },
  chipText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_PRIMARY,
  },
  chipTextSelected: {
    color: WHITE,
    fontWeight: MEDIUM as '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SM,
  },
  loadingText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
  resultArea: {
    gap: MD,
  },
  resultColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
  },
  resultCol: {
    flex: 1,
  },
  resultArrow: {
    paddingTop: 16,
  },
  colLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  colRange: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
  },
  rangeDown: {
    color: CLAY,
  },
  rangeUp: {
    color: SAGE,
  },
  colUnit: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
  },
  reportNoteRow: {
    flexDirection: 'row',
  },
  reportNotePill: {
    backgroundColor: AMBER_LIGHT,
    borderRadius: RADIUS_PILL,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: AMBER_MID,
  },
  reportNoteText: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: AMBER_MID,
    fontWeight: MEDIUM as '500',
  },
  reportBtn: {
    alignSelf: 'flex-start',
  },
  reportBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: SAGE,
  },
});
