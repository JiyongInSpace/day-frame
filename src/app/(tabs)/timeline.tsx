import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayTimeline } from '@/components/DayTimeline';
import { useDayRecords } from '@/hooks/useDayRecords';
import { colors } from '@/theme/colors';
import { formatKoreanDate } from '@/utils/time';

export default function TimelineScreen() {
  const now = new Date();
  const { records, loading } = useDayRecords(now);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>오늘의 일정표</Text>
        <Text style={styles.title}>시간의 결을 따라가 봐</Text>
        <Text style={styles.date}>{formatKoreanDate(now)}</Text>
        <Text style={styles.guide}>비어 있거나 고치고 싶은 시간을 눌러 줘.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.coral} />
        ) : (
          <DayTimeline date={now} records={records} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 40 },
  eyebrow: { color: colors.coral, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  title: { marginTop: 7, color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.8 },
  date: { marginTop: 7, color: colors.muted, fontSize: 14 },
  guide: { marginTop: 13, color: colors.muted, fontSize: 12 },
  loader: { marginTop: 80 },
});
