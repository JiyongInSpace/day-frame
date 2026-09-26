import type { SQLiteDatabase } from 'expo-sqlite';

import { getCustomActivities, saveCustomActivities } from '@/db/settings';

describe('custom activity settings', () => {
  it('reads only valid saved activity chips', async () => {
    const getFirstAsync = jest.fn().mockResolvedValue({
      value: JSON.stringify([
        { key: 'user:walk', label: '산책', emoji: '🚶' },
        { key: 'custom:once', label: '일회성', emoji: '✏️' },
        { key: 'user:empty', label: '', emoji: '☕' },
      ]),
    });
    const db = { getFirstAsync } as unknown as SQLiteDatabase;

    await expect(getCustomActivities(db)).resolves.toEqual([
      { key: 'user:walk', label: '산책', emoji: '🚶' },
    ]);
  });

  it('stores at most 24 activity chips', async () => {
    const runAsync = jest.fn().mockResolvedValue(undefined);
    const db = { runAsync } as unknown as SQLiteDatabase;
    const activities = Array.from({ length: 25 }, (_, index) => ({
      key: `user:${index}`,
      label: `활동 ${index}`,
      emoji: '✏️',
    }));

    await saveCustomActivities(db, activities);

    const saved = JSON.parse(runAsync.mock.calls[0][2]);
    expect(saved).toHaveLength(24);
  });
});
