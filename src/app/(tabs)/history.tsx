import { useMemo } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ActivityRecord } from '@/db/records';
import { useAllRecords } from '@/hooks/useAllRecords';
import { colors } from '@/theme/colors';
import { formatKoreanDate, getDayKey, parseDayKey } from '@/utils/time';

type DayGroup = { key: string; date: Date; records: ActivityRecord[] };

function getDayGroups(records: ActivityRecord[]) {
  const grouped = new Map<string, ActivityRecord[]>();
  records.forEach((record) => {
    const key = getDayKey(new Date(record.intervalStart));
    grouped.set(key, [...(grouped.get(key) ?? []), record]);
  });

  return [...grouped.entries()]
    .map(([key, dayRecords]) => ({ key, date: parseDayKey(key)!, records: dayRecords }))
    .sort((a, b) => b.date.getTime() - a.date.getTime()) as DayGroup[];
}

function getDayMood(records: ActivityRecord[]) {
  return records.find((record) => record.status === 'recorded')?.emoji ?? '☾';
}

export default function HistoryScreen() {
  const { records, loading } = useAllRecords();
  const groups = useMemo(() => getDayGroups(records), [records]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>지난 프레임</Text>
        <Text style={styles.title}>쌓여 온 하루들</Text>
        <Text style={styles.description}>기록한 날을 눌러 카드와 시간표를 다시 볼 수 있어.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.coral} />
        ) : groups.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>◇</Text>
            <Text style={styles.emptyTitle}>첫 번째 하루를 기다리는 중</Text>
            <Text style={styles.emptyBody}>오늘 기록을 남기면 여기에 차곡차곡 모여.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {groups.map((group) => {
              const recordedCount = group.records.filter((record) => record.status === 'recorded').length;
              const skippedCount = group.records.length - recordedCount;
              return (
                <Pressable
                  accessibilityLabel={`${formatKoreanDate(group.date)}, ${recordedCount}개 장면`}
                  accessibilityRole="button"
                  key={group.key}
                  onPress={() => router.push({ pathname: '/day/[date]', params: { date: group.key } })}
                  style={({ pressed }) => [styles.dayRow, pressed && styles.pressed]}
                >
                  <View style={styles.moodCircle}>
                    <Text style={styles.mood}>{getDayMood(group.records)}</Text>
                  </View>
                  <View style={styles.dayCopy}>
                    <Text style={styles.dayDate}>{formatKoreanDate(group.date)}</Text>
                    <Text style={styles.dayMeta}>
                      {recordedCount}개 장면{skippedCount > 0 ? ` · ${skippedCount}번 쉬어감` : ''}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              );
            })}
          </View>
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
  description: { marginTop: 9, color: colors.muted, fontSize: 13, lineHeight: 20 },
  loader: { marginTop: 80 },
  emptyCard: { marginTop: 48, padding: 30, alignItems: 'center', borderRadius: 24, backgroundColor: colors.surface },
  emptyEmoji: { color: colors.coral, fontSize: 38 },
  emptyTitle: { marginTop: 14, color: colors.ink, fontSize: 17, fontWeight: '800' },
  emptyBody: { marginTop: 7, color: colors.muted, fontSize: 13, textAlign: 'center' },
  list: { marginTop: 28, gap: 12 },
  dayRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.65 },
  moodCircle: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: colors.coralSoft },
  mood: { fontSize: 23 },
  dayCopy: { flex: 1, marginLeft: 14 },
  dayDate: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  dayMeta: { marginTop: 5, color: colors.muted, fontSize: 12 },
  chevron: { color: colors.muted, fontSize: 28, fontWeight: '300' },
});
