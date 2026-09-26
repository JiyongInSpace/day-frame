import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { PermissionStatus } from 'expo-notifications';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_REMINDER_PREFERENCES,
  getReminderPreferences,
  saveReminderPreferences,
  type ReminderPreferences,
} from '@/db/settings';
import {
  disableHourlyReminders,
  enableReminders,
  getDailyReminderTimes,
  getReminderState,
  scheduleTestReminder,
} from '@/services/notifications';
import { colors } from '@/theme/colors';

type ReminderState = Awaited<ReturnType<typeof getReminderState>>;

const initialState: ReminderState = {
  enabled: false,
  permissionStatus: PermissionStatus.UNDETERMINED,
  scheduledCount: 0,
};

function formatHour(hour: number) {
  if (hour === 0) return '오전 12시';
  if (hour < 12) return `오전 ${hour}시`;
  if (hour === 12) return '오후 12시';
  return `오후 ${hour - 12}시`;
}

function Stepper({
  label,
  value,
  minimum,
  maximum,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControl}>
        <Pressable
          accessibilityLabel={`${label} 한 시간 줄이기`}
          accessibilityRole="button"
          disabled={value <= minimum}
          onPress={() => onChange(value - 1)}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
        >
          <Text style={styles.stepperSymbol}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{formatHour(value)}</Text>
        <Pressable
          accessibilityLabel={`${label} 한 시간 늘리기`}
          accessibilityRole="button"
          disabled={value >= maximum}
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
        >
          <Text style={styles.stepperSymbol}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [reminderState, setReminderState] = useState<ReminderState>(initialState);
  const [preferences, setPreferences] = useState<ReminderPreferences>(
    DEFAULT_REMINDER_PREFERENCES,
  );
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    const [state, savedPreferences] = await Promise.all([
      getReminderState(),
      getReminderPreferences(db),
    ]);
    setReminderState(state);
    setPreferences(savedPreferences);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const toggleReminders = async (enabled: boolean) => {
    if (updating) return;

    setUpdating(true);
    try {
      await saveReminderPreferences(db, preferences);
      const nextState = enabled
        ? await enableReminders(preferences)
        : await disableHourlyReminders();
      setReminderState(nextState);

      if (enabled && !nextState.enabled) {
        Alert.alert(
          '알림이 꺼져 있어요',
          '기기 설정에서 하루프레임 알림을 허용하면 기록을 떠올려 드릴게요.',
          [
            { text: '나중에', style: 'cancel' },
            { text: '설정 열기', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    } catch {
      Alert.alert('알림을 설정하지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setUpdating(false);
    }
  };

  const savePreferences = async () => {
    setUpdating(true);
    try {
      await saveReminderPreferences(db, preferences);
      if (reminderState.enabled) {
        setReminderState(await enableReminders(preferences));
      }
      Alert.alert('알림 시간을 저장했어요');
    } catch {
      Alert.alert('설정을 저장하지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setUpdating(false);
    }
  };

  const testReminder = async () => {
    const scheduled = await scheduleTestReminder();
    Alert.alert(
      scheduled ? '테스트 알림을 예약했어요' : '먼저 알림을 켜 주세요',
      scheduled ? '약 1분 뒤에 알림이 도착할 거예요.' : '활동 기록 알림을 켠 뒤 테스트해 주세요.',
    );
  };

  const reminderCount = getDailyReminderTimes(preferences).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>설정</Text>
        <Text style={styles.title}>알림</Text>

        <View style={styles.reminderCard}>
          <View style={styles.cardHeader}>
            <View style={styles.bellCircle}>
              <Text style={styles.bell}>◔</Text>
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>활동 기록 알림</Text>
              <Text style={styles.cardSubtitle}>
                {formatHour(preferences.startHour)}–{formatHour(preferences.endHour)}
              </Text>
            </View>
            <Switch
              disabled={updating}
              onValueChange={(value) => void toggleReminders(value)}
              thumbColor={colors.white}
              trackColor={{ false: '#CFC6BD', true: colors.coral }}
              value={reminderState.enabled}
            />
          </View>

          <View style={styles.rule} />

          <Stepper
            label="시작"
            maximum={preferences.endHour - 1}
            minimum={5}
            onChange={(startHour) => setPreferences((current) => ({ ...current, startHour }))}
            value={preferences.startHour}
          />
          <Stepper
            label="종료"
            maximum={23}
            minimum={preferences.startHour + 1}
            onChange={(endHour) => setPreferences((current) => ({ ...current, endHour }))}
            value={preferences.endHour}
          />

          <Text style={styles.intervalLabel}>알림 간격</Text>
          <View style={styles.intervalRow}>
            {([30, 60, 120] as const).map((minutes) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: preferences.intervalMinutes === minutes }}
                key={minutes}
                onPress={() =>
                  setPreferences((current) => ({ ...current, intervalMinutes: minutes }))
                }
                style={[
                  styles.intervalButton,
                  preferences.intervalMinutes === minutes && styles.intervalButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.intervalText,
                    preferences.intervalMinutes === minutes && styles.intervalTextSelected,
                  ]}
                >
                  {minutes < 60 ? '30분' : `${minutes / 60}시간`}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.infoLabel}>하루 알림</Text>
            <Text style={styles.infoValue}>{reminderCount}번</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={updating}
            onPress={() => void savePreferences()}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          >
            <Text style={styles.saveButtonText}>알림 시간 저장</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void testReminder()}
          style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}
        >
          <Text style={styles.testButtonText}>1분 뒤 테스트 알림 받기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 40 },
  eyebrow: { color: colors.coral, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  title: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 41,
    letterSpacing: -1,
  },
  reminderCard: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  bellCircle: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.coralSoft,
  },
  bell: { color: colors.coral, fontSize: 25, fontWeight: '900' },
  cardCopy: { flex: 1, marginLeft: 13 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  cardSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },
  rule: { height: 1, marginVertical: 18, backgroundColor: colors.line },
  stepperRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  stepperControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepperButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#EEE8DE',
  },
  stepperSymbol: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  stepperValue: {
    width: 72,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  intervalLabel: { marginTop: 17, color: colors.muted, fontSize: 13, fontWeight: '700' },
  intervalRow: { marginTop: 10, flexDirection: 'row', gap: 8 },
  intervalButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
  },
  intervalButtonSelected: { borderColor: colors.coral, backgroundColor: colors.coralSoft },
  intervalText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  intervalTextSelected: { color: colors.coral },
  summaryRow: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: colors.muted, fontSize: 13 },
  infoValue: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  saveButton: {
    marginTop: 16,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: colors.night,
  },
  saveButtonText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  testButton: {
    marginTop: 22,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 18,
  },
  testButtonText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.65 },
});
