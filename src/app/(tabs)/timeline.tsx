import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDayRecords } from '@/hooks/useDayRecords';
import { colors } from '@/theme/colors';
import { formatHourRange, formatKoreanDate, getHourlySlots } from '@/utils/time';

export default function TimelineScreen() {
  const now = new Date();
  const { records, loading } = useDayRecords(now);
  const recordsByStart = new Map(records.map((record) => [record.intervalStart, record]));
  const slots = getHourlySlots(now).reverse();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>오늘의 일정표</Text>
        <Text style={styles.title}>시간의 결을 따라가 봐</Text>
        <Text style={styles.date}>{formatKoreanDate(now)}</Text>
        <Text style={styles.guide}>비어 있거나 고치고 싶은 시간을 눌러 줘.</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.coral} />
        ) : slots.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>☾</Text>
            <Text style={styles.emptyTitle}>아직 완성된 시간 구간이 없어</Text>
            <Text style={styles.emptyBody}>한 시간이 지나면 여기에 기록할 자리가 생겨.</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {slots.map((slot, index) => {
              const record = recordsByStart.get(slot.start.getTime());
              const isEmpty = !record;
              const isSkipped = record?.status === 'skipped';

              return (
                <View key={slot.start.toISOString()} style={styles.row}>
                  <View style={styles.rail}>
                    <View
                      style={[
                        styles.dot,
                        isEmpty && styles.dotEmpty,
                        isSkipped && styles.dotSkipped,
                      ]}
                    />
                    {index < slots.length - 1 && <View style={styles.line} />}
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.time}>{formatHourRange(slot.start, slot.end)}</Text>
                    <Pressable
                      accessibilityHint="이 시간의 활동을 기록하거나 수정해"
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: '/record',
                          params: { start: slot.start.getTime().toString() },
                        })
                      }
                      style={({ pressed }) => [
                        styles.entry,
                        isEmpty && styles.entryEmpty,
                        pressed && styles.entryPressed,
                      ]}
                    >
                      <Text style={styles.entryEmoji}>
                        {isEmpty ? '·' : isSkipped ? '—' : record.emoji}
                      </Text>
                      <View style={styles.entryCopy}>
                        <Text style={[styles.entryTitle, isEmpty && styles.entryTitleEmpty]}>
                          {isEmpty
                            ? '아직 기록하지 않았어'
                            : isSkipped
                              ? '이번 시간은 건너뛰었어'
                              : record.activityLabel}
                        </Text>
                        {record?.note ? (
                          <Text numberOfLines={2} style={styles.note}>
                            {record.note}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 40,
  },
  eyebrow: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 7,
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  date: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 14,
  },
  guide: {
    marginTop: 13,
    color: colors.muted,
    fontSize: 12,
  },
  loader: {
    marginTop: 80,
  },
  emptyCard: {
    marginTop: 48,
    padding: 30,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
  },
  timeline: {
    marginTop: 34,
  },
  row: {
    minHeight: 112,
    flexDirection: 'row',
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.coral,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.background,
  },
  dotSkipped: {
    backgroundColor: colors.lavender,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: colors.line,
  },
  rowContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 18,
  },
  time: {
    marginTop: -2,
    marginBottom: 8,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  entry: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  entryEmpty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  entryPressed: {
    opacity: 0.62,
  },
  entryEmoji: {
    width: 34,
    fontSize: 20,
  },
  entryCopy: {
    flex: 1,
  },
  entryTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  entryTitleEmpty: {
    color: colors.muted,
    fontWeight: '600',
  },
  note: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    marginLeft: 8,
    color: colors.muted,
    fontSize: 25,
    fontWeight: '300',
  },
});
