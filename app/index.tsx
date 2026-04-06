import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CountdownCard } from '../components/CountdownCard';
import { ProPaywall } from '../components/ProPaywall';
import { useCountdowns } from '../hooks/useCountdowns';
import { usePro } from '../hooks/usePro';
import { MAX_FREE_COUNTDOWNS } from '../constants/themes';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { events, loading, reload } = useCountdowns();
  const { isPro, purchasePro } = usePro();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(true);

  // Reload events and settings when screen focuses (e.g., returning from Add/Edit)
  useFocusEffect(
    useCallback(() => {
      reload();
      AsyncStorage.getItem('@countdown_settings').then((raw) => {
        if (raw) {
          const s = JSON.parse(raw);
          setShowPastEvents(s.showPastEvents !== false);
        }
      });
    }, [reload])
  );

  const filteredEvents = showPastEvents
    ? events
    : events.filter((e) => new Date(e.targetDate + 'T00:00:00') >= new Date());

  const handleAdd = () => {
    if (!isPro && events.length >= MAX_FREE_COUNTDOWNS) {
      setShowPaywall(true);
      return;
    }
    router.push('/add');
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Countdowns</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {filteredEvents.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyState}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No countdowns yet!</Text>
            <Text style={styles.emptySubtitle}>
              Add your first countdown to start{'\n'}tracking something exciting
            </Text>
            <Pressable onPress={handleAdd} style={styles.emptyAddBtn}>
              <Text style={styles.emptyAddText}>+ Add Countdown</Text>
            </Pressable>
          </Animated.View>
        </View>
      ) : (
        /* Event List */
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {filteredEvents.map((event, index) => (
            <Animated.View
              key={event.id}
              entering={FadeInDown.delay(index * 80).springify()}
            >
              <CountdownCard
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            </Animated.View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
          { bottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <ProPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={purchasePro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF0FF',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF0FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  list: {
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  emptyAddBtn: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignSelf: 'center',
  },
  emptyAddText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
    opacity: 0.8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 34,
  },
});
