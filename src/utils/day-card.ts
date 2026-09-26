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

export type ActivityRecordGroup = {
  id: string;
  records: ActivityRecord[];
  intervalStart: number;
  intervalEnd: number;
  activityKey: string | null;
  activityLabel: string | null;
  emoji: string | null;
  status: ActivityRecord['status'];
  notes: string[];
};

export function getActivityColor(record?: ActivityRecord) {
  if (!record || record.status === 'skipped') {
    return null;
  }

  const key = record.activityKey?.split(':')[0] ?? 'custom';
  return activityColors[key] ?? activityColors.custom;
}

function hasSameActivity(previous: ActivityRecord, next: ActivityRecord) {
  if (previous.status !== next.status || previous.intervalEnd !== next.intervalStart) {
    return false;
  }

  if (previous.status === 'skipped') {
    return true;
  }

  return previous.activityKey === next.activityKey;
}

function makeGroup(records: ActivityRecord[]): ActivityRecordGroup {
  const first = records[0];
  const last = records[records.length - 1];
  const notes = records.reduce<string[]>((items, record) => {
    const note = record.note?.trim();
    if (note && !items.includes(note)) {
      items.push(note);
    }
    return items;
  }, []);

  return {
    id: `${first.id}-${last.id}`,
    records,
    intervalStart: first.intervalStart,
    intervalEnd: last.intervalEnd,
    activityKey: first.activityKey,
    activityLabel: first.activityLabel,
    emoji: first.emoji,
    status: first.status,
    notes,
  };
}

export function groupConsecutiveRecords(records: ActivityRecord[]) {
  const sorted = [...records].sort((a, b) => a.intervalStart - b.intervalStart);
  const groups: ActivityRecord[][] = [];

  sorted.forEach((record) => {
    const current = groups[groups.length - 1];
    const previous = current?.[current.length - 1];
    if (previous && hasSameActivity(previous, record)) {
      current.push(record);
    } else {
      groups.push([record]);
    }
  });

  return groups.map(makeGroup);
}

export function pickSceneGroups(records: ActivityRecord[], maximum = 4) {
  const recorded = groupConsecutiveRecords(records).filter(
    (group) => group.status === 'recorded',
  );

  if (recorded.length <= maximum) {
    return recorded;
  }

  return Array.from({ length: maximum }, (_, index) => {
    const recordIndex = Math.round((index * (recorded.length - 1)) / (maximum - 1));
    return recorded[recordIndex];
  });
}

export function formatGroupDuration(group: ActivityRecordGroup) {
  const hours = (group.intervalEnd - group.intervalStart) / (60 * 60 * 1000);
  return Number.isInteger(hours) ? `${hours}시간` : `${hours.toFixed(1)}시간`;
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
