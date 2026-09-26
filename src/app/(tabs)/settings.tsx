import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { PermissionStatus } from 'expo-notifications';
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
  disableHourlyReminders,
  enableHourlyReminders,
  getReminderState,
  REMINDER_END_HOUR,
  REMINDER_START_HOUR,
  scheduleTestReminder,
} from '@/services/notifications';
import { colors } from '@/theme/colors';

type ReminderState = Awaited<ReturnType<typeof getReminderState>>;

const initialState: ReminderState = {
  enabled: false,
  permissionStatus: PermissionStatus.UNDETERMINED,
  scheduledCount: 0,
};

export default function SettingsScreen() {
  const [reminderState, setReminderState] = useState<ReminderState>(initialState);
  const [updating, setUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setReminderState(await getReminderState());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const toggleReminders = async (enabled: boolean) => {
    if (updating) {
      return;
    }

    setUpdating(true);
    try {
      const nextState = enabled
        ? await enableHourlyReminders()
        : await disableHourlyReminders();
      setReminderState(nextState);

      if (enabled && !nextState.enabled) {
        Alert.alert(
          '알림이 꺼져 있어',
          '기기 설정에서 DayFrame 알림을 허용하면 매시간 기록을 떠올려 줄게.',
          [
            { text: '나중에', style: 'cancel' },
            { text: '설정 열기', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    } catch {
      Alert.alert('알림을 설정하지 못했어', '잠시 후 다시 시도해 줘.');
    } finally {
      setUpdating(false);
    }
  };

  const testReminder = async () => {
    const scheduled = await scheduleTestReminder();
    if (scheduled) {
      Alert.alert('테스트 알림을 예약했어', '약 1분 뒤에 알림이 도착할 거야.');
    } else {
      Alert.alert('먼저 알림을 켜 줘', '위의 활동 기록 알림을 켠 뒤 테스트해 줘.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>설정</Text>
        <Text style={styles.title}>부담 없이,{`\n`}잊지 않을 만큼만</Text>
        <Text style={styles.description}>
          알림에는 활동이나 메모가 표시되지 않아. 잠금 화면에서도 네 기록은 드러나지 않아.
        </Text>

        <View style={styles.reminderCard}>
          <View style={styles.cardHeader}>
            <View style={styles.bellCircle}>
              <Text style={styles.bell}>◔</Text>
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>활동 기록 알림</Text>
              <Text style={styles.cardSubtitle}>
                오전 {REMINDER_START_HOUR}시–오후 {REMINDER_END_HOUR - 12}시 · 매시 정각
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

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>알림 횟수</Text>
            <Text style={styles.infoValue}>하루 {REMINDER_END_HOUR - REMINDER_START_HOUR + 1}번</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>현재 상태</Text>
            <Text style={[styles.infoValue, reminderState.enabled && styles.enabledText]}>
              {reminderState.enabled ? '켜짐' : '꺼짐'}
            </Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteSymbol}>i</Text>
          <Text style={styles.noteText}>
            Android의 절전 설정에 따라 알림이 정각보다 조금 늦을 수 있어. DayFrame은 불필요한 정확 알람 권한을 요구하지 않아.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => void testReminder()}
          style={({ pressed }) => [styles.testButton, pressed && styles.pressed]}
        >
          <Text style={styles.testButtonText}>1분 뒤 테스트 알림 받기</Text>
        </Pressable>

        <Text style={styles.footer}>알림 시간대와 간격 조절은 다음 단계에서 추가할게.</Text>
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
    marginTop: 8,
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 41,
    letterSpacing: -1,
  },
  description: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  reminderCard: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellCircle: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.coralSoft,
  },
  bell: {
    color: colors.coral,
    fontSize: 25,
    fontWeight: '900',
  },
  cardCopy: {
    flex: 1,
    marginLeft: 13,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  cardSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
  },
  rule: {
    height: 1,
    marginVertical: 18,
    backgroundColor: colors.line,
  },
  infoRow: {
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  infoValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  enabledText: {
    color: colors.coral,
  },
  noteCard: {
    marginTop: 14,
    padding: 16,
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: '#EEE8DE',
  },
  noteSymbol: {
    width: 24,
    color: colors.coral,
    fontSize: 14,
    fontWeight: '900',
  },
  noteText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  testButton: {
    marginTop: 22,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 18,
  },
  testButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.65,
  },
  footer: {
    marginTop: 16,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
