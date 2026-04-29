import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NOTIFICATION_OPTIONS, type NotificationInterval } from '../constants/notifications';

interface Props {
  selected: NotificationInterval;
  onSelect: (interval: NotificationInterval) => void;
}

export function NotificationPicker({ selected, onSelect }: Props) {
  const hint = NOTIFICATION_OPTIONS.find((o) => o.value === selected)?.hint ?? '';

  const handleSelect = (value: NotificationInterval) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🔔 Remind me</Text>
      <View style={styles.grid}>
        {NOTIFICATION_OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={styles.pillIcon}>{opt.icon}</Text>
              <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillActive: {
    backgroundColor: '#f3e8ff',
    borderColor: '#a855f7',
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  pillLabelActive: {
    color: '#7c3aed',
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
