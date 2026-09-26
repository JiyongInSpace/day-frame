import { useEffect } from 'react';
import { router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { migrateDatabase } from '@/db/records';
import '@/services/notifications';
import { colors } from '@/theme/colors';

function useNotificationNavigation() {
  useEffect(() => {
    const openRecordScreen = (notification: Notifications.Notification) => {
      if (notification.request.content.data?.url === '/record') {
        router.push('/record');
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      openRecordScreen(lastResponse.notification);
      Notifications.clearLastNotificationResponse();
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openRecordScreen(response.notification);
    });

    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  useNotificationNavigation();

  return (
    <SQLiteProvider databaseName="day-frame.db" onInit={migrateDatabase}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.ink,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="record"
          options={{
            presentation: 'modal',
            title: '지난 한 시간',
          }}
        />
        <Stack.Screen name="share" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="day/[date]" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
