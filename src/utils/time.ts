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

export function getDayKey(date = new Date()) {
  const { start } = getDayBounds(date);
  const year = start.getFullYear();
  const month = String(start.getMonth() + 1).padStart(2, '0');
  const day = String(start.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDayKey(dayKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return Number.isNaN(date.getTime()) || getDayKey(date) !== dayKey ? null : date;
}

export function getHourlySlots(date = new Date(), clock = new Date()): TimeRange[] {
  const { start, end: dayEnd } = getDayBounds(date);
  const completedUntil = startOfHour(clock);
  const endTime = Math.max(
    start.getTime(),
    Math.min(dayEnd.getTime(), completedUntil.getTime()),
  );
  const end = new Date(endTime);
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
