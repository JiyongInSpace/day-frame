import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayCard } from '@/components/DayCard';
import { useDayRecords } from '@/hooks/useDayRecords';
import { colors } from '@/theme/colors';

export default function TodayScreen() {
  const { records, loading } = useDayRecords();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>DayFrame</Text>
            <Text style={styles.subtitle}>오늘은 어떻게 흘러가고 있어?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.coral} />
          </View>
        ) : (
          <DayCard records={records} />
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/record')}
          style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}
        >
          <View style={styles.plusCircle}>
            <Text style={styles.plus}>＋</Text>
          </View>
          <View style={styles.buttonCopy}>
            <Text style={styles.buttonTitle}>지난 한 시간 기록하기</Text>
            <Text style={styles.buttonSubtitle}>몇 번의 탭이면 충분해</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="오늘 카드 저장 또는 공유"
          onPress={() => router.push('/share')}
          style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
        >
          <Text style={styles.shareIcon}>↗</Text>
          <Text style={styles.shareText}>오늘 카드 저장 · 공유</Text>
        </Pressable>

        <Text style={styles.privacyNote}>
          기록은 이 기기에만 머물러. 공유는 네가 원할 때만 할 수 있어.
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.coralSoft,
  },
  avatarText: {
    color: colors.coral,
    fontSize: 17,
    fontWeight: '900',
  },
  loadingCard: {
    height: 510,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  recordButton: {
    marginTop: 22,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.72,
  },
  plusCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.coral,
  },
  plus: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '400',
  },
  buttonCopy: {
    flex: 1,
    marginLeft: 14,
  },
  buttonTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  buttonSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
  },
  arrow: {
    color: colors.muted,
    fontSize: 30,
    fontWeight: '300',
  },
  privacyNote: {
    marginTop: 18,
    paddingHorizontal: 14,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.night,
  },
  shareIcon: {
    color: colors.apricot,
    fontSize: 19,
    fontWeight: '800',
  },
  shareText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
