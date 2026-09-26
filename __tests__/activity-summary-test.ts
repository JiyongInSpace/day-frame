import type { ActivityRecord } from '@/db/records';
import { countRecordedActivities, formatActivityCountTitle } from '@/utils/activity-summary';

const createRecord = (id: number, activityLabel: string): ActivityRecord => ({
  id,
  intervalStart: id,
  intervalEnd: id + 1,
  respondedAt: id,
  updatedAt: id,
  activityKey: activityLabel,
  activityLabel,
  emoji: '•',
  note: null,
  status: 'recorded',
  source: 'quick',
});

describe('activity summary', () => {
  it('counts distinct recorded activities instead of choosing a dominant one', () => {
    expect(
      countRecordedActivities([
        createRecord(1, '일'),
        createRecord(2, '일'),
        createRecord(3, '식사'),
      ]),
    ).toBe(2);
  });

  it('describes the number of activities without interpreting the day', () => {
    expect(formatActivityCountTitle(3)).toBe('오늘 3가지 활동을\n기록했어요');
  });
});
