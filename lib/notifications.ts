import * as Notifications from 'expo-notifications';
import type { NotificationInterval } from '../constants/notifications';

async function getPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: asked } = await Notifications.requestPermissionsAsync();
  return asked === 'granted';
}

// Returns fire dates (9am local) for notifications before the event
function buildFireDates(targetDate: string, interval: NotificationInterval): Date[] {
  if (interval === 'none') return [];

  const base = new Date(targetDate + 'T09:00:00');
  const now = new Date();

  const offsets: number[] =
    interval === 'dayOf'      ? [0] :
    interval === 'daily'      ? [1, 2, 3, 4, 5, 6, 7] :
    interval === 'every3days' ? [3, 6, 9, 12, 15, 18, 21, 24, 27, 30] :
    /* weekly */                [7, 14, 21, 28];

  return offsets
    .map((days) => {
      const d = new Date(base);
      d.setDate(d.getDate() - days);
      return d;
    })
    .filter((d) => d > now);
}

export async function scheduleEventNotifications(
  eventId: string,
  eventName: string,
  targetDate: string,
  interval: NotificationInterval,
  existingIds: string[] = []
): Promise<string[]> {
  // Cancel any previously scheduled notifications for this event
  if (existingIds.length) {
    await Promise.all(
      existingIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
    );
  }

  if (interval === 'none') return [];

  const granted = await getPermission();
  if (!granted) return [];

  const fireDates = buildFireDates(targetDate, interval);
  if (!fireDates.length) return [];

  const targetMidnight = new Date(targetDate + 'T00:00:00');
  const ids: string[] = [];

  for (const date of fireDates) {
    const fireMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const daysUntil = Math.round(
      (targetMidnight.getTime() - fireMidnight.getTime()) / 86400000
    );

    const body =
      daysUntil === 0 ? `Today is the day! 🎉` :
      daysUntil === 1 ? `Tomorrow: "${eventName}" 🗓️` :
      `"${eventName}" is in ${daysUntil} days 📅`;

    const nid = await Notifications.scheduleNotificationAsync({
      content: { title: 'DaysPop', body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
    ids.push(nid);
  }

  return ids;
}

export async function cancelEventNotifications(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
  );
}
