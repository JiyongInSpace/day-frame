import { StyleSheet, Text, View } from 'react-native';

import type { ActivityRecord } from '@/db/records';
import { colors } from '@/theme/colors';
import { countRecordedActivities, formatActivityCountTitle } from '@/utils/activity-summary';
import { formatHourRange, formatKoreanDate, getHourlySlots } from '@/utils/time';

type ShareCardProps = {
  records: ActivityRecord[];
  date?: Date;
  showNotes?: boolean;
  showTimes?: boolean;
};

export function ShareCard({
  records,
  date = new Date(),
  showNotes = false,
  showTimes = false,
}: ShareCardProps) {
  const recorded = records.filter((record) => record.status === 'recorded');
  const activityCount = countRecordedActivities(records);
  const totalSlots = getHourlySlots(date).length;
  const unansweredCount = Math.max(0, totalSlots - records.length);
  const visible = [...records].reverse().slice(0, 5);
  const hiddenCount = Math.max(0, records.length - visible.length);

  return (
    <View style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.headerRow}>
        <Text style={styles.brand}>하루프레임</Text>
        <Text style={styles.sparkle}>✦</Text>
      </View>

      <Text style={styles.date}>{formatKoreanDate(date)}</Text>
      <Text style={styles.title}>
        {recorded.length > 0
          ? formatActivityCountTitle(activityCount)
          : '비어 있는 순간까지\n오늘의 모양이에요'}
      </Text>

      <View style={styles.rule} />

      <View style={styles.moments}>
        {visible.length > 0 ? (
          visible.map((record) => (
            <View key={record.id} style={styles.momentRow}>
              <Text style={styles.emoji}>{record.emoji ?? '—'}</Text>
              <View style={styles.momentCopy}>
                <View style={styles.labelRow}>
                  <Text numberOfLines={1} style={styles.label}>
                    {record.status === 'skipped' ? '쉬어간 시간' : record.activityLabel}
                  </Text>
                  {showTimes ? (
                    <Text style={styles.time}>
                      {formatHourRange(
                        new Date(record.intervalStart),
                        new Date(record.intervalEnd),
                      )}
                    </Text>
                  ) : null}
                </View>
                {showNotes && record.note ? (
                  <Text numberOfLines={1} style={styles.note}>
                    {record.note}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>아직 남긴 장면이 없어도 괜찮아요.</Text>
        )}
        {hiddenCount > 0 ? (
          <Text style={styles.more}>그리고 {hiddenCount}개의 장면</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.metricValue}>{recorded.length}</Text>
          <Text style={styles.metricLabel}>남긴 장면</Text>
        </View>
        <View style={styles.footerRule} />
        <View>
          <Text style={styles.metricValue}>{unansweredCount}</Text>
          <Text style={styles.metricLabel}>비어 있는 시간</Text>
        </View>
        <View style={styles.signature}>
          <Text style={styles.signatureMark}>◇</Text>
          <Text style={styles.signatureText}>하루프레임</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    backgroundColor: colors.night,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  glowOne: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#5A455B',
    opacity: 0.5,
  },
  glowTwo: {
    position: 'absolute',
    bottom: 80,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#4D454B',
    opacity: 0.45,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.apricot,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  sparkle: {
    color: colors.coral,
    fontSize: 26,
  },
  date: {
    marginTop: 32,
    color: '#C8C1CB',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    marginTop: 10,
    color: colors.white,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  rule: {
    width: 40,
    height: 3,
    marginVertical: 24,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  moments: {
    gap: 14,
  },
  momentRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emoji: {
    width: 32,
    fontSize: 18,
  },
  momentCopy: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    color: '#F6F1F7',
    fontSize: 14,
    fontWeight: '700',
  },
  time: {
    marginLeft: 8,
    color: '#AFA7B3',
    fontSize: 9,
  },
  note: {
    marginTop: 3,
    color: '#BDB5C0',
    fontSize: 10,
  },
  empty: {
    color: '#C8C1CB',
    fontSize: 15,
    lineHeight: 24,
  },
  more: {
    marginLeft: 32,
    color: '#AFA7B3',
    fontSize: 10,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRule: {
    width: 1,
    height: 32,
    marginHorizontal: 18,
    backgroundColor: '#58515E',
  },
  metricValue: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 2,
    color: '#AFA7B3',
    fontSize: 10,
  },
  signature: {
    marginLeft: 'auto',
    alignItems: 'center',
  },
  signatureMark: {
    color: colors.coral,
    fontSize: 25,
  },
  signatureText: {
    color: colors.white,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
