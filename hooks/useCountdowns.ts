import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import type { ColorTheme } from '../constants/themes';

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
  notifyDaysBefore?: number;
}

export type CreateEventInput = Omit<CountdownEvent, 'id' | 'createdAt'>;
export type UpdateEventInput = Partial<Omit<CountdownEvent, 'id' | 'createdAt'>>;

export function useCountdowns() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CountdownEvent[] = JSON.parse(raw);
        setEvents(parsed);
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
      const updated = [...events, newEvent];
      await saveEvents(updated);
      return newEvent;
    },
    [events, saveEvents]
  );

  const updateEvent = useCallback(
    async (id: string, changes: UpdateEventInput): Promise<void> => {
      const updated = events.map((e) => (e.id === id ? { ...e, ...changes } : e));
      await saveEvents(updated);
    },
    [events, saveEvents]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<void> => {
      const updated = events.filter((e) => e.id !== id);
      await saveEvents(updated);
    },
    [events, saveEvents]
  );

  const getEvent = useCallback(
    (id: string): CountdownEvent | undefined => {
      return events.find((e) => e.id === id);
    },
    [events]
  );

  // Sort by nearest date first, past events at end
  const sortedEvents = [...events].sort((a, b) => {
    const now = Date.now();
    const aTime = new Date(a.targetDate).getTime();
    const bTime = new Date(b.targetDate).getTime();
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;

    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    if (aFuture && bFuture) return aTime - bTime;
    return bTime - aTime; // Past events: most recent first
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
