import { useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { ShareCard } from '@/components/ShareCard';
import { useDayRecords } from '@/hooks/useDayRecords';
import { colors } from '@/theme/colors';
import { parseDayKey } from '@/utils/time';

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggle, value && styles.toggleSelected]}
    >
      <Text style={[styles.toggleText, value && styles.toggleTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function ShareScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = parseDayKey(typeof dateParam === 'string' ? dateParam : '') ?? new Date();
  const { records, loading } = useDayRecords(selectedDate);
  const cardRef = useRef<View>(null);
  const [showTimes, setShowTimes] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [busyAction, setBusyAction] = useState<'save' | 'share' | null>(null);
  const visibleRecords = useMemo(
    () => records.filter((record) => !excludedIds.has(record.id)),
    [excludedIds, records],
  );

  const toggleRecord = (id: number) => {
    setExcludedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const captureCard = async () => {
    if (!cardRef.current) {
      throw new Error('카드가 아직 준비되지 않았어요.');
    }
    return captureRef(cardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  };

  const saveCard = async () => {
    setBusyAction('save');
    try {
      const permission = await requestPermissionsAsync(true, ['photo']);
      if (!permission.granted) {
        Alert.alert('사진 권한이 필요해요', '카드를 갤러리에 저장하려면 사진 추가를 허용해 주세요.');
        return;
      }
      const uri = await captureCard();
      await Asset.create(uri);
      Alert.alert('저장했어요', 'DayFrame 카드를 사진 앱에 저장했어요.');
    } catch {
      Alert.alert('저장하지 못했어요', '잠시 뒤 다시 시도해 주세요.');
    } finally {
      setBusyAction(null);
    }
  };

  const shareCard = async () => {
    setBusyAction('share');
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('공유할 수 없어요', '이 기기에서는 시스템 공유 기능을 사용할 수 없어요.');
        return;
      }
      const uri = await captureCard();
      await Sharing.shareAsync(uri, {
        dialogTitle: 'DayFrame 카드 공유',
        mimeType: 'image/png',
      });
    } catch {
      Alert.alert('공유하지 못했어요', '잠시 뒤 다시 시도해 주세요.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.heading}>공유할 장면 고르기</Text>
            <Text style={styles.description}>시간과 메모는 기본으로 숨겨져 있어요.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.coral} />
          </View>
        ) : (
          <View ref={cardRef} collapsable={false} style={styles.cardFrame}>
            <ShareCard
              date={selectedDate}
              records={visibleRecords}
              showNotes={showNotes}
              showTimes={showTimes}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카드에 표시</Text>
          <View style={styles.toggleRow}>
            <Toggle label="시간" value={showTimes} onChange={setShowTimes} />
            <Toggle label="메모" value={showNotes} onChange={setShowNotes} />
          </View>
        </View>

        {records.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>포함할 장면</Text>
            <View style={styles.recordList}>
              {[...records].reverse().map((record) => {
                const included = !excludedIds.has(record.id);
                return (
                  <Pressable
                    accessibilityLabel={`${
                      record.status === 'skipped' ? '쉬어간 시간' : record.activityLabel
                    }, 공유 카드에 ${included ? '포함됨' : '제외됨'}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: included }}
                    key={record.id}
                    onPress={() => toggleRecord(record.id)}
                    style={styles.recordRow}
                  >
                    <Text style={styles.recordEmoji}>{record.emoji ?? '—'}</Text>
                    <Text numberOfLines={1} style={styles.recordLabel}>
                      {record.status === 'skipped' ? '쉬어간 시간' : record.activityLabel}
                    </Text>
                    <View style={[styles.checkbox, included && styles.checkboxSelected]}>
                      <Text style={styles.checkmark}>{included ? '✓' : ''}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={loading || busyAction !== null}
            onPress={saveCard}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>
              {busyAction === 'save' ? '저장 중…' : '사진으로 저장'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={loading || busyAction !== null}
            onPress={shareCard}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>
              {busyAction === 'share' ? '준비 중…' : '공유하기'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  topRow: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heading: { color: colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -0.7 },
  description: { marginTop: 5, color: colors.muted, fontSize: 13 },
  closeButton: { paddingVertical: 7, paddingLeft: 14 },
  closeText: { color: colors.coral, fontSize: 15, fontWeight: '800' },
  loading: {
    aspectRatio: 9 / 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  cardFrame: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.night,
    shadowColor: '#201B25',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  section: { marginTop: 26 },
  sectionTitle: { marginBottom: 12, color: colors.ink, fontSize: 15, fontWeight: '800' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggle: {
    minWidth: 76,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  toggleSelected: { borderColor: colors.coral, backgroundColor: colors.coralSoft },
  toggleText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  toggleTextSelected: { color: colors.coral },
  recordList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  recordRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  recordEmoji: { width: 34, fontSize: 18 },
  recordLabel: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '600' },
  checkbox: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
  },
  checkboxSelected: { borderColor: colors.coral, backgroundColor: colors.coral },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '900' },
  actions: { marginTop: 28, flexDirection: 'row', gap: 10 },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: { color: colors.coral, fontSize: 15, fontWeight: '900' },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: colors.coral,
  },
  primaryButtonText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.72 },
});
