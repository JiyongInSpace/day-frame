import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { DayTimeline } from '@/components/DayTimeline';
import { useDayRecords } from '@/hooks/useDayRecords';
import { colors } from '@/theme/colors';
import { formatKoreanDate, parseDayKey } from '@/utils/time';

export default function DayDetailScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const dayKey = typeof dateParam === 'string' ? dateParam : '';
  const date = parseDayKey(dayKey);
  const { records, loading } = useDayRecords(date ?? new Date());

  if (!date) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.invalid}>
          <Text style={styles.invalidTitle}>이 날짜를 열 수 없어요.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text style={styles.backLink}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>지난 하루</Text>
            <Text style={styles.title}>{formatKoreanDate(date)}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.coral} />
        ) : (
          <>
            <DayCard now={date} records={records} />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/share', params: { date: dayKey } })}
              style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
            >
              <Text style={styles.shareText}>이날의 카드 저장 · 공유</Text>
            </Pressable>
            <Text style={styles.timelineTitle}>시간표</Text>
            <Text style={styles.timelineGuide}>기록을 눌러 내용을 고치거나 빈 시간을 채울 수 있어.</Text>
            <DayTimeline date={date} records={records} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  headerRow: { marginBottom: 22, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { color: colors.coral, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  title: { marginTop: 6, color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  closeButton: { paddingVertical: 7, paddingLeft: 14 },
  closeText: { color: colors.coral, fontSize: 15, fontWeight: '800' },
  loader: { marginTop: 80 },
  shareButton: { marginTop: 14, alignItems: 'center', paddingVertical: 14, borderRadius: 18, backgroundColor: colors.night },
  shareText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.68 },
  timelineTitle: { marginTop: 34, color: colors.ink, fontSize: 22, fontWeight: '900' },
  timelineGuide: { marginTop: 7, color: colors.muted, fontSize: 12 },
  invalid: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  invalidTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  backLink: { marginTop: 18, color: colors.coral, fontSize: 15, fontWeight: '800' },
});
