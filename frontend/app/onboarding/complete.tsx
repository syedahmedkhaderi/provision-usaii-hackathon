// app/onboarding/complete.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, TEXT_PRIMARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, BODY_SM, BODY_LG,
  SEMIBOLD, MEDIUM, FONT_FAMILY, CAPTION,
} from '../../constants/typography';
import { RADIUS_LG, PAGE_HORIZONTAL, MD, LG, SECTION, SM } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { SNAP_RULES } from '../../constants/snapRules';

export default function CompleteScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser();
  const [notifEnabled, setNotifEnabled] = useState(profile?.notificationsEnabled ?? false);

  if (!profile) return null;

  const rules = SNAP_RULES[profile.state];

  const handleFinish = () => {
    updateProfile({ onboardingComplete: true, notificationsEnabled: notifEnabled });
    router.replace('/(tabs)');
  };

  const reportingLabel =
    profile.reportingType === 'SAR'
      ? 'Semi-Annual (SAR)'
      : profile.reportingType === 'QR'
      ? 'Quarterly (QR)'
      : 'State default';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ProgressDots total={6} current={6} />

        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={44} color={BLACK} />
        </View>

        <Text style={styles.title}>You're all set.</Text>

        {/* Profile summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <SectionLabel>State</SectionLabel>
            <Text style={styles.summaryValue}>{rules.stateName}</Text>
          </View>
          <Divider />
          <View style={styles.summaryRow}>
            <SectionLabel>Household</SectionLabel>
            <Text style={styles.summaryValue}>
              {profile.householdSize} {profile.householdSize === 1 ? 'person' : 'people'}
            </Text>
          </View>
          <Divider />
          <View style={styles.summaryRow}>
            <SectionLabel>Reporting</SectionLabel>
            <Text style={styles.summaryValue}>{reportingLabel}</Text>
          </View>
        </View>

        {/* Notification opt-in */}
        <View style={styles.notifCard}>
          <Ionicons name="notifications-outline" size={20} color={BLACK} />
          <View style={styles.notifText}>
            <Text style={styles.notifTitle}>Deadline reminders</Text>
            <Text style={styles.notifSub}>30, 14, 7, and 2 days before each deadline</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ false: BORDER, true: BLACK }}
            thumbColor={WHITE}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Go to my dashboard" onPress={handleFinish} />
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
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SECTION,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_LG,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SECTION,
  },
  summaryCard: {
    backgroundColor: WHITE,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: LG,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SM,
  },
  summaryValue: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MD,
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_LG,
    padding: LG,
    marginTop: SECTION,
  },
  notifText: { flex: 1 },
  notifTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    fontWeight: MEDIUM as '500',
    color: TEXT_PRIMARY,
  },
  notifSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
