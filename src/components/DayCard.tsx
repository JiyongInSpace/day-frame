import { StyleSheet, Text, View } from 'react-native';

import type { ActivityRecord } from '@/db/records';
import { colors } from '@/theme/colors';
import { formatHourRange, formatKoreanDate, getHourlySlots } from '@/utils/time';

type DayCardProps = {
  records: ActivityRecord[];
  now?: Date;
};

function getDominantActivity(records: ActivityRecord[]) {
  const counts = new Map<string, { count: number; emoji: string }>();

  records
    .filter((record) => record.status === 'recorded' && record.activityLabel)
    .forEach((record) => {
      const label = record.activityLabel ?? '';
      const current = counts.get(label) ?? { count: 0, emoji: record.emoji ?? '•' };
      counts.set(label, { ...current, count: current.count + 1 });
    });

  return [...counts.entries()].sort((a, b) => b[1].count - a[1].count)[0] ?? null;
}

export function DayCard({ records, now = new Date() }: DayCardProps) {
  const recorded = records.filter((record) => record.status === 'recorded');
  const dominant = getDominantActivity(records);
  const totalSlots = getHourlySlots(now).length;
  const unansweredCount = Math.max(0, totalSlots - records.length);
  const recent = [...records].reverse().slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>TODAY, IN A FRAME</Text>
        <Text style={styles.sparkle}>✦</Text>
      </View>

      <Text style={styles.date}>{formatKoreanDate(now)}</Text>
      <Text style={styles.title}>
        {dominant
          ? `${dominant[1].emoji} ${dominant[0]}의 결이\n남은 하루였어요`
          : '아직 비어 있는 오늘도\n천천히 채워질 거예요'}
      </Text>

      <View style={styles.divider} />

      {recent.length > 0 ? (
        <View style={styles.moments}>
          {recent.map((record) => (
            <View key={record.id} style={styles.momentRow}>
              <Text style={styles.momentTime}>
                {formatHourRange(new Date(record.intervalStart), new Date(record.intervalEnd))}
              </Text>
              <Text style={styles.momentEmoji}>{record.emoji ?? '—'}</Text>
              <Text numberOfLines={1} style={styles.momentLabel}>
                {record.status === 'skipped' ? '이번 시간은 쉬어가기' : record.activityLabel}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          지난 한 시간을 남기면{`\n`}오늘의 장면이 여기 모여요.
        </Text>
      )}

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.metricValue}>{recorded.length}</Text>
          <Text style={styles.metricLabel}>남긴 장면</Text>
        </View>
        <View style={styles.footerRule} />
        <View>
          <Text style={styles.metricValue}>{unansweredCount}</Text>
          <Text style={styles.metricLabel}>비어 있는 시간</Text>
        </View>
        <View style={styles.dayMark}>
          <Text style={styles.dayMarkText}>DAY</Text>
          <Text style={styles.dayMarkNumber}>{now.getDate()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 510,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: colors.night,
    padding: 26,
    shadowColor: '#201B25',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: colors.apricot,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  sparkle: {
    color: colors.coral,
    fontSize: 25,
  },
  date: {
    marginTop: 28,
    color: '#C8C1CB',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    marginTop: 10,
    color: colors.white,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  divider: {
    width: 42,
    height: 3,
    marginVertical: 26,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  moments: {
    gap: 14,
  },
  momentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  momentTime: {
    width: 110,
    color: '#AFA7B3',
    fontSize: 12,
  },
  momentEmoji: {
    width: 30,
    fontSize: 18,
  },
  momentLabel: {
    flex: 1,
    color: '#F6F1F7',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: '#C8C1CB',
    fontSize: 16,
    lineHeight: 26,
  },
  footerRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRule: {
    width: 1,
    height: 34,
    marginHorizontal: 22,
    backgroundColor: '#58515E',
  },
  metricValue: {
    color: colors.white,
    fontSize: 23,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 2,
    color: '#AFA7B3',
    fontSize: 11,
  },
  dayMark: {
    marginLeft: 'auto',
    alignItems: 'center',
  },
  dayMarkText: {
    color: colors.coral,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  dayMarkNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '300',
  },
});
