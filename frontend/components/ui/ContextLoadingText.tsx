import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { SAGE, TEXT_MUTED, CARD_BG, BORDER } from '../../constants/colors';
import { BODY_LG, BODY_SM, FONT_FAMILY } from '../../constants/typography';
import { MD, RADIUS_LG, SECTION } from '../../constants/spacing';

interface ContextLoadingTextProps {
  messages: string[];
  intervalMs?: number;
}

export function ContextLoadingText({ messages, intervalMs = 1800 }: ContextLoadingTextProps) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    };

    const timer = setInterval(cycle, intervalMs);
    return () => clearInterval(timer);
  }, [messages.length, intervalMs]);

  return (
    <View style={styles.card}>
      <ActivityIndicator size="large" color={SAGE} />
      <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
        {messages[index]}
      </Animated.Text>
      <Text style={styles.sub}>This takes a few seconds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS_LG,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: SECTION,
    alignItems: 'center',
    marginTop: MD,
    gap: MD,
  },
  message: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_LG,
    color: '#4A5568',
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT_FAMILY,
    fontSize: BODY_SM,
    color: TEXT_MUTED,
  },
});
