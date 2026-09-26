export const DAY_START_HOUR = 4;

export type TimeRange = {
  start: Date;
  end: Date;
};

export function startOfHour(date: Date) {
  const value = new Date(date);
  value.setMinutes(0, 0, 0);
  return value;
}

export function getLastCompletedHour(now = new Date()): TimeRange {
  const end = startOfHour(now);
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  return { start, end };
}

export function getDayBounds(now = new Date()): TimeRange {
  const start = new Date(now);
  start.setHours(DAY_START_HOUR, 0, 0, 0);

  if (now.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 1);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function getHourlySlots(now = new Date()): TimeRange[] {
  const { start, end: dayEnd } = getDayBounds(now);
  const completedUntil = startOfHour(now);
  const end = new Date(Math.min(dayEnd.getTime(), completedUntil.getTime()));
  const slots: TimeRange[] = [];

  for (
    let cursor = new Date(start);
    cursor.getTime() < end.getTime();
    cursor = new Date(cursor.getTime() + 60 * 60 * 1000)
  ) {
    slots.push({
      start: cursor,
      end: new Date(cursor.getTime() + 60 * 60 * 1000),
    });
  }

  return slots;
}

export function formatHourRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${formatter.format(start)}–${formatter.format(end)}`;
}

export function formatKoreanDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}
