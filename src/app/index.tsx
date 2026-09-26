import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { hasCompletedOnboarding } from '@/db/settings';
import { colors } from '@/theme/colors';

export default function EntryScreen() {
  const db = useSQLiteContext();

  useEffect(() => {
    async function routeFromSavedState() {
      const completed = await hasCompletedOnboarding(db);
      if (completed) {
        router.replace('/(tabs)');
      } else {
        router.replace('./onboarding');
      }
    }
    void routeFromSavedState();
  }, [db]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.coral} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
