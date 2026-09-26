import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActivityRecord } from '@/db/records';
import { colors } from '@/theme/colors';
import { countRecordedActivities, formatActivityCountTitle } from '@/utils/activity-summary';
import { getActivityColor, getDayClockRecords, pickSceneRecords } from '@/utils/day-card';
import { formatHourRange, formatKoreanDate, getHourlySlots } from '@/utils/time';

type DayCardProps = {
  records: ActivityRecord[];
  now?: Date;
};

export function DayCard({ records, now = new Date() }: DayCardProps) {
  const [selectedTab, setSelectedTab] = useState<'clock' | 'scenes'>('clock');
  const recorded = records.filter((record) => record.status === 'recorded');
  const activityCount = countRecordedActivities(records);
  const totalSlots = getHourlySlots(now).length;
  const unansweredCount = Math.max(0, totalSlots - records.length);
  const clockRecords = getDayClockRecords(records);
  const scenes = pickSceneRecords(records);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>TODAY, IN A FRAME</Text>
        <Text style={styles.sparkle}>✦</Text>
      </View>

      <Text style={styles.date}>{formatKoreanDate(now)}</Text>
      <Text numberOfLines={2} style={styles.title}>
        {recorded.length > 0
          ? formatActivityCountTitle(activityCount)
          : '아직 비어 있는 오늘도\n천천히 채워질 거예요'}
      </Text>

      <View accessibilityRole="tablist" style={styles.tabs}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'clock' }}
          onPress={() => setSelectedTab('clock')}
          style={[styles.tab, selectedTab === 'clock' && styles.selectedTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'clock' && styles.selectedTabText]}>
            24시간 시계
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'scenes' }}
          onPress={() => setSelectedTab('scenes')}
          style={[styles.tab, selectedTab === 'scenes' && styles.selectedTab]}
        >
          <Text style={[styles.tabText, selectedTab === 'scenes' && styles.selectedTabText]}>
            오늘의 장면
          </Text>
        </Pressable>
      </View>

      {selectedTab === 'clock' ? (
        <View style={styles.clockPanel}>
          <View style={styles.clock}>
            {clockRecords.map(({ hour, record }) => {
              const angle = hour * 15;
              const radians = ((angle - 90) * Math.PI) / 180;
              const radius = 100;
              const activityColor = getActivityColor(record);
              return (
                <View
                  key={hour}
                  style={[
                    styles.hourTick,
                    {
                      left: 116 + Math.cos(radians) * radius - 4,
                      top: 116 + Math.sin(radians) * radius - 9,
                      backgroundColor: activityColor ?? '#5B5661',
                      opacity: activityColor ? 1 : record?.status === 'skipped' ? 0.7 : 0.28,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
            <Text style={[styles.clockLabel, styles.clockLabel00]}>00</Text>
            <Text style={[styles.clockLabel, styles.clockLabel06]}>06</Text>
            <Text style={[styles.clockLabel, styles.clockLabel12]}>12</Text>
            <Text style={[styles.clockLabel, styles.clockLabel18]}>18</Text>
            <View style={styles.clockCenter}>
              <Text style={styles.clockValue}>{recorded.length}</Text>
              <Text style={styles.clockCaption}>남긴 장면</Text>
            </View>
          </View>
          <Text style={styles.clockGuide}>색이 있는 눈금만 오늘 남긴 기록이에요.</Text>
        </View>
      ) : (
        <View style={styles.scenePanel}>
          {scenes.length > 0 ? (
            <View style={styles.sceneGrid}>
              {scenes.map((record, index) => {
                const activityColor = getActivityColor(record) ?? colors.coral;
                return (
                  <View
                    key={record.id}
                    style={[
                      styles.sceneFrame,
                      index % 4 === 0 || index % 4 === 3
                        ? styles.sceneFrameWide
                        : styles.sceneFrameNarrow,
                      index % 2 === 1 && styles.sceneFrameRaised,
                    ]}
                  >
                    <View style={[styles.sceneAccent, { backgroundColor: activityColor }]} />
                    <View style={styles.sceneTopRow}>
                      <Text style={styles.sceneEmoji}>{record.emoji ?? '✦'}</Text>
                      <Text style={styles.sceneTime}>
                        {formatHourRange(
                          new Date(record.intervalStart),
                          new Date(record.intervalEnd),
                        )}
                      </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.sceneLabel}>
                      {record.note?.trim() || record.activityLabel}
                    </Text>
                    {record.note?.trim() ? (
                      <Text numberOfLines={1} style={styles.sceneActivity}>
                        {record.activityLabel}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyScene}>
              <Text style={styles.emptyText}>기록을 남기면 오늘의 장면이 여기에 모여요.</Text>
            </View>
          )}

          <View style={styles.flowSection}>
            <View style={styles.flowHeader}>
              <Text style={styles.flowTitle}>하루 흐름</Text>
              <Text style={styles.flowRange}>04 — 04</Text>
            </View>
            <View style={styles.flowBar}>
              {clockRecords.map(({ hour, record }) => {
                const activityColor = getActivityColor(record);
                return (
                  <View
                    key={hour}
                    style={[
                      styles.flowSegment,
                      activityColor
                        ? { backgroundColor: activityColor }
                        : record?.status === 'skipped'
                          ? styles.skippedSegment
                          : styles.emptySegment,
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.flowGuide}>비어 있는 칸은 아직 기록하지 않은 시간이에요.</Text>
          </View>
        </View>
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
    minHeight: 620,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: colors.night,
    padding: 24,
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
    marginTop: 20,
    color: '#C8C1CB',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  tabs: {
    alignSelf: 'flex-start',
    marginTop: 20,
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 18,
    backgroundColor: '#28242E',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  selectedTab: {
    backgroundColor: '#F3EDE5',
  },
  tabText: {
    color: '#99919D',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedTabText: {
    color: colors.night,
  },
  clockPanel: {
    alignItems: 'center',
    paddingTop: 12,
  },
  clock: {
    position: 'relative',
    width: 232,
    height: 232,
  },
  hourTick: {
    position: 'absolute',
    width: 8,
    height: 18,
    borderRadius: 4,
  },
  clockLabel: {
    position: 'absolute',
    color: '#8F8793',
    fontSize: 9,
    fontWeight: '700',
  },
  clockLabel00: { top: 25, left: 108 },
  clockLabel06: { top: 111, right: 25 },
  clockLabel12: { bottom: 25, left: 107 },
  clockLabel18: { top: 111, left: 25 },
  clockCenter: {
    position: 'absolute',
    top: 71,
    left: 71,
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#56505C',
    borderRadius: 45,
    backgroundColor: '#2B2731',
  },
  clockValue: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
  },
  clockCaption: {
    marginTop: 1,
    color: '#AFA7B3',
    fontSize: 10,
  },
  clockGuide: {
    marginTop: 3,
    color: '#AFA7B3',
    fontSize: 11,
  },
  scenePanel: {
    flex: 1,
    paddingTop: 18,
  },
  sceneGrid: {
    minHeight: 242,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  sceneFrame: {
    minHeight: 105,
    overflow: 'hidden',
    padding: 13,
    borderWidth: 1,
    borderColor: '#554F5A',
    borderRadius: 18,
    backgroundColor: '#403B47',
  },
  sceneFrameWide: { width: '58%' },
  sceneFrameNarrow: { width: '38%' },
  sceneFrameRaised: { transform: [{ translateY: 7 }] },
  sceneAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  sceneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sceneEmoji: { fontSize: 20 },
  sceneTime: { color: '#AFA7B3', fontSize: 8, fontWeight: '700' },
  sceneLabel: {
    marginTop: 12,
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  sceneActivity: {
    marginTop: 5,
    color: '#BDB5C0',
    fontSize: 10,
  },
  emptyScene: {
    minHeight: 242,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#554F5A',
    borderStyle: 'dashed',
    borderRadius: 20,
  },
  emptyText: {
    color: '#C8C1CB',
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },
  flowSection: { marginTop: 18 },
  flowHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowTitle: { color: colors.white, fontSize: 12, fontWeight: '800' },
  flowRange: { color: '#8F8793', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  flowBar: {
    height: 18,
    flexDirection: 'row',
    gap: 2,
  },
  flowSegment: {
    flex: 1,
    borderRadius: 2,
  },
  skippedSegment: { backgroundColor: '#6A6470', opacity: 0.55 },
  emptySegment: {
    borderWidth: 1,
    borderColor: '#5B5661',
    borderStyle: 'dotted',
    backgroundColor: 'transparent',
    opacity: 0.45,
  },
  flowGuide: {
    marginTop: 7,
    color: '#8F8793',
    fontSize: 9,
  },
  footerRow: {
    marginTop: 18,
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
