import { StyleSheet, Text, View } from 'react-native';

import type { ActivityRecord } from '@/db/records';
import { colors } from '@/theme/colors';
import { countRecordedActivities, formatActivityCountTitle } from '@/utils/activity-summary';
import {
  formatGroupDuration,
  getActivityColor,
  groupConsecutiveRecords,
} from '@/utils/day-card';
import { formatKoreanDate, getHourlySlots } from '@/utils/time';

type ShareCardProps = {
  records: ActivityRecord[];
  date?: Date;
  showNotes?: boolean;
  showTimes?: boolean;
};

export function ShareCard({
  records,
  date = new Date(),
  showNotes = true,
  showTimes = true,
}: ShareCardProps) {
  const recorded = records.filter((record) => record.status === 'recorded');
  const activityCount = countRecordedActivities(records);
  const totalSlots = getHourlySlots(date).length;
  const unansweredCount = Math.max(0, totalSlots - records.length);
  const groups = groupConsecutiveRecords(records);
  const sceneCount = groups.filter((group) => group.status === 'recorded').length;
  const visible = groups.length <= 6
    ? groups
    : Array.from({ length: 6 }, (_, index) =>
        groups[Math.round((index * (groups.length - 1)) / 5)],
      );
  const hiddenCount = Math.max(0, groups.length - visible.length);

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

      <View style={styles.schedule}>
        <View style={styles.scheduleHeader}>
          <Text style={[styles.columnHeading, styles.timeColumn]}>시간</Text>
          <Text style={[styles.columnHeading, styles.activityColumn]}>활동</Text>
          <Text style={[styles.columnHeading, styles.detailColumn]}>기록</Text>
        </View>
        {visible.length > 0 ? (
          visible.map((group, index) => {
            const activityColor = getActivityColor(group.records[0]) ?? '#77717D';
            return (
              <View
                key={group.id}
                style={[styles.scheduleRow, index > 0 && styles.scheduleRowBorder]}
              >
                <View style={[styles.rowAccent, { backgroundColor: activityColor }]} />
                <View style={styles.timeColumn}>
                  {showTimes ? (
                    <>
                      <Text numberOfLines={1} style={styles.timePrimary}>
                        {formatCardHour(new Date(group.intervalStart))}
                      </Text>
                      <Text numberOfLines={1} style={styles.timeSecondary}>
                        – {formatCardHour(new Date(group.intervalEnd), true)}
                      </Text>
                    </>
                  ) : null}
                </View>
                <View style={styles.activityColumn}>
                  <Text style={styles.emoji}>{group.emoji ?? '—'}</Text>
                  <Text numberOfLines={1} style={styles.label}>
                    {group.status === 'skipped' ? '쉬어감' : group.activityLabel}
                  </Text>
                  <Text style={[styles.duration, { color: activityColor }]}>
                    {formatGroupDuration(group)}
                  </Text>
                </View>
                <View style={styles.detailColumn}>
                  {showNotes && group.notes.length > 0 ? (
                    <Text numberOfLines={2} style={styles.note}>
                      {group.notes.slice(0, 2).join('\n')}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyRow}>
            <Text style={styles.empty}>아직 남긴 기록이 없어요.</Text>
          </View>
        )}
        {hiddenCount > 0 ? (
          <View style={styles.moreRow}>
            <Text style={styles.more}>외 {hiddenCount}개의 활동</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.metricValue}>{sceneCount}</Text>
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

function formatCardHour(date: Date, omitPeriod = false) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;
  const time = minute === 0 ? `${hour12}시` : `${hour12}:${String(minute).padStart(2, '0')}`;
  return omitPeriod ? time : `${period} ${time}`;
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
    marginTop: 24,
    color: '#C8C1CB',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 33,
    letterSpacing: -0.8,
  },
  schedule: {
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#57515D',
    borderRadius: 18,
    backgroundColor: '#3E3945',
  },
  scheduleHeader: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#2B2731',
  },
  columnHeading: {
    color: '#99919D',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scheduleRow: {
    position: 'relative',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scheduleRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#5A5460',
  },
  rowAccent: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 0,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  timeColumn: { width: 64 },
  activityColumn: { width: 82 },
  detailColumn: { flex: 1 },
  timePrimary: {
    color: '#F1EBF2',
    fontSize: 9,
    fontWeight: '800',
  },
  timeSecondary: {
    marginTop: 3,
    color: '#AFA7B3',
    fontSize: 8,
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    marginTop: 2,
    color: '#F6F1F7',
    fontSize: 10,
    fontWeight: '900',
  },
  duration: {
    marginTop: 2,
    fontSize: 7,
    fontWeight: '800',
  },
  note: {
    color: '#D8D1DA',
    fontSize: 9,
    lineHeight: 14,
  },
  emptyRow: { minHeight: 80, alignItems: 'center', justifyContent: 'center' },
  empty: {
    color: '#C8C1CB',
    fontSize: 11,
  },
  moreRow: {
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#5A5460',
  },
  more: {
    color: '#AFA7B3',
    fontSize: 8,
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
