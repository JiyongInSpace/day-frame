import type { ActivityRecord } from '@/db/records';
import { getActivityColor, getDayClockRecords, pickSceneRecords } from '@/utils/day-card';

function makeRecord(hour: number, overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  const start = new Date(2026, 8, 26, hour).getTime();
  return {
    id: hour,
    intervalStart: start,
    intervalEnd: start + 60 * 60 * 1000,
    respondedAt: start,
    updatedAt: start,
    activityKey: 'work',
    activityLabel: '일',
    emoji: '💻',
    note: null,
    status: 'recorded',
    source: 'quick',
    ...overrides,
  };
}

describe('day card presentation', () => {
  it('lays out clock data from 4am through the following 3am', () => {
    const records = [makeRecord(4), makeRecord(23)];
    const hours = getDayClockRecords(records);

    expect(hours).toHaveLength(24);
    expect(hours[0]).toMatchObject({ hour: 4, record: records[0] });
    expect(hours[19]).toMatchObject({ hour: 23, record: records[1] });
    expect(hours[23].hour).toBe(3);
  });

  it('picks up to four recorded scenes spread across the day', () => {
    const records = Array.from({ length: 8 }, (_, index) => makeRecord(index + 4));
    records[3] = makeRecord(7, { status: 'skipped', activityKey: null });

    expect(pickSceneRecords(records).map((record) => record.id)).toEqual([4, 6, 9, 11]);
  });

  it('keeps skipped and missing time visually uncolored', () => {
    expect(getActivityColor(makeRecord(9))).toBeTruthy();
    expect(getActivityColor(makeRecord(10, { status: 'skipped' }))).toBeNull();
    expect(getActivityColor()).toBeNull();
  });
});
