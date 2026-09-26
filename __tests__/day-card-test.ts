import type { ActivityRecord } from '@/db/records';
import {
  formatGroupDuration,
  getActivityColor,
  getDayClockRecords,
  groupConsecutiveRecords,
  pickSceneGroups,
} from '@/utils/day-card';

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

  it('groups consecutive records of the same activity into one scene', () => {
    const records = [
      makeRecord(8, { note: '자료 정리' }),
      makeRecord(9, { note: '회의' }),
      makeRecord(10, { activityKey: 'meal', activityLabel: '식사' }),
      makeRecord(12),
    ];
    const groups = groupConsecutiveRecords(records);

    expect(groups).toHaveLength(3);
    expect(groups[0].records).toHaveLength(2);
    expect(groups[0].notes).toEqual(['자료 정리', '회의']);
    expect(formatGroupDuration(groups[0])).toBe('2시간');
    expect(groups[2].records).toHaveLength(1);
  });

  it('picks up to four grouped scenes spread across the day', () => {
    const records = Array.from({ length: 8 }, (_, index) => makeRecord(index + 4));
    records[3] = makeRecord(7, { status: 'skipped', activityKey: null });
    records[4] = makeRecord(8, { activityKey: 'meal', activityLabel: '식사' });
    records[5] = makeRecord(9, { activityKey: 'travel', activityLabel: '이동' });
    records[6] = makeRecord(10, { activityKey: 'rest', activityLabel: '휴식' });

    expect(pickSceneGroups(records).map((group) => group.records[0].id)).toEqual([
      4, 8, 10, 11,
    ]);
  });

  it('keeps skipped and missing time visually uncolored', () => {
    expect(getActivityColor(makeRecord(9))).toBeTruthy();
    expect(getActivityColor(makeRecord(10, { status: 'skipped' }))).toBeNull();
    expect(getActivityColor()).toBeNull();
  });
});
