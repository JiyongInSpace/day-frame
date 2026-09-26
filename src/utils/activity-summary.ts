import type { ActivityRecord } from '@/db/records';

export function countRecordedActivities(records: ActivityRecord[]) {
  return new Set(
    records
      .filter((record) => record.status === 'recorded' && record.activityLabel)
      .map((record) => record.activityLabel),
  ).size;
}

export function formatActivityCountTitle(activityCount: number) {
  return `오늘 ${activityCount}가지 활동을\n기록했어요`;
}
