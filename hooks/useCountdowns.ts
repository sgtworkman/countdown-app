import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import type { ColorTheme } from '../constants/themes';
import type { NotificationInterval } from '../constants/notifications';
import { scheduleEventNotifications, cancelEventNotifications } from '../lib/notifications';

const STORAGE_KEY = '@countdown_events';

export interface CountdownEvent {
  id: string;
  name: string;
  targetDate: string; // ISO "2026-06-15"
  emoji: string;
  colorTheme: ColorTheme;
  photoUri?: string;
  recurring?: 'annual';
  createdAt: string;
  notificationInterval?: NotificationInterval;
  notificationIds?: string[];
}

export type CreateEventInput = Omit<CountdownEvent, 'id' | 'createdAt' | 'notificationIds'>;
export type UpdateEventInput = Partial<Omit<CountdownEvent, 'id' | 'createdAt' | 'notificationIds'>>;

export function useCountdowns() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CountdownEvent[] = JSON.parse(raw);
        // Auto-advance recurring events past their date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let changed = false;
        parsed.forEach((ev) => {
          if (ev.recurring !== 'annual') return;
          const target = new Date(ev.targetDate + 'T00:00:00');
          if (target < today) {
            target.setFullYear(today.getFullYear());
            if (target < today) target.setFullYear(today.getFullYear() + 1);
            ev.targetDate = target.toISOString().split('T')[0];
            changed = true;
          }
        });
        setEvents(parsed);
        if (changed) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch (err) {
      console.error('Failed to load countdowns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const saveEvents = useCallback(async (updated: CountdownEvent[]) => {
    setEvents(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save countdowns:', err);
    }
  }, []);

  const addEvent = useCallback(
    async (input: CreateEventInput): Promise<CountdownEvent> => {
      const newEvent: CountdownEvent = {
        ...input,
        id: uuid.v4() as string,
        createdAt: new Date().toISOString(),
      };

      // Schedule notifications if requested
      if (newEvent.notificationInterval && newEvent.notificationInterval !== 'none') {
        const ids = await scheduleEventNotifications(
          newEvent.id,
          newEvent.name,
          newEvent.targetDate,
          newEvent.notificationInterval
        );
        newEvent.notificationIds = ids;
      }

      const updated = [...events, newEvent];
      await saveEvents(updated);
      return newEvent;
    },
    [events, saveEvents]
  );

  const updateEvent = useCallback(
    async (id: string, changes: UpdateEventInput): Promise<void> => {
      const existing = events.find((e) => e.id === id);
      if (!existing) return;

      const merged = { ...existing, ...changes };

      // Reschedule if the notification interval changed
      if ('notificationInterval' in changes) {
        const ids = await scheduleEventNotifications(
          merged.id,
          merged.name,
          merged.targetDate,
          merged.notificationInterval ?? 'none',
          existing.notificationIds ?? []
        );
        merged.notificationIds = ids;
      }

      const updated = events.map((e) => (e.id === id ? merged : e));
      await saveEvents(updated);
    },
    [events, saveEvents]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<void> => {
      const event = events.find((e) => e.id === id);
      if (event?.notificationIds?.length) {
        await cancelEventNotifications(event.notificationIds);
      }
      const updated = events.filter((e) => e.id !== id);
      await saveEvents(updated);
    },
    [events, saveEvents]
  );

  const getEvent = useCallback(
    (id: string): CountdownEvent | undefined => events.find((e) => e.id === id),
    [events]
  );

  // Sort: today + future first (nearest first), past events at end (most recent first)
  // Use local midnight for comparison to avoid timezone sorting bugs
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const todayMs = todayMidnight.getTime();

  const sortedEvents = [...events].sort((a, b) => {
    const aMs = new Date(a.targetDate + 'T00:00:00').getTime();
    const bMs = new Date(b.targetDate + 'T00:00:00').getTime();
    const aUpcoming = aMs >= todayMs;
    const bUpcoming = bMs >= todayMs;

    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    if (aUpcoming && bUpcoming) return aMs - bMs;
    return bMs - aMs; // past: most recent first
  });

  return {
    events: sortedEvents,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    reload: loadEvents,
  };
}
