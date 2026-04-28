/**
 * Onboarding Tour — 4 slide swipe through ile power features tanıtımı.
 *
 * İlk açılışta otomatik gösterilir (auth + onboarding tamam sonrası).
 * Kullanıcı "Atla" diyebilir.
 *
 * Tour state: useAuthStore'da `hasSeenTour` flag persist.
 */
import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  Mono,
  Body,
  FONTS,
  Button3D,
  TopoBackground,
} from '@/components/airspeak';

interface Slide {
  emoji: string;
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  bgColor: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '🎙',
    eyebrowKey: 'tour.s1.eyebrow',
    titleKey: 'tour.s1.title',
    bodyKey: 'tour.s1.body',
    bgColor: '#0F1E47',
    accentColor: '#E63946',
  },
  {
    emoji: '🤖',
    eyebrowKey: 'tour.s2.eyebrow',
    titleKey: 'tour.s2.title',
    bodyKey: 'tour.s2.body',
    bgColor: '#06091A',
    accentColor: '#7C5CFF',
  },
  {
    emoji: '🎯',
    eyebrowKey: 'tour.s3.eyebrow',
    titleKey: 'tour.s3.title',
    bodyKey: 'tour.s3.body',
    bgColor: '#0F1E47',
    accentColor: '#FFD56B',
  },
  {
    emoji: '🔥',
    eyebrowKey: 'tour.s4.eyebrow',
    titleKey: 'tour.s4.title',
    bodyKey: 'tour.s4.body',
    bgColor: '#06091A',
    accentColor: '#2DBE6C',
  },
];

const { width: SCREEN_W } = Dimensions.get('window');

export default function OnboardingTourScreen() {
  const { t } = useTranslation();
  const setHasSeenTour = useAuthStore((s) => s.setHasSeenTour);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (newPage !== page) setPage(newPage);
  };

  const goToHome = () => {
    setHasSeenTour(true);
    router.replace('/(tabs)/home');
  };

  const goToNext = () => {
    if (page === SLIDES.length - 1) {
      goToHome();
    } else {
      scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_W, animated: true });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: SLIDES[page]?.bgColor ?? '#0F1E47' }}>
      <View style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <TopoBackground />
      </View>

      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Page indicators */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === page ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i === page
                      ? SLIDES[page]?.accentColor ?? '#FFFFFF'
                      : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </View>

          {/* Skip */}
          <TouchableOpacity onPress={goToHome}>
            <Text
              style={{
                fontFamily: FONTS.body700,
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {t('tour.skip', 'Atla')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{
              width: SCREEN_W,
              flex: 1,
              padding: 32,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Text style={{ fontSize: 100 }}>{slide.emoji}</Text>
            <Mono
              style={{
                fontSize: 12,
                color: slide.accentColor,
                letterSpacing: 2.16,
                textAlign: 'center',
              }}
            >
              {t(slide.eyebrowKey)}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 32,
                fontWeight: '700',
                color: '#FFFFFF',
                textAlign: 'center',
                letterSpacing: -0.96,
                lineHeight: 36,
              }}
            >
              {t(slide.titleKey)}
            </Text>
            <Body
              color="rgba(255,255,255,0.85)"
              style={{ fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 320 }}
            >
              {t(slide.bodyKey)}
            </Body>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView edges={['bottom']}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <Button3D variant="primary" fullWidth onPress={goToNext}>
            {page === SLIDES.length - 1
              ? t('tour.start', 'Başla 🚀')
              : t('tour.next', 'Sonraki →')}
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}
