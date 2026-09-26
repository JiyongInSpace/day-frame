import type { ActivityRecord } from '@/db/records';
import { colors } from '@/theme/colors';
import { DAY_START_HOUR } from '@/utils/time';

const activityColors: Record<string, string> = {
  work: '#6F91B7',
  study: colors.lavender,
  meal: colors.apricot,
  travel: '#73B5B1',
  rest: colors.sage,
  exercise: colors.coral,
  housework: '#D39A68',
  hobby: '#A78DB7',
  custom: '#D58A91',
};

export function getActivityColor(record?: ActivityRecord) {
  if (!record || record.status === 'skipped') {
    return null;
  }

  const key = record.activityKey?.split(':')[0] ?? 'custom';
  return activityColors[key] ?? activityColors.custom;
}

export function pickSceneRecords(records: ActivityRecord[], maximum = 4) {
  const recorded = records
    .filter((record) => record.status === 'recorded')
    .sort((a, b) => a.intervalStart - b.intervalStart);

  if (recorded.length <= maximum) {
    return recorded;
  }

  return Array.from({ length: maximum }, (_, index) => {
    const recordIndex = Math.round((index * (recorded.length - 1)) / (maximum - 1));
    return recorded[recordIndex];
  });
}

export function getDayClockRecords(records: ActivityRecord[]) {
  const byHour = new Map(
    records.map((record) => [new Date(record.intervalStart).getHours(), record]),
  );

  return Array.from({ length: 24 }, (_, index) => {
    const hour = (DAY_START_HOUR + index) % 24;
    return { hour, record: byHour.get(hour) };
  });
}
