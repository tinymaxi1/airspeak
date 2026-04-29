/**
 * Home Screen — AirSpeak Daily Flight Plan
 *
 * Tasarım birebir uygulandı (screens-home.jsx):
 * - Custom header: navy topo + "Good morning, Captain." + 4 stat pills
 * - Daily flight plan card (2/3 lessons today, IST→JFK pattern)
 * - Week strip (7 günlük progress)
 * - Quick practice 2x2 grid (4 ikon)
 * - Word of the flight ("squawk")
 * - Tab bar 5 sekme (active: home)
 */
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSrsStore } from '@/stores/srsStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { useActivityStore } from '@/stores/activityStore';
import { getNextLesson } from '@/features/lessons/seed/lessonTree';
import {
  HHero,
  H2,
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
  Button3D,
  Card3D,
} from '@/components/airspeak';

export default function HomeScreen() {
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role);
  const placement = useOnboardingStore((s) => s.placementResult);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const completedIds = useProgressStore((s) => s.completedLessonIds);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const next = useMemo(() => getNextLesson(role, completedSet, false), [role, completedSet]);

  // SRS: bugün tekrar etmesi gereken kart sayısı
  const dueCount = useSrsStore((s) => {
    const now = Date.now();
    return Object.values(s.cards).filter((c) => c.nextReviewAt <= now).length;
  });

  // Offline durumu
  const isOnline = useOfflineStore((s) => s.isOnline);

  // Son aktiviteler (max 3 göster) — selector stable referans, slice useMemo'da
  // (selector içinde slice edersek her render yeni array → sonsuz döngü)
  const recentList = useActivityStore((s) => s.recent);
  const recentActivity = useMemo(() => recentList.slice(0, 3), [recentList]);

  // Pull-to-refresh: Zustand snapshot'larının fresh okunması için kısa bir bekleme yeter.
  // Persisted store'lar zaten hot-reload, bu sadece kullanıcıya "yenilendi" hissi verir.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const streak = useGamificationStore((s) => s.currentStreak ?? 0);
  const hearts = useGamificationStore((s) => s.hearts ?? 5);
  const xp = useGamificationStore((s) => s.totalXp ?? 0);
  const level = placement?.generalEnglish?.label ?? placement?.level ?? 'B1';

  // İlk kullanıcı kontrolü: hiç ders tamamlamadı + XP 0
  const isFirstTime = completedIds.length === 0 && xp === 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* ═══════════ HEADER — navy topo strip ═══════════ */}
      <View style={{ backgroundColor: '#0F1E47', position: 'relative', overflow: 'hidden' }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 18 }}>
            {/* Topo glow background */}
            <View style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
              <Svg width="100%" height="100%" viewBox="0 0 393 200">
                <Defs>
                  <RadialGradient id="topoGlow" cx="0%" cy="0%">
                    <Stop offset="0%" stopColor="rgba(91,192,255,0.18)" />
                    <Stop offset="100%" stopColor="rgba(91,192,255,0)" />
                  </RadialGradient>
                  <RadialGradient id="redGlow" cx="100%" cy="100%">
                    <Stop offset="0%" stopColor="rgba(230,57,70,0.18)" />
                    <Stop offset="100%" stopColor="rgba(230,57,70,0)" />
                  </RadialGradient>
                </Defs>
                <Rect width="393" height="200" fill="url(#topoGlow)" />
                <Rect width="393" height="200" fill="url(#redGlow)" />
              </Svg>
            </View>

            {/* Greeting + Avatar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                position: 'relative',
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    letterSpacing: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    textTransform: 'uppercase',
                  }}
                >
                  FLT 12 ✦ DAY {streak}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: -0.52,
                    marginTop: 2,
                  }}
                >
                  {t('screens.home.greeting')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {/* Search */}
                <TouchableOpacity
                  onPress={() => router.push('/search')}
                  accessibilityLabel={t('a11y.search', 'Ara')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🔍</Text>
                </TouchableOpacity>
                {/* Notifications */}
                <TouchableOpacity
                  onPress={() => router.push('/notifications')}
                  accessibilityLabel={t('a11y.notifications', 'Bildirimler')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🔔</Text>
                  {/* Unread dot */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#E63946',
                      borderWidth: 1.5,
                      borderColor: '#0F1E47',
                    }}
                  />
                </TouchableOpacity>
                <Avatar initials="EK" color="#E63946" size={44} />
              </View>
            </View>

            {/* Stat pills row */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <StatPill icon="🔥" value={String(streak)} label={t('screens.home.streak')} />
              <StatPill icon="❤" value={String(hearts)} label={t('screens.home.hearts')} />
              <StatPill icon="⭐" value={xp.toLocaleString()} label={t('screens.home.xp')} />
              <StatPill icon="🌐" value={level} label={t('screens.home.level')} />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Offline banner */}
      {!isOnline && (
        <View
          style={{
            backgroundColor: '#FF7847',
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: '#FFFFFF' }}>📡</Text>
          <Mono style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 0.99, flex: 1 }}>
            {t('home.offline', 'ÇEVRİMDIŞI MOD · İNDİRİLMİŞ DERSLER ÇALIŞIR')}
          </Mono>
          <TouchableOpacity onPress={() => router.push('/offline')}>
            <Mono style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 0.99, textDecorationLine: 'underline' }}>
              {t('home.viewOffline', 'GÖR')}
            </Mono>
          </TouchableOpacity>
        </View>
      )}

      {/* ═══════════ SCROLL AREA ═══════════ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E63946"
            colors={['#E63946']}
          />
        }
      >
        {/* İlk kullanıcı için onboarding banner */}
        {isFirstTime && (
          <View
            style={{
              backgroundColor: '#E63946',
              borderRadius: 14,
              padding: 16,
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
              marginBottom: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 36 }}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8 }}>
                {t('screens.home.firstTimeEyebrow', 'BAŞLANGIÇ')}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 20,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginTop: 4,
                  lineHeight: 22,
                }}
              >
                {t('screens.home.firstTimeTitle', 'İlk dersine başla')}
              </Text>
              <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                {t('screens.home.firstTimeSub', '~3 dk · streak\'in başlasın')}
              </Mono>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/learn')}
              style={{
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: '#E63946' }}>
                {t('screens.home.firstTimeStart', 'BAŞLA →')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Flight Plan card */}
        <Card3D style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
          {/* Header */}
          <View
            style={{
              padding: 16,
              paddingBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1.5,
              borderBottomColor: '#B8BFCC',
              borderStyle: 'dashed',
            }}
          >
            <View>
              <Eyebrow>{t('screens.home.today')}</Eyebrow>
              <Mono style={{ fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                IST <Text style={{ color: '#8A93A6' }}>—————</Text> JFK
              </Mono>
            </View>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#E63946',
              }}
            >
              2 / 3
            </Text>
          </View>

          {/* Lesson list */}
          <View style={{ padding: 16 }}>
            <FlightPlanRow
              state="done"
              title="Read-back: Taxi clearance"
              meta="+45 XP · 2 perfect"
              time="9:12"
            />
            <FlightPlanRow
              state="done"
              title="Vocab: Approach phase"
              meta="+38 XP · 1 mistake"
              time="9:18"
              hasBorder
            />
            <FlightPlanRow
              state="current"
              title={next?.lesson.title ?? 'AI Conversation: Holding pattern'}
              meta="~5 min · live with co-pilot AI"
              hasBorder
            />
          </View>

          {/* Resume button */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => {
                recordDailyActivity();
                if (next) {
                  router.push({ pathname: '/lesson/[id]', params: { id: next.lesson.id } });
                } else {
                  router.push('/(tabs)/learn');
                }
              }}
            >
              {t('screens.home.resume')} ✈
            </Button3D>
          </View>
        </Card3D>

        {/* Week strip */}
        <Eyebrow>WEEK 6 · ON ROUTE</Eyebrow>
        <Card3D style={{ padding: 14, marginTop: 8, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {(['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const).map((d, i) => {
              const states = ['done', 'done', 'done', 'done', 'current', 'future', 'future'] as const;
              const s = states[i];
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 11,
                      color: '#8A93A6',
                      marginBottom: 6,
                    }}
                  >
                    {d}
                  </Text>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        s === 'done' ? '#2DBE6C' : s === 'current' ? '#E63946' : '#E9E6DD',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: s === 'current' ? 2 : 0,
                      borderColor: '#E63946',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 12,
                        color: s === 'future' ? '#8A93A6' : '#FFFFFF',
                      }}
                    >
                      {s === 'done' ? '✓' : s === 'current' ? '🔥' : i + 1}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8', paddingTop: 10 }}>
            <Body style={{ fontSize: 13, color: '#5A6478', textAlign: 'center' }}>
              <Text style={{ color: '#0E1116', fontFamily: FONTS.body700 }}>4 days</Text> till new perfect week badge.
            </Body>
          </View>
        </Card3D>

        {/* Career Hub kartı — kullanıcının kariyer odaklı tüm kaynakları */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/career')}
          style={{
            backgroundColor: '#0F1E47',
            borderRadius: 14,
            padding: 16,
            borderBottomWidth: 4,
            borderBottomColor: '#0A1430',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 36 }}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
              {t('screens.home.careerEyebrow', 'KARİYER MERKEZİ')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 19,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 4,
                letterSpacing: -0.38,
              }}
            >
              {t('screens.home.careerTitle', 'ICAO 4 · 41 Havayolu · AI')}
            </Text>
            <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
              {t('screens.home.careerSub', 'Mülakat + sınav + B2B kohort')}
            </Mono>
          </View>
          <Text style={{ fontSize: 22, color: '#FFD56B' }}>›</Text>
        </TouchableOpacity>

        {/* SRS Review queue — sadece due > 0 ise görünür */}
        {dueCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/srs')}
            style={{
              backgroundColor: '#FFD56B',
              borderRadius: 14,
              padding: 16,
              borderBottomWidth: 4,
              borderBottomColor: '#F2C14E',
              marginTop: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 36 }}>🧠</Text>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: '#0A1430', letterSpacing: 1.8 }}>
                {t('screens.home.reviewQueue', 'BUGÜNKÜ TEKRAR')}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0A1430',
                  marginTop: 2,
                  letterSpacing: -0.44,
                }}
              >
                {t('screens.home.reviewQueueCount', '{{count}} kart hazır', { count: dueCount })}
              </Text>
              <Mono style={{ fontSize: 11, color: 'rgba(10,20,48,0.7)', marginTop: 4 }}>
                {t('screens.home.reviewQueueSub', '~3 dk · zayıf alanlarını sağlamlaştır')}
              </Mono>
            </View>
            <Text style={{ fontSize: 22, color: '#0A1430' }}>›</Text>
          </TouchableOpacity>
        )}

        {/* Recents — kaldığın yer */}
        {recentActivity.length > 0 && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: dueCount > 0 ? 18 : 0,
              }}
            >
              <Eyebrow>{t('screens.home.recentsEyebrow', 'KALDIĞIN YER')}</Eyebrow>
            </View>
            <View style={{ marginTop: 8, gap: 6 }}>
              {recentActivity.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (a.type === 'lesson') router.push(`/lesson/${a.refId}`);
                    else if (a.type === 'conversation')
                      router.push({
                        pathname: '/conversation/[scenario]',
                        params: { scenario: a.refId },
                      });
                    else if (a.type === 'pronunciation') router.push(`/pronunciation/${a.refId}`);
                    else if (a.type === 'srs') router.push('/srs');
                    else if (a.type === 'exam') router.push('/exam/icao4');
                    else if (a.type === 'readback') router.push('/readback');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${a.titleTr} ${a.subtitleTr ?? ''}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1.5,
                    borderColor: '#DCE0E8',
                    borderRadius: 12,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>
                    {a.type === 'lesson'
                      ? '📚'
                      : a.type === 'conversation'
                      ? '🤖'
                      : a.type === 'pronunciation'
                      ? '🔊'
                      : a.type === 'srs'
                      ? '🔁'
                      : a.type === 'exam'
                      ? '🎯'
                      : '🎙'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}
                      numberOfLines={1}
                    >
                      {a.titleTr}
                    </Text>
                    {a.subtitleTr && (
                      <Mono style={{ fontSize: 10, color: '#8A93A6', marginTop: 2 }}>
                        {a.subtitleTr}
                      </Mono>
                    )}
                  </View>
                  <Text style={{ fontSize: 18, color: '#8A93A6' }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Quick practice 2x2 */}
        <Eyebrow style={{ marginTop: dueCount > 0 || recentActivity.length > 0 ? 18 : 0 }}>FAST PRACTICE — 90 SEC</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          <QuickCard
            icon="🎙"
            label={t('screens.home.qReadback', 'Read-back drill')}
            sub={t('screens.home.qReadbackSub', 'ATC clearances')}
            color="#E63946"
            onPress={() => router.push('/readback')}
          />
          <QuickCard
            icon="🤖"
            label={t('screens.home.qAi', 'AI roleplay')}
            sub={t('screens.home.qAiSub', '5 senaryo · ücretsiz')}
            color="#7C5CFF"
            onPress={() => router.push('/conversation')}
          />
          <QuickCard
            icon="📖"
            label={t('screens.home.qVocab', 'Vocab ara')}
            sub={t('screens.home.qVocabSub', '1300+ terim')}
            color="#2EA8FF"
            onPress={() => router.push('/vocab')}
          />
          <QuickCard
            icon="🔊"
            label={t('screens.home.qPronounce', 'Telaffuz')}
            sub={t('screens.home.qPronounceSub', 'Score ring')}
            color="#F2C14E"
            onPress={() => router.push('/pronunciation/p1')}
          />
        </View>

        {/* Word of the flight */}
        <Eyebrow style={{ marginTop: 18 }}>{t('screens.home.wordOfFlight')}</Eyebrow>
        <Card3D style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 30,
                  fontWeight: '700',
                  letterSpacing: -0.6,
                  color: '#0E1116',
                }}
              >
                squawk
              </Text>
              <Mono style={{ fontSize: 12, color: '#8A93A6', marginTop: -2 }}>
                /skwɒk/ · verb
              </Mono>
              <Body style={{ fontSize: 14, marginTop: 8 }}>
                To set a 4-digit transponder code as instructed by ATC.
              </Body>
              <View
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: '#E63946',
                  paddingLeft: 10,
                  marginTop: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: '#0E1116',
                  }}
                >
                  "Turkish 1453, squawk 7421."
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#0F1E47',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🔊</Text>
            </TouchableOpacity>
          </View>
        </Card3D>
      </ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════

function StatPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <View>
        <Text
          style={{
            fontFamily: FONTS.body800,
            fontSize: 13,
            color: '#FFFFFF',
            lineHeight: 14,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 9,
            letterSpacing: 0.9,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            marginTop: 2,
            lineHeight: 9,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function FlightPlanRow({
  state,
  title,
  meta,
  time,
  hasBorder,
}: {
  state: 'done' | 'current';
  title: string;
  meta: string;
  time?: string;
  hasBorder?: boolean;
}) {
  const config = {
    done: { bg: '#2DBE6C', shadow: '#1FA35A', icon: '✓' },
    current: { bg: '#E63946', shadow: '#C8202E', icon: '✈' },
  }[state];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
        borderTopWidth: hasBorder ? 1 : 0,
        borderTopColor: '#DCE0E8',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: config.bg,
          borderBottomWidth: 3,
          borderBottomColor: config.shadow,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22 }}>{config.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>{title}</Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 12, color: '#5A6478', marginTop: 2 }}>
          {meta}
        </Text>
      </View>
      {time && (
        <Mono style={{ fontSize: 12, color: '#8A93A6' }}>{time}</Mono>
      )}
      {state === 'current' && (
        <Text style={{ fontSize: 20, color: '#E63946' }}>›</Text>
      )}
    </View>
  );
}

function QuickCard({
  icon,
  label,
  sub,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sub}`}
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4.5,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 18, color: '#FFFFFF' }}>{icon}</Text>
      </View>
      <Text style={{ fontFamily: FONTS.body800, fontSize: 13, color: '#0E1116' }}>{label}</Text>
      <Text style={{ fontFamily: FONTS.body, fontSize: 11, color: '#5A6478', marginTop: 2 }}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}
