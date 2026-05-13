/**
 * Placement Detail Screen — Profile sub-page
 *
 * Sprint B — Placement UX:
 * - Header: Seviye Sınavı + back
 * - Last result kart:
 *   - overall_level büyük (B1)
 *   - 4 dimension bar (Genel İngilizce / Havacılık İngilizcesi / Havacılık Bilgisi / İletişim)
 *   - Test tarihi + soru sayısı + duration
 * - History list (attempt_number 1, 2, ...) — şimdilik latest-only tablo, attempt_number > 1 ise göster
 * - "Tekrar gir" buton (cooldown gate)
 * - Empty state: "Henüz sınav vermedin" + CTA
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useUserPlacementResult,
  useCanTakePlacement,
} from '@/features/placement/api';
import { usePalette } from '@/lib/usePalette';
import { FONTS, Mono, Body, Eyebrow, Button3D, ProgressBar } from '@/components/airspeak';
import { TabletShell } from '@/components/tablet';
import { track } from '@/lib/posthog';

const LEVEL_COLOR: Record<string, string> = {
  A0: '#8A93A6',
  A1: '#E63946',
  A2: '#F2C14E',
  B1: '#1F4FB6',
  B2: '#2DBE6C',
  C1: '#7C5CFF',
  C2: '#0F1E47',
};

interface DimRow {
  key: 'general_english_score' | 'aviation_english_score' | 'aviation_knowledge_score' | 'communication_score';
  // Eski karşılığı — geriye uyumluluk
  legacyKey: 'vocabulary_score' | 'grammar_score' | 'listening_score' | 'reading_score';
  i18nKey: string;
  fallback: string;
  color: 'sky' | 'red' | 'gold' | 'green';
  accentHex: string;
}

const DIMENSIONS: DimRow[] = [
  { key: 'general_english_score', legacyKey: 'vocabulary_score',
    i18nKey: 'screens.profile.placement.dimensions.generalEnglish',
    fallback: 'Genel İngilizce', color: 'sky', accentHex: '#2EA8FF' },
  { key: 'aviation_english_score', legacyKey: 'grammar_score',
    i18nKey: 'screens.profile.placement.dimensions.aviationEnglish',
    fallback: 'Havacılık İngilizcesi', color: 'red', accentHex: '#E63946' },
  { key: 'aviation_knowledge_score', legacyKey: 'listening_score',
    i18nKey: 'screens.profile.placement.dimensions.aviationKnowledge',
    fallback: 'Havacılık Bilgisi', color: 'gold', accentHex: '#F2C14E' },
  { key: 'communication_score', legacyKey: 'reading_score',
    i18nKey: 'screens.profile.placement.dimensions.communication',
    fallback: 'İletişim', color: 'green', accentHex: '#2DBE6C' },
];

export default function PlacementDetailScreen() {
  const c = usePalette();
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const { result, loading } = useUserPlacementResult(userId);
  const { state: canTake } = useCanTakePlacement(userId);

  const canRetry = canTake?.can_take ?? false;
  const daysRemaining = canTake?.days_remaining ?? 0;

  function onRetry() {
    if (!canRetry) {
      Alert.alert(
        t('screens.profile.placement.cooldownTitle', 'Henüz tekrar test alamazsın'),
        t('screens.profile.placement.cooldownBody', { days: daysRemaining,
          defaultValue: '{{days}} gün sonra tekrar test alabilirsin. Cooldown 30 gün.' }),
      );
      return;
    }
    const daysSinceLast = result?.taken_at
      ? Math.floor((Date.now() - new Date(result.taken_at).getTime()) / 86400000)
      : null;
    track('placement_retest_started', {
      previous_level: result?.overall_level ?? null,
      days_since_last: daysSinceLast ?? null,
      attempt_number: result?.attempt_number ?? null,
    });
    router.push('/(auth)/onboarding/level-test' as any);
  }

  return (
    <TabletShell background={c.bg}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#DCE0E8',
            }}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 22, color: '#0E1116' }}>‹</Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 16, color: '#0E1116', flex: 1 }}>
              {t('screens.profile.placement.title', 'Seviye Sınavı')}
            </Text>
          </View>
        </SafeAreaView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {loading && !result ? (
            <Body color="#8A93A6" style={{ fontSize: 13, textAlign: 'center', paddingTop: 24 }}>
              {t('common.loading', 'Yükleniyor…')}
            </Body>
          ) : !result || !result.overall_level ? (
            // ─── Empty state (no backfill, sadece CTA) ───
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 80, marginBottom: 12 }}>📋</Text>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0E1116',
                  letterSpacing: -0.44,
                  textAlign: 'center',
                  marginBottom: 6,
                }}
              >
                {t('screens.profile.placement.emptyState.title', 'Henüz sınav vermedin')}
              </Text>
              <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>
                {t(
                  'screens.profile.placement.emptyState.subtitleLong',
                  '4 boyutta seviyeni belirle: Genel İngilizce, Havacılık İngilizcesi, Havacılık Bilgisi ve İletişim. 5-10 dakika sürer.',
                )}
              </Body>
              <Button3D variant="primary" fullWidth onPress={() => router.push('/(auth)/onboarding/level-test' as any)}>
                {t('screens.profile.placement.emptyState.cta', 'Sınava gir →')}
              </Button3D>
            </View>
          ) : (
            <>
              {/* ─── Last result card ─── */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#DCE0E8',
                  borderBottomWidth: 4,
                  borderBottomColor: '#DCE0E8',
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Eyebrow>{t('screens.profile.placement.lastResult', 'SON SONUÇ')}</Eyebrow>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 6, gap: 12 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 56,
                      fontWeight: '700',
                      color: LEVEL_COLOR[result.overall_level] ?? '#1F4FB6',
                      lineHeight: 56,
                      letterSpacing: -2.24,
                    }}
                  >
                    {result.overall_level}
                  </Text>
                  <View style={{ flex: 1, paddingBottom: 4 }}>
                    <Body style={{ fontSize: 12, color: '#5A6478' }}>
                      {t('screens.profile.placement.takenAt', 'Test tarihi')}:{' '}
                      {new Date(result.taken_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Body>
                    <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 2 }}>
                      {result.questions_answered} {t('screens.profile.placement.questionsSuffix', 'soru')}
                      {result.test_duration_seconds
                        ? ` · ${Math.round(result.test_duration_seconds / 60)} ${t('screens.profile.placement.minutesSuffix', 'dk')}`
                        : ''}
                      {' · '}
                      {t('screens.profile.placement.attempt', { n: result.attempt_number,
                        defaultValue: '{{n}}. deneme' })}
                    </Mono>
                  </View>
                </View>

                {/* 4 dim bars */}
                <View style={{ marginTop: 14, gap: 10 }}>
                  {DIMENSIONS.map((d) => {
                    const score = (result as any)[d.key] ?? (result as any)[d.legacyKey] ?? 0;
                    const pct = Math.min(100, Math.max(0, (score / 6) * 100));
                    return (
                      <View key={d.key}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                        >
                          <Body style={{ fontSize: 13, color: '#0E1116' }}>
                            {t(d.i18nKey, d.fallback)}
                          </Body>
                          <Mono style={{ fontSize: 11, color: d.accentHex, fontWeight: '700' }}>
                            {Number(score).toFixed(1)} / 6
                          </Mono>
                        </View>
                        <ProgressBar value={pct} color={d.color} height={6} />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* ─── Recommended lesson link ─── */}
              {result.recommended_start_lesson_id && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    // Sentry breadcrumb içeride zaten var, sadece track
                    track('recommendation_followed', {
                      lesson_id: result.recommended_start_lesson_id,
                      role: 'profile_page',
                      level: result.overall_level,
                    });
                    // Lesson id ile route — slug bilmediğimiz için useNextLesson fallback verir
                    router.push('/(tabs)/learn');
                  }}
                  style={{
                    backgroundColor: '#0F1E47',
                    borderRadius: 14,
                    padding: 14,
                    borderBottomWidth: 4,
                    borderBottomColor: '#0A1430',
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>🛫</Text>
                  <View style={{ flex: 1 }}>
                    <Mono style={{ fontSize: 9, color: '#FFD56B', letterSpacing: 1 }}>
                      {t('screens.profile.placement.recommended', 'ÖNERİLEN BAŞLANGIÇ')}
                    </Mono>
                    <Text
                      style={{
                        fontFamily: FONTS.body800,
                        fontSize: 14,
                        color: '#FFFFFF',
                        marginTop: 2,
                      }}
                    >
                      {t('screens.profile.placement.recommendedCta', 'Seviyene uygun ilk derse git')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 22, color: '#FFD56B' }}>›</Text>
                </TouchableOpacity>
              )}

              {/* ─── Retry CTA ─── */}
              <Button3D
                variant={canRetry ? 'primary' : 'ghost'}
                fullWidth
                disabled={!canRetry}
                onPress={onRetry}
              >
                {canRetry
                  ? t('screens.profile.placement.retake', 'Sınavı yenile')
                  : t('screens.profile.placement.cooldownDaysLong', { days: daysRemaining,
                      defaultValue: '{{days}} gün sonra tekrar alınabilir' })}
              </Button3D>

              {/* ─── History note ─── */}
              {result.attempt_number > 1 && (
                <View style={{ marginTop: 20, padding: 12, backgroundColor: '#F4F5F8', borderRadius: 10 }}>
                  <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1 }}>
                    {t('screens.profile.placement.history', 'GEÇMİŞ')}
                  </Mono>
                  <Body style={{ fontSize: 13, color: '#5A6478', marginTop: 4, lineHeight: 18 }}>
                    {t('screens.profile.placement.historyNote', {
                      attempts: result.attempt_number,
                      defaultValue: 'Bu güne kadar {{attempts}} kez sınava girdin. Skorların sadece son sınava ait — geçmiş seansları detaylı görmek için ileri sürümde history eklenecek.',
                    })}
                  </Body>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </TabletShell>
  );
}
