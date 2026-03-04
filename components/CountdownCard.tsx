import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCountdown } from '../hooks/useCountdown';
import { getTheme } from '../constants/themes';
import type { CountdownEvent } from '../hooks/useCountdowns';

interface Props {
  event: CountdownEvent;
  onPress: () => void;
}

export function CountdownCard({ event, onPress }: Props) {
  const theme = getTheme(event.colorTheme);
  const countdown = useCountdown(event.targetDate);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {event.photoUri && (
          <Image
            source={{ uri: event.photoUri }}
            style={styles.backgroundPhoto}
            blurRadius={3}
          />
        )}
        <View style={styles.content}>
          <Text style={[styles.emoji]}>{event.emoji}</Text>
          <View style={styles.textContent}>
            <Text style={[styles.name, { color: theme.textColor }]} numberOfLines={1}>
              {event.name}
            </Text>
            <View style={styles.countdownRow}>
              {countdown.isToday ? (
                <Text style={[styles.todayText, { color: theme.textColor }]}>
                  🎉 Today's the day!
                </Text>
              ) : (
                <>
                  <Text style={[styles.daysNumber, { color: theme.textColor }]}>
                    {countdown.totalDays}
                  </Text>
                  <Text style={[styles.daysLabel, { color: theme.secondaryTextColor }]}>
                    {countdown.isPast ? 'days ago' : countdown.totalDays === 1 ? 'day' : 'days'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        {event.recurring && (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringText}>🔄</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    minHeight: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundPhoto: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    opacity: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 42,
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'System',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  daysNumber: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayText: {
    fontSize: 20,
    fontWeight: '700',
  },
  recurringBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  recurringText: {
    fontSize: 16,
  },
});
