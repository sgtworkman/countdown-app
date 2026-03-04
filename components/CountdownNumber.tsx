import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface Props {
  value: number;
  label: string;
  color: string;
  secondaryColor: string;
  large?: boolean;
}

export function CountdownNumber({ value, label, color, secondaryColor, large }: Props) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    opacity.value = withDelay(100, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={[
        large ? styles.valueLarge : styles.value,
        { color },
      ]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: secondaryColor }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

interface TickerProps {
  hours: number;
  minutes: number;
  seconds: number;
  color: string;
  secondaryColor: string;
}

export function CountdownTicker({ hours, minutes, seconds, color, secondaryColor }: TickerProps) {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <View style={styles.tickerContainer}>
      <View style={styles.tickerUnit}>
        <Text style={[styles.tickerValue, { color }]}>{pad(hours)}</Text>
        <Text style={[styles.tickerLabel, { color: secondaryColor }]}>hrs</Text>
      </View>
      <Text style={[styles.tickerSeparator, { color: secondaryColor }]}>:</Text>
      <View style={styles.tickerUnit}>
        <Text style={[styles.tickerValue, { color }]}>{pad(minutes)}</Text>
        <Text style={[styles.tickerLabel, { color: secondaryColor }]}>min</Text>
      </View>
      <Text style={[styles.tickerSeparator, { color: secondaryColor }]}>:</Text>
      <View style={styles.tickerUnit}>
        <Text style={[styles.tickerValue, { color }]}>{pad(seconds)}</Text>
        <Text style={[styles.tickerLabel, { color: secondaryColor }]}>sec</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  value: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  valueLarge: {
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 130,
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: -4,
  },
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  tickerUnit: {
    alignItems: 'center',
    minWidth: 48,
  },
  tickerValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tickerSeparator: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
});
