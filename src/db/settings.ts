import type { SQLiteDatabase } from 'expo-sqlite';

export type ReminderPreferences = {
  startHour: number;
  endHour: number;
  intervalMinutes: 30 | 60 | 120;
};

export type CustomActivity = {
  key: string;
  label: string;
  emoji: string;
};

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  startHour: 9,
  endHour: 22,
  intervalMinutes: 60,
};

async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string,
) {
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}

export async function hasCompletedOnboarding(db: SQLiteDatabase) {
  return (await getSetting(db, 'onboardingCompleted')) === 'true';
}

export async function completeOnboarding(db: SQLiteDatabase) {
  await setSetting(db, 'onboardingCompleted', 'true');
}

export async function getCustomActivities(db: SQLiteDatabase): Promise<CustomActivity[]> {
  const value = await getSetting(db, 'customActivities');
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (activity): activity is CustomActivity =>
          typeof activity === 'object' &&
          activity !== null &&
          'key' in activity &&
          typeof activity.key === 'string' &&
          activity.key.startsWith('user:') &&
          'label' in activity &&
          typeof activity.label === 'string' &&
          activity.label.trim().length > 0 &&
          'emoji' in activity &&
          typeof activity.emoji === 'string' &&
          activity.emoji.length > 0,
      )
      .slice(0, 24);
  } catch {
    return [];
  }
}

export async function saveCustomActivities(
  db: SQLiteDatabase,
  activities: CustomActivity[],
) {
  await setSetting(db, 'customActivities', JSON.stringify(activities.slice(0, 24)));
}

function readHour(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 23 ? number : fallback;
}

function readInterval(value: string | null): 30 | 60 | 120 {
  const number = Number(value);
  return number === 30 || number === 120 ? number : 60;
}

export async function getReminderPreferences(
  db: SQLiteDatabase,
): Promise<ReminderPreferences> {
  const [startHour, endHour, intervalMinutes] = await Promise.all([
    getSetting(db, 'reminderStartHour'),
    getSetting(db, 'reminderEndHour'),
    getSetting(db, 'reminderIntervalMinutes'),
  ]);

  const preferences = {
    startHour: readHour(startHour, DEFAULT_REMINDER_PREFERENCES.startHour),
    endHour: readHour(endHour, DEFAULT_REMINDER_PREFERENCES.endHour),
    intervalMinutes: readInterval(intervalMinutes),
  };

  if (preferences.endHour <= preferences.startHour) {
    return DEFAULT_REMINDER_PREFERENCES;
  }
  return preferences;
}

export async function saveReminderPreferences(
  db: SQLiteDatabase,
  preferences: ReminderPreferences,
) {
  await db.withTransactionAsync(async () => {
    await setSetting(db, 'reminderStartHour', preferences.startHour.toString());
    await setSetting(db, 'reminderEndHour', preferences.endHour.toString());
    await setSetting(
      db,
      'reminderIntervalMinutes',
      preferences.intervalMinutes.toString(),
    );
  });
}
