import { getDailyReminderTimes } from '@/utils/reminders';

describe('reminder schedule', () => {
  test('builds an inclusive hourly schedule', () => {
    const times = getDailyReminderTimes({ startHour: 9, endHour: 12, intervalMinutes: 60 });

    expect(times).toEqual([
      { hour: 9, minute: 0 },
      { hour: 10, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 12, minute: 0 },
    ]);
  });

  test('supports half-hour intervals without passing the end hour', () => {
    const times = getDailyReminderTimes({ startHour: 21, endHour: 22, intervalMinutes: 30 });

    expect(times).toEqual([
      { hour: 21, minute: 0 },
      { hour: 21, minute: 30 },
      { hour: 22, minute: 0 },
    ]);
  });

  test('supports two-hour intervals', () => {
    expect(
      getDailyReminderTimes({ startHour: 9, endHour: 14, intervalMinutes: 120 }),
    ).toEqual([
      { hour: 9, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 13, minute: 0 },
    ]);
  });
});
