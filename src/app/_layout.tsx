import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { migrateDatabase } from '@/db/records';
import { colors } from '@/theme/colors';

export default function RootLayout() {
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="record"
          options={{
            presentation: 'modal',
            title: '지난 한 시간',
          }}
        />
      </Stack>
    </SQLiteProvider>
  );
}
