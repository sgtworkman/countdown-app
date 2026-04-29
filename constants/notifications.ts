export type NotificationInterval = 'none' | 'dayOf' | 'daily' | 'every3days' | 'weekly';

export const NOTIFICATION_OPTIONS: {
  value: NotificationInterval;
  label: string;
  icon: string;
  hint: string;
}[] = [
  { value: 'none',       label: 'None',    icon: '🔕', hint: '' },
  { value: 'dayOf',      label: 'Day of',  icon: '📅', hint: 'Reminder the morning of the event' },
  { value: 'daily',      label: 'Daily',   icon: '🔔', hint: 'Every day for the 7 days before' },
  { value: 'every3days', label: 'Every 3d',icon: '⏰', hint: 'Every 3 days, starting 30 days out' },
  { value: 'weekly',     label: 'Weekly',  icon: '📆', hint: 'Once a week for the 4 weeks before' },
];
