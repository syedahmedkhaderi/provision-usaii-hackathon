// app/onboarding/household.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  BLACK, WHITE, TEXT_PRIMARY, TEXT_MUTED, BORDER, CARD_BG,
} from '../../constants/colors';
import {
  HEADING_LG, BODY, HEADING_SM,
  SEMIBOLD, MEDIUM, FONT_FAMILY,
} from '../../constants/typography';
import { PAGE_HORIZONTAL, MD, LG, SECTION } from '../../constants/spacing';
import { useUser } from '../../context/UserContext';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { Button } from '../../components/ui/Button';

export default function HouseholdScreen() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [count, setCount] = useState(1);

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
      Haptics.selectionAsync();
    }
  };
  const increment = () => {
    if (count < 10) {
      setCount(count + 1);
      Haptics.selectionAsync();
    }
  };
  const handleContinue = () => {
    updateProfile({ householdSize: count });
    router.push('/onboarding/income');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ProgressDots total={7} current={3} />

        <Text style={styles.question}>How many people are in your household?</Text>
        <Text style={styles.subText}>Include everyone who buys and prepares food together.</Text>

        <View style={styles.counter}>
          <TouchableOpacity
            onPress={decrement}
            disabled={count <= 1}
            style={[
              styles.counterBtn,
              { backgroundColor: count <= 1 ? CARD_BG : WHITE },
            ]}
          >
            <Ionicons
              name="remove"
              size={20}
              color={count <= 1 ? BORDER : TEXT_PRIMARY}
            />
          </TouchableOpacity>

          <Text style={styles.countDisplay}>{count}</Text>

          <TouchableOpacity
            onPress={increment}
            disabled={count >= 10}
            style={[
              styles.counterBtn,
              { backgroundColor: count >= 10 ? CARD_BG : WHITE },
            ]}
          >
            <Ionicons
              name="add"
              size={20}
              color={count >= 10 ? BORDER : TEXT_PRIMARY}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.countLabel}>
          {count === 1 ? 'person' : 'people'}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} />
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
  question: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_LG,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    marginBottom: MD,
  },
  subText: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY,
    color: TEXT_MUTED,
    marginBottom: 48,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countDisplay: {
    fontFamily: FONT_FAMILY,
    fontSize: 48,
    fontWeight: SEMIBOLD as '600',
    color: TEXT_PRIMARY,
    minWidth: 60,
    textAlign: 'center',
  },
  countLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: HEADING_SM,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: MD,
  },
  footer: {
    paddingHorizontal: PAGE_HORIZONTAL,
    paddingVertical: LG,
    backgroundColor: WHITE,
  },
});
