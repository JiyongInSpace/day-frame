import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { completeOnboarding } from '@/db/settings';
import { colors } from '@/theme/colors';

const pages = [
  {
    eyebrow: '한 시간에 한 번, 짧게',
    title: '길게 쓰지 않아도\n오늘은 남을 수 있어요',
    body: '지난 한 시간에 가장 오래 한 활동 하나만 남겨요. 정확하지 않아도 괜찮아요.',
    image: require('../../assets/onboarding/hourly-moment.png'),
    imageLabel: '시계 주변에 책과 찻잔, 운동화가 놓인 그림',
  },
  {
    eyebrow: '비어 있는 시간은 정직하게',
    title: '답하지 않은 순간도\n하루의 일부예요',
    body: '비어 있는 시간을 지어내지 않아요. 기억이 날 때 일정표에서 직접 채울 수 있어요.',
    image: require('../../assets/onboarding/honest-gap.png'),
    imageLabel: '한 칸이 비어 있는 기록장과 연필 그림',
  },
  {
    eyebrow: '밤에는 오늘을 한 장으로',
    title: '흩어진 순간이 모여\n오늘의 카드가 돼요',
    body: '남긴 기록을 감성적인 하루 카드로 다시 만나고, 원할 때만 저장하거나 공유해요.',
    image: require('../../assets/onboarding/daily-card.png'),
    imageLabel: '하루의 여러 장면이 밤의 카드로 모이는 그림',
  },
];

export default function OnboardingScreen() {
  const db = useSQLiteContext();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState(false);
  const isLastPage = page === pages.length - 1;

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    await completeOnboarding(db);
    router.replace('/(tabs)');
  };

  const next = () => {
    if (isLastPage) {
      void finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
    setPage((current) => current + 1);
  };

  const updatePage = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brand}>DayFrame</Text>
        <Text style={styles.pageCount}>{page + 1} / {pages.length}</Text>
      </View>

      <ScrollView
        horizontal
        onMomentumScrollEnd={updatePage}
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        style={styles.pager}
      >
        {pages.map((item) => (
          <View key={item.eyebrow} style={[styles.page, { width }]}>
            <View style={styles.illustrationFrame}>
              <Image
                accessibilityLabel={item.imageLabel}
                resizeMode="contain"
                source={item.image}
                style={styles.illustration}
              />
            </View>
            <Text style={styles.eyebrow}>{item.eyebrow}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.body}</Text>

            {item === pages[2] ? (
              <View style={styles.privacyCard}>
                <Text style={styles.privacyIcon}>⌂</Text>
                <Text style={styles.privacyText}>
                  가입 없이 시작하고 기록은 이 기기에만 저장해요. 알림도 설명을 확인한 뒤 선택해요.
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View accessibilityLabel={`${pages.length}장 중 ${page + 1}번째`} style={styles.dots}>
          {pages.map((item, index) => (
            <View key={item.eyebrow} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={next}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <Text style={styles.nextButtonText}>
            {isLastPage ? 'DayFrame 시작하기' : '다음'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: colors.coral, fontSize: 15, fontWeight: '900', letterSpacing: 1.1 },
  pageCount: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  pager: { flex: 1 },
  page: { paddingHorizontal: 24, paddingTop: 12 },
  illustrationFrame: {
    height: '45%',
    minHeight: 250,
    maxHeight: 390,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: { width: '94%', height: '94%' },
  eyebrow: { color: colors.coral, fontSize: 13, fontWeight: '900', letterSpacing: 0.2 },
  title: {
    marginTop: 10,
    color: colors.ink,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 41,
    letterSpacing: -1,
  },
  description: { marginTop: 13, color: colors.muted, fontSize: 15, lineHeight: 24 },
  privacyCard: {
    marginTop: 18,
    padding: 15,
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: '#EEE8DE',
  },
  privacyIcon: { width: 28, color: colors.sage, fontSize: 18, fontWeight: '900' },
  privacyText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  dots: { height: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { width: 22, backgroundColor: colors.coral },
  nextButton: {
    marginTop: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 19,
    backgroundColor: colors.night,
  },
  nextButtonText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.7 },
});
