// app/onboarding/welcome.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BLACK, WHITE, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from '../../constants/colors';
import {
  DISPLAY, HEADING_LG, BODY, BODY_LG, LABEL_SM,
  SEMIBOLD, FONT_FAMILY, LINE_NORMAL, LINE_LOOSE,
} from '../../constants/typography';
import { PAGE_HORIZONTAL, SECTION, LG, XL, MD, SM } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    { icon: 'calendar-outline' as const, text: 'Your renewal roadmap' },
    { icon: 'alert-circle-outline' as const, text: 'Know what to report' },
    { icon: 'document-text-outline' as const, text: 'Understand any notice' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Black header zone */}
        <View style={styles.header}>
          <View style={styles.markCircle}>
            <Ionicons name="ellipsis-horizontal" size={32} color={WHITE} />
          </View>
          <Text style={styles.brandName}>Provision</Text>
          <Text style={styles.brandSub}>SNAP Navigator</Text>
        </View>

        {/* White content zone */}
        <View style={styles.content}>
          <Text style={styles.headline}>Know where you stand.</Text>
          <Text style={styles.subHeadline}>Keep your benefits.</Text>
          <Text style={styles.body}>
            Track deadlines. Understand reporting rules. Know what to do if something goes wrong.
          </Text>

          <View style={styles.features}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name={f.icon} size={18} color={BLACK} />
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />

          <Button label="Get started" onPress={() => router.push('/onboarding/state')} />

          <Text style={styles.fineprint}>
            Stays on your device. Not legal advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    height: 240,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: SEMIBOLD as '600',
    color: WHITE,
    marginTop: 12,
  },
  brandSub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingTop: SECTION,
    paddingBottom: LG,
  },
  headline: {
    fontFamily: FONT_FAMILY,
    fontSize: DISPLAY,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  subHeadline: {
    fontFamily: FONT_FAMILY,
    fontSize: DISPLAY,
    fontWeight: SEMIBOLD as '600',
    color: BLACK,
    marginBottom: XL,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: SECTION,
  },
  features: {
    gap: MD,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_SECONDARY,
  },
  fineprint: {
    fontFamily: FONT_FAMILY,
    fontSize: LABEL_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: SM,
  },
});
