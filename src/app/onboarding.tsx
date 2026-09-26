import { useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboarding } from '@/db/settings';
import { colors } from '@/theme/colors';

const promises = [
  {
    number: '01',
    title: '한 시간에 한 번, 짧게',
    body: '지난 한 시간에 가장 오래 한 활동 하나만 남겨. 정확하지 않아도 괜찮아.',
  },
  {
    number: '02',
    title: '비어 있는 시간은 정직하게',
    body: '답하지 않은 시간은 지어내지 않아. 나중에 일정표에서 직접 채울 수 있어.',
  },
  {
    number: '03',
    title: '밤에는 오늘을 한 장으로',
    body: '흩어진 기록을 감성적인 하루 카드로 다시 만나고, 원할 때만 공유해.',
  },
];

export default function OnboardingScreen() {
  const db = useSQLiteContext();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    if (saving) {
      return;
    }
    setSaving(true);
    await completeOnboarding(db);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>DayFrame</Text>
        <Text style={styles.eyebrow}>하루를 한 장에 담는 기록</Text>
        <Text style={styles.title}>길게 쓰지 않아도,{`\n`}오늘은 남을 수 있어</Text>
        <Text style={styles.description}>
          DayFrame은 생산성을 평가하지 않아. 하루가 어떻게 흘렀는지 다정하게 돌아보는 개인 기록장이야.
        </Text>

        <View style={styles.promiseList}>
          {promises.map((promise) => (
            <View key={promise.number} style={styles.promiseCard}>
              <Text style={styles.promiseNumber}>{promise.number}</Text>
              <View style={styles.promiseCopy}>
                <Text style={styles.promiseTitle}>{promise.title}</Text>
                <Text style={styles.promiseBody}>{promise.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyIcon}>⌂</Text>
          <Text style={styles.privacyText}>
            가입 없이 시작하고 기록은 이 기기에만 저장해. 알림 권한도 설명을 본 뒤 설정에서 선택할 수 있어.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => void finish()}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
        >
          <Text style={styles.startButtonText}>DayFrame 시작하기</Text>
        </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 38,
  },
  brand: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  eyebrow: {
    marginTop: 34,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    marginTop: 9,
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 45,
    letterSpacing: -1.2,
  },
  description: {
    marginTop: 15,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  promiseList: {
    marginTop: 32,
    gap: 12,
  },
  promiseCard: {
    padding: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 21,
    backgroundColor: colors.surface,
  },
  promiseNumber: {
    width: 38,
    color: colors.coral,
    fontSize: 12,
    fontWeight: '900',
  },
  promiseCopy: {
    flex: 1,
  },
  promiseTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  promiseBody: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  privacyCard: {
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: '#EEE8DE',
  },
  privacyIcon: {
    width: 28,
    color: colors.sage,
    fontSize: 18,
    fontWeight: '900',
  },
  privacyText: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  startButton: {
    marginTop: 24,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: colors.night,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.7,
  },
});
