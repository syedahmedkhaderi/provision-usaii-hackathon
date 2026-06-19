import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, NEAR_BLACK, TEXT_PRIMARY, TEXT_SECONDARY,
  TEXT_MUTED, BORDER, CARD_BG,
} from '../constants/colors';
import {
  BODY, BODY_SM, BODY_LG, LABEL_SM, CAPTION,
  MEDIUM, SEMIBOLD, FONT_FAMILY,
} from '../constants/typography';
import {
  RADIUS_LG, PAGE_HORIZONTAL, SM, MD, LG, SECTION, CARD_PADDING,
} from '../constants/spacing';
import { useUser } from '../context/UserContext';
import { State, ReportingType } from '../types';
import { SNAP_RULES } from '../constants/snapRules';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, clearProfile } = useUser();

  const [state, setState] = useState<State>(profile?.state ?? 'CA');
  const [householdSize, setHouseholdSize] = useState(profile?.householdSize ?? 1);
  const [notifications, setNotifications] = useState(profile?.notificationsEnabled ?? false);
  const [reportingType, setReportingType] = useState<ReportingType>(profile?.reportingType ?? 'unknown');

  const enrollDate = profile?.enrollmentDate ? new Date(profile.enrollmentDate + 'T00:00:00') : null;
  const [enrollMonth, setEnrollMonth] = useState<number>(enrollDate ? enrollDate.getMonth() : new Date().getMonth());
  const [enrollYear, setEnrollYear] = useState<number>(enrollDate ? enrollDate.getFullYear() : CURRENT_YEAR);

  const handleSave = () => {
    const dateStr = `${enrollYear}-${String(enrollMonth + 1).padStart(2, '0')}-15`;
    updateProfile({
      state,
      householdSize,
      notificationsEnabled: notifications,
      reportingType,
      enrollmentDate: dateStr,
    });
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset account?',
      'This will erase all your data and restart onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearProfile();
            router.replace('/');
          },
        },
      ]
    );
  };

  const rules = SNAP_RULES[state];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SM }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── STATE ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>STATE</Text>
        <View style={styles.card}>
          <View style={styles.segmentedRow}>
            {(['CA', 'TX'] as State[]).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => {
                  setState(s);
                  setReportingType(SNAP_RULES[s].reportingType);
                }}
                activeOpacity={0.8}
                style={[styles.segment, state === s && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, state === s && styles.segmentTextActive]}>
                  {SNAP_RULES[s].stateName}
                </Text>
                <Text style={[styles.segmentSub, state === s && styles.segmentSubActive]}>
                  {SNAP_RULES[s].benefitName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── HOUSEHOLD ──────────────────────────── */}
        <Text style={styles.sectionLabel}>HOUSEHOLD SIZE</Text>
        <View style={styles.card}>
          <View style={styles.stepperRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>People in household</Text>
              <Text style={styles.rowSub}>Including yourself</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setHouseholdSize(Math.max(1, householdSize - 1))}
                style={styles.stepBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color={householdSize <= 1 ? TEXT_MUTED : BLACK} />
              </TouchableOpacity>
              <Text style={styles.stepValue}>{householdSize}</Text>
              <TouchableOpacity
                onPress={() => setHouseholdSize(Math.min(10, householdSize + 1))}
                style={styles.stepBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={householdSize >= 10 ? TEXT_MUTED : BLACK} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── ENROLLMENT DATE ────────────────────── */}
        <Text style={styles.sectionLabel}>ENROLLMENT DATE</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Month &amp; year you enrolled or last recertified</Text>
          <View style={styles.datePickerRow}>
            {/* Month scroll */}
            <ScrollView
              style={styles.datePicker}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
            >
              {MONTHS.map((m, i) => (
                <TouchableOpacity key={m} onPress={() => setEnrollMonth(i)} style={styles.dateItem}>
                  <Text style={[styles.dateItemText, enrollMonth === i && styles.dateItemSelected]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Year scroll */}
            <ScrollView
              style={styles.datePicker}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
            >
              {YEARS.map((y) => (
                <TouchableOpacity key={y} onPress={() => setEnrollYear(y)} style={styles.dateItem}>
                  <Text style={[styles.dateItemText, enrollYear === y && styles.dateItemSelected]}>
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.dateDisplay}>
            Selected: {MONTHS[enrollMonth]} {enrollYear}
          </Text>
        </View>

        {/* ── REPORTING TYPE ─────────────────────── */}
        <Text style={styles.sectionLabel}>REPORTING TYPE</Text>
        <View style={styles.card}>
          {([
            { value: 'SAR', label: 'Semi-Annual (SAR)', sub: 'Report every 6 months' },
            { value: 'QR', label: 'Quarterly (QR)', sub: 'Report every 3 months' },
            { value: 'unknown', label: 'Not sure', sub: 'We\'ll use your state default' },
          ] as { value: ReportingType; label: string; sub: string }[]).map((opt, i, arr) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setReportingType(opt.value)}
              activeOpacity={0.7}
              style={[styles.radioRow, i < arr.length - 1 && styles.radioRowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.radioLabel}>{opt.label}</Text>
                <Text style={styles.radioSub}>{opt.sub}</Text>
              </View>
              <View style={[styles.radioCircle, reportingType === opt.value && styles.radioCircleActive]}>
                {reportingType === opt.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── PREFERENCES ────────────────────────── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Deadline reminders</Text>
              <Text style={styles.rowSub}>30, 14, 7, and 2 days before each deadline</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: BORDER, true: BLACK }}
              thumbColor={WHITE}
            />
          </View>
        </View>

        {/* ── ABOUT ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={[styles.aboutRow, styles.radioRowBorder]}>
            <Text style={styles.rowLabel}>App</Text>
            <Text style={styles.aboutValue}>Provision</Text>
          </View>
          <View style={[styles.aboutRow, styles.radioRowBorder]}>
            <Text style={styles.rowLabel}>State</Text>
            <Text style={styles.aboutValue}>{rules.stateName}</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.rowLabel}>Caseworker line</Text>
            <Text style={styles.aboutValue}>{rules.caseworkerPhone}</Text>
          </View>
        </View>

        {/* ── DANGER ZONE ────────────────────────── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={16} color={NEAR_BLACK} />
          <Text style={styles.resetText}>Reset &amp; start over</Text>
        </TouchableOpacity>
        <Text style={styles.resetNote}>Erases all your data and restarts onboarding.</Text>

        <Text style={styles.disclaimer}>
          Provision is not affiliated with any government agency. Information is for guidance only and not legal advice.
        </Text>

        <View style={{ height: SECTION }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLACK,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingBottom: LG,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
    textAlign: 'center',
  },
  saveBtn: {
    width: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
  },

  scroll: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: SECTION,
  },

  sectionLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: CAPTION,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    marginBottom: SM,
    marginTop: MD,
  },

  // Card container
  card: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: SM,
  },

  // State segmented control
  segmentedRow: {
    flexDirection: 'row',
    padding: SM,
    gap: SM,
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    padding: MD,
    alignItems: 'center',
    backgroundColor: CARD_BG,
  },
  segmentActive: {
    backgroundColor: BLACK,
  },
  segmentText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_SECONDARY,
  },
  segmentTextActive: { color: WHITE },
  segmentSub: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  segmentSubActive: { color: 'rgba(255,255,255,0.6)' },

  // Household stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LG,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    borderWidth: 0.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    minWidth: 24,
    textAlign: 'center',
  },

  // Date picker
  datePickerRow: {
    flexDirection: 'row',
    gap: MD,
    paddingHorizontal: CARD_PADDING,
    marginTop: MD,
  },
  datePicker: {
    flex: 1,
    height: 120,
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: 10,
  },
  dateItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateItemText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
  },
  dateItemSelected: {
    color: BLACK,
    fontWeight: SEMIBOLD as '600',
  },
  dateDisplay: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: MD,
  },

  // Reporting type radio
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING,
  },
  radioRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  radioLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_PRIMARY,
    fontWeight: MEDIUM as '500',
  },
  radioSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: { borderColor: BLACK },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLACK,
  },

  // Notifications toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING,
  },

  // Row labels
  rowLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_PRIMARY,
    fontWeight: MEDIUM as '500',
  },
  rowSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // About rows
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: CARD_PADDING,
  },
  aboutValue: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
  },

  // Reset
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SM,
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: CARD_PADDING,
    marginBottom: SM,
  },
  resetText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: NEAR_BLACK,
    fontWeight: MEDIUM as '500',
  },
  resetNote: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: SECTION,
  },

  disclaimer: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: SM,
  },
});
