import type { ReminderPreferences } from '@/db/settings';

export function getDailyReminderTimes(preferences: ReminderPreferences) {
  const times: { hour: number; minute: number }[] = [];
  const endMinutes = preferences.endHour * 60;

  for (
    let minutes = preferences.startHour * 60;
    minutes <= endMinutes;
    minutes += preferences.intervalMinutes
  ) {
    times.push({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  }
  return times;
}
