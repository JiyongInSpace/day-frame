import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  deleteRecord,
  getLatestRecordedActivity,
  getRecordByIntervalStart,
  saveRecord,
  type RecordSource,
} from '@/db/records';
import { colors } from '@/theme/colors';
import { formatHourRange, getLastCompletedHour, startOfHour } from '@/utils/time';

type ActivityOption = { key: string; label: string; emoji: string };

const activities: ActivityOption[] = [
  { key: 'work', label: '일', emoji: '💻' },
  { key: 'study', label: '공부', emoji: '📚' },
  { key: 'meal', label: '식사', emoji: '🍚' },
  { key: 'travel', label: '이동', emoji: '🚇' },
  { key: 'rest', label: '휴식', emoji: '🫧' },
  { key: 'exercise', label: '운동', emoji: '🏃' },
  { key: 'housework', label: '집안일', emoji: '🧺' },
  { key: 'hobby', label: '취미', emoji: '🎧' },
];

export default function RecordScreen() {
  const db = useSQLiteContext();
  const { start } = useLocalSearchParams<{ start?: string }>();
  const interval = useMemo(() => {
    const requestedStart = Number(start);
    if (Number.isFinite(requestedStart) && requestedStart > 0) {
      const normalizedStart = startOfHour(new Date(requestedStart));
      return {
        start: normalizedStart,
        end: new Date(normalizedStart.getTime() + 60 * 60 * 1000),
      };
    }
    return getLastCompletedHour();
  }, [start]);
  const intervalStart = interval.start.getTime();
  const [note, setNote] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityOption | null>(null);
  const [selectedSource, setSelectedSource] = useState<RecordSource>('quick');
  const [existingRecordId, setExistingRecordId] = useState<number | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadExistingRecord() {
      setLoadingRecord(true);
      const record = await getRecordByIntervalStart(db, intervalStart);
      if (!active) {
        return;
      }

      setExistingRecordId(record?.id ?? null);
      setNote(record?.note ?? '');
      setSelectedSource(record?.source ?? 'quick');

      if (record?.status === 'recorded' && record.activityKey && record.activityLabel) {
        setSelectedActivity({
          key: record.activityKey,
          label: record.activityLabel,
          emoji: record.emoji ?? '✏️',
        });
        setCustomActivity(record.activityKey.startsWith('custom:') ? record.activityLabel : '');
      } else {
        setSelectedActivity(null);
        setCustomActivity('');
      }
      setLoadingRecord(false);
    }

    void loadExistingRecord();
    return () => {
      active = false;
    };
  }, [db, intervalStart]);

  const persist = async (
    activity: ActivityOption | null,
    source: 'quick' | 'custom' | 'continued' | 'skip',
  ) => {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await saveRecord(db, {
        intervalStart,
        intervalEnd: interval.end.getTime(),
        activityKey: activity?.key ?? null,
        activityLabel: activity?.label ?? null,
        emoji: activity?.emoji ?? null,
        note: note.trim() || null,
        status: source === 'skip' ? 'skipped' : 'recorded',
        source,
      });
      router.back();
    } catch {
      Alert.alert('기록하지 못했어', '잠시 후 다시 시도해 줘.');
      setSaving(false);
    }
  };

  const continuePrevious = async () => {
    const previous = await getLatestRecordedActivity(db);
    if (!previous?.activityKey || !previous.activityLabel || !previous.emoji) {
      Alert.alert('이어갈 기록이 없어', '먼저 활동을 하나 남겨 줘.');
      return;
    }
    setSelectedActivity({
      key: previous.activityKey,
      label: previous.activityLabel,
      emoji: previous.emoji,
    });
    setSelectedSource('continued');
  };

  const selectCustom = () => {
    const label = customActivity.trim();
    if (!label) {
      Alert.alert('활동을 적어 줘', '지난 한 시간을 한마디로 남겨 볼까?');
      return;
    }
    setSelectedActivity({ key: `custom:${label}`, label, emoji: '✏️' });
    setSelectedSource('custom');
  };

  const removeRecord = () => {
    Alert.alert('이 기록을 삭제할까?', '삭제하면 이 시간은 다시 미기록으로 표시돼.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteRecord(db, intervalStart);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.time}>{formatHourRange(interval.start, interval.end)}</Text>
          <Text style={styles.title}>
            {existingRecordId ? '이 시간의 기록을\n고쳐볼까?' : '지난 한 시간,\n주로 뭐 했어?'}
          </Text>
          <Text style={styles.description}>
            정확하지 않아도 괜찮아. 가장 오래 한 활동 하나만 골라 줘.
          </Text>

          <View pointerEvents={loadingRecord ? 'none' : 'auto'} style={styles.activityGrid}>
            {activities.map((activity) => (
              <Pressable
                accessibilityState={{ selected: selectedActivity?.key === activity.key }}
                accessibilityRole="button"
                disabled={saving || loadingRecord}
                key={activity.key}
                onPress={() => {
                  setSelectedActivity(activity);
                  setSelectedSource('quick');
                }}
                style={({ pressed }) => [
                  styles.activity,
                  selectedActivity?.key === activity.key && styles.activitySelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text style={styles.activityLabel}>{activity.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saving || loadingRecord}
            onPress={() => void continuePrevious()}
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text style={styles.continueIcon}>↻</Text>
            <Text style={styles.continueText}>아까 하던 거 계속</Text>
          </Pressable>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>다른 활동</Text>
            <View style={styles.customRow}>
              <TextInput
                maxLength={24}
                onChangeText={setCustomActivity}
                placeholder="직접 입력"
                placeholderTextColor="#A69D94"
                style={styles.customInput}
                value={customActivity}
              />
              <Pressable
                accessibilityRole="button"
                disabled={saving || loadingRecord}
                onPress={selectCustom}
                style={({ pressed }) => [styles.customSave, pressed && styles.pressed]}
              >
                <Text style={styles.customSaveText}>선택</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>짧은 메모 · 선택</Text>
            <TextInput
              maxLength={120}
              multiline
              onChangeText={setNote}
              placeholder="기억하고 싶은 장면이 있었어?"
              placeholderTextColor="#A69D94"
              style={styles.noteInput}
              textAlignVertical="top"
              value={note}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saving || loadingRecord || !selectedActivity}
            onPress={() => void persist(selectedActivity, selectedSource)}
            style={({ pressed }) => [
              styles.saveButton,
              !selectedActivity && styles.saveButtonDisabled,
              pressed && selectedActivity && styles.pressed,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {selectedActivity
                ? `${selectedActivity.emoji} ${selectedActivity.label} · 이대로 기록`
                : '활동을 먼저 골라 줘'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={saving || loadingRecord}
            onPress={() => void persist(null, 'skip')}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          >
            <Text style={styles.skipText}>이번 시간은 건너뛰기</Text>
          </Pressable>

          {existingRecordId ? (
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={removeRecord}
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            >
              <Text style={styles.deleteText}>이 시간의 기록 삭제</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 44,
  },
  time: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    color: colors.coral,
    backgroundColor: colors.coralSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    marginTop: 18,
    color: colors.ink,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 41,
    letterSpacing: -1,
  },
  description: {
    marginTop: 9,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  activityGrid: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activity: {
    width: '47.8%',
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  activitySelected: {
    borderColor: colors.coral,
    backgroundColor: colors.coralSoft,
  },
  activityEmoji: {
    fontSize: 23,
  },
  activityLabel: {
    marginLeft: 10,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.99 }],
  },
  continueButton: {
    marginTop: 11,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: colors.night,
  },
  continueIcon: {
    marginRight: 9,
    color: colors.apricot,
    fontSize: 20,
    fontWeight: '800',
  },
  continueText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  inputSection: {
    marginTop: 24,
  },
  inputLabel: {
    marginBottom: 9,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  customRow: {
    flexDirection: 'row',
    gap: 9,
  },
  customInput: {
    height: 50,
    flex: 1,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  customSave: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.coral,
  },
  customSaveText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  noteInput: {
    minHeight: 90,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 14,
    lineHeight: 21,
  },
  saveButton: {
    marginTop: 22,
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.coral,
  },
  saveButtonDisabled: {
    backgroundColor: '#CFC6BD',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  skipButton: {
    marginTop: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: {
    color: '#B85C52',
    fontSize: 13,
    fontWeight: '800',
  },
});
