import {
  getDayBounds,
  getDayKey,
  getHourlySlots,
  getLastCompletedHour,
  parseDayKey,
} from '@/utils/time';

describe('하루프레임 day boundaries', () => {
  test('03:59 belongs to the previous 하루프레임 day', () => {
    const beforeBoundary = new Date(2026, 8, 26, 3, 59);
    const bounds = getDayBounds(beforeBoundary);

    expect(bounds.start).toEqual(new Date(2026, 8, 25, 4));
    expect(bounds.end).toEqual(new Date(2026, 8, 26, 4));
    expect(getDayKey(beforeBoundary)).toBe('2026-09-25');
  });

  test('04:00 starts a new 하루프레임 day', () => {
    const boundary = new Date(2026, 8, 26, 4);

    expect(getDayBounds(boundary).start).toEqual(boundary);
    expect(getDayKey(boundary)).toBe('2026-09-26');
  });

  test('a past day exposes every completed hourly slot', () => {
    const selectedDate = new Date(2026, 8, 24, 12);
    const clock = new Date(2026, 8, 26, 12, 34);
    const slots = getHourlySlots(selectedDate, clock);

    expect(slots).toHaveLength(24);
    expect(slots[0].start).toEqual(new Date(2026, 8, 24, 4));
    expect(slots[23].end).toEqual(new Date(2026, 8, 25, 4));
  });

  test('the current day only includes completed hours', () => {
    const clock = new Date(2026, 8, 26, 10, 45);
    const slots = getHourlySlots(clock, clock);

    expect(slots).toHaveLength(6);
    expect(getLastCompletedHour(clock)).toEqual({
      start: new Date(2026, 8, 26, 9),
      end: new Date(2026, 8, 26, 10),
    });
  });

  test('day keys reject impossible and malformed dates', () => {
    expect(parseDayKey('2026-02-30')).toBeNull();
    expect(parseDayKey('not-a-date')).toBeNull();
    expect(getDayKey(parseDayKey('2026-09-26')!)).toBe('2026-09-26');
  });
});
