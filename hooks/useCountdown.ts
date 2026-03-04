import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

export interface CountdownValues {
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isToday: boolean;
  label: string; // "47 days" or "Today's the day!" or "3 days ago"
}

export function useCountdown(targetDate: string, liveSeconds = false): CountdownValues {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(
      () => setNow(new Date()),
      liveSeconds ? 1000 : 60000
    );
    return () => clearInterval(interval);
  }, [liveSeconds]);

  const target = new Date(targetDate + 'T00:00:00');
  const totalDays = differenceInDays(target, now);
  const isPast = target.getTime() < now.getTime() && totalDays < 0;
  const isToday = totalDays === 0 && !isPast;

  // For the live ticker: remaining hours/min/sec after subtracting full days
  const totalSeconds = differenceInSeconds(target, now);
  const absTotalSeconds = Math.abs(totalSeconds);
  const absDays = Math.floor(absTotalSeconds / 86400);
  const remainderAfterDays = absTotalSeconds - absDays * 86400;
  const hours = Math.floor(remainderAfterDays / 3600);
  const minutes = Math.floor((remainderAfterDays % 3600) / 60);
  const seconds = remainderAfterDays % 60;

  let label: string;
  if (isToday) {
    label = "Today's the day!";
  } else if (isPast) {
    const daysAgo = Math.abs(totalDays);
    label = `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
  } else {
    label = `${totalDays} day${totalDays === 1 ? '' : 's'}`;
  }

  return {
    totalDays: Math.abs(totalDays),
    hours,
    minutes,
    seconds,
    isPast,
    isToday,
    label,
  };
}
