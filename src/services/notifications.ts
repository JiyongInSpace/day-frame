import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { ReminderPreferences } from '@/db/settings';
import { getDailyReminderTimes } from '@/utils/reminders';

export { getDailyReminderTimes } from '@/utils/reminders';

export const REMINDER_CHANNEL_ID = 'activity-reminders';
export const REMINDER_TYPE = 'hourly-activity-check-in';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: '활동 기록 알림',
    description: '지난 한 시간을 짧게 돌아보는 알림',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: '#EB806D',
  });
}

async function getReminderRequests() {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  return requests.filter(
    (request) => request.content.data?.type === REMINDER_TYPE,
  );
}

async function cancelReminderRequests() {
  const requests = await getReminderRequests();
  await Promise.all(
    requests.map((request) =>
      Notifications.cancelScheduledNotificationAsync(request.identifier),
    ),
  );
}

export async function getReminderState() {
  const [permission, requests] = await Promise.all([
    Notifications.getPermissionsAsync(),
    getReminderRequests(),
  ]);

  return {
    enabled: permission.granted && requests.length > 0,
    permissionStatus: permission.status,
    scheduledCount: requests.length,
  };
}

export async function enableReminders(preferences: ReminderPreferences) {
  await ensureAndroidChannel();

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.granted
    ? currentPermission
    : await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    return { enabled: false, permissionStatus: permission.status, scheduledCount: 0 };
  }

  await cancelReminderRequests();

  for (const time of getDailyReminderTimes(preferences)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '지난 한 시간, 뭐 했어요?',
        body: '가장 오래 한 활동 하나만 가볍게 남겨 봐요.',
        data: { type: REMINDER_TYPE, url: '/record' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }

  return getReminderState();
}

export async function disableHourlyReminders() {
  await cancelReminderRequests();
  return getReminderState();
}

export async function scheduleTestReminder() {
  await ensureAndroidChannel();

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '하루프레임 알림 테스트 ✦',
      body: '알림이 잘 도착했어요. 지난 한 시간을 기록해 볼까요?',
      data: { type: 'test-reminder', url: '/record' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  return true;
}
