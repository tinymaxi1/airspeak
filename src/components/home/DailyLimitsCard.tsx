/**
 * DailyLimitsCard — Anasayfa "Bugünkü Hakların" kartı.
 *
 * 5 pratik için kalan günlük hak. Premium ise "sınırsız" banner.
 *
 * Lansman öncesi UX polish — kullanıcı paywall önce kaç hak kaldığını görür.
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import {
  useLessonLimit,
  useAiLimit,
  useReadbackLimit,
  useListenSolveLimit,
} from '@/features/config/limits';
import { useAppConfig } from '@/features/config/api';
import { useDailyLimitsStore } from '@/stores/dailyLimitsStore';
import { FONTS, Eyebrow, Body, Mono } from '@/components/airspeak';

interface LimitRow {
  key: 'lesson' | 'ai' | 'readback' | 'listen_solve' | 'pronunciation';
  icon: string;
  i18nKey: string;
  fallback: string;
  used: number;
  limit: number;
  route: string;
  color: string;
}

export function DailyLimitsCard() {
  const { t } = useTranslation();
  const isPremium = useAuthStore((s) => s.isPremium);
  const cfg = useAppConfig();
  const counters = useDailyLimitsStore((s) => s.counters);
  const lessonLim = useLessonLimit();
  const aiLim = useAiLimit();
  const readbackLim = useReadbackLimit();
  const listenLim = useListenSolveLimit();

  // pronunciation: limit hook yok, manuel hesapla
  const pronLimit = (cfg['freemium.max_pronunciation_per_day'] as number) ?? 2;
  const pronUsed = counters.pronunciation_attempts ?? 0;

  if (isPremium) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/profile' as any)}
        style={{
          backgroundColor: '#0F1E47',
          borderRadius: 14,
          padding: 16,
          marginBottom: 18,
          borderBottomWidth: 4,
          borderBottomColor: '#0A1430',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#FFD56B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>✨</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.6 }}>
            {t('home.dailyLimits.premiumEyebrow', 'PRO ÜYE')}
          </Mono>
          <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF', marginTop: 2 }}>
            {t('home.dailyLimits.premiumBanner', 'Sınırsız ders · sınırsız pratik · sınırsız kalp')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const rows: LimitRow[] = [
    {
      key: 'lesson',
      icon: '📖',
      i18nKey: 'home.dailyLimits.lesson',
      fallback: 'Ders',
      used: lessonLim.used,
      limit: lessonLim.limit,
      route: '/(tabs)/learn',
      color: '#E63946',
    },
    {
      key: 'ai',
      icon: '🤖',
      i18nKey: 'home.dailyLimits.ai',
      fallback: 'AI Senaryo',
      used: aiLim.used,
      limit: aiLim.limit,
      route: '/conversation',
      color: '#7C5CFF',
    },
    {
      key: 'readback',
      icon: '🎙',
      i18nKey: 'home.dailyLimits.readback',
      fallback: 'Telsiz Tekrarı',
      used: readbackLim.used,
      limit: readbackLim.limit,
      route: '/readback',
      color: '#FF6B35',
    },
    {
      key: 'listen_solve',
      icon: '🎧',
      i18nKey: 'home.dailyLimits.listenSolve',
      fallback: 'Dinle & Çöz',
      used: listenLim.used,
      limit: listenLim.limit,
      route: '/listen-solve/practice',
      color: '#2EA8FF',
    },
    {
      key: 'pronunciation',
      icon: '🔊',
      i18nKey: 'home.dailyLimits.pronunciation',
      fallback: 'Telaffuz',
      used: pronUsed,
      limit: pronLimit,
      route: '/pronunciation/p1',
      color: '#F2C14E',
    },
  ];

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4,
        borderBottomColor: '#DCE0E8',
        padding: 14,
        marginBottom: 18,
      }}
    >
      <Eyebrow style={{ marginBottom: 8 }}>
        {t('home.dailyLimits.title', 'BUGÜNKÜ HAKLARIN')}
      </Eyebrow>
      <View style={{ gap: 8 }}>
        {rows.map((r) => {
          const remaining = Math.max(0, r.limit - r.used);
          const isFull = remaining === 0;
          const isLast = remaining === 1;
          const tone = isFull ? '#8A93A6' : isLast ? '#E63946' : '#0E1116';
          return (
            <TouchableOpacity
              key={r.key}
              activeOpacity={0.85}
              onPress={() => router.push(r.route as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 6,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isFull ? '#EDEFF3' : `${r.color}22`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, opacity: isFull ? 0.5 : 1 }}>{r.icon}</Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: tone,
                }}
              >
                {t(r.i18nKey, r.fallback)}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: 2,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: isFull
                    ? '#F4F5F8'
                    : isLast
                      ? '#FFE4E7'
                      : '#DDF7E6',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono700,
                    fontSize: 13,
                    color: isFull ? '#8A93A6' : isLast ? '#C8202E' : '#22A659',
                  }}
                >
                  {remaining}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: '#8A93A6',
                  }}
                >
                  /{r.limit}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 8, textAlign: 'center' }}>
        {t('home.dailyLimits.resetNote', 'Gece 00:00\'da yenilenir')}
      </Body>
    </View>
  );
}
