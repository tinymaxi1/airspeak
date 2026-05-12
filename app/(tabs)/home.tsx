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
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSrsStore } from '@/stores/srsStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { useActivityStore } from '@/stores/activityStore';
import { useNextLesson } from '@/features/content/api';
import type { UserRole } from '@/types/profile';
import { CompetitionBanner } from '@/components/competitions/CompetitionBanner';
import { TrialCountdownChip } from '@/components/trial/TrialCountdownChip';
import { LimitedOfferBanner } from '@/components/offers/LimitedOfferBanner';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadCount } from '@/features/notifications/api';
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
import { TabletShell } from '@/components/tablet';

export default function HomeScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const role = useOnboardingStore((s) => s.role) as UserRole | null;
  const placement = useOnboardingStore((s) => s.placementResult);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const completedIds = useProgressStore((s) => s.completedLessonIds);
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  // DB'den bir sonraki tamamlanmamış ders'i getir
  const { data: nextLesson } = useNextLesson(role, completedSet);

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

  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const unreadCount = useUnreadCount(userId);

  // Saate göre selamlama + isim (full_name'in ilk kelimesi).
  // Fallback chain: full_name → "havacı" / "aviator" (i18n)
  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || t('screens.home.greetingFallback', 'havacı');
  const hour = new Date().getHours();
  const greetingKey =
    hour < 6
      ? 'screens.home.greetingLateNight'
      : hour < 12
        ? 'screens.home.greetingMorning'
        : hour < 18
          ? 'screens.home.greetingDay'
          : 'screens.home.greetingEvening';
  const greetingDefault =
    hour < 6
      ? `İyi geceler, ${firstName}.`
      : hour < 12
        ? `Günaydın, ${firstName}.`
        : hour < 18
          ? `İyi günler, ${firstName}.`
          : `İyi akşamlar, ${firstName}.`;
  const greeting = t(greetingKey, { name: firstName, defaultValue: greetingDefault });

  // Hafta numarası — profile.created_at'tan hesaplanır. Yeni hesap → HAFTA 1.
  const weekNumber = (() => {
    const createdAt = profile?.created_at;
    if (!createdAt) return 1;
    const ms = Date.now() - new Date(createdAt).getTime();
    if (!Number.isFinite(ms) || ms < 0) return 1;
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    return Math.max(1, Math.floor(days / 7) + 1);
  })();

  // Avatar baş harf(ler)i: tek kelime → "K", iki+ kelime → "KD"
  // avatar_url varsa Avatar component zaten foto'yu render eder, initial sadece fallback.
  const avatarInitials = (() => {
    const name = profile?.full_name?.trim();
    if (!name) return 'P';
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'P';
    if (words.length === 1) return words[0]!.charAt(0).toUpperCase();
    return (words[0]!.charAt(0) + words[words.length - 1]!.charAt(0)).toUpperCase();
  })();
  const streak = useGamificationStore((s) => s.currentStreak ?? 0);
  const hearts = useGamificationStore((s) => s.hearts ?? 5);
  const xp = useGamificationStore((s) => s.totalXp ?? 0);
  const refillHearts = useGamificationStore((s) => s.refillHearts);

  // Sprint 14.B.3 — Home her açılışında heart regen kontrolü
  useEffect(() => {
    refillHearts();
  }, [refillHearts]);
  const level = placement?.generalEnglish?.label ?? placement?.level ?? 'B1';

  // İlk kullanıcı kontrolü: hiç ders tamamlamadı + XP 0
  const isFirstTime = completedIds.length === 0 && xp === 0;

  return (
    <TabletShell background={c.bg}>
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* ═══════════ HEADER — navy topo strip ═══════════ */}
      <View style={{ backgroundColor: '#0F1E47', position: 'relative', overflow: 'hidden' }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingTop: 8, paddingHorizontal: 16, paddingBottom: 18 }}>
            {/* Topo glow background — sadece cyan, kırmızı RN-svg'da kare render oluyordu */}
            <View
              style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
              pointerEvents="none"
            >
              <Svg
                width="100%"
                height="100%"
                viewBox="0 0 393 200"
                preserveAspectRatio="xMidYMid slice"
              >
                <Defs>
                  <RadialGradient id="topoGlow" cx="0%" cy="0%" r="100%">
                    <Stop offset="0%" stopColor="rgba(91,192,255,0.18)" />
                    <Stop offset="100%" stopColor="rgba(91,192,255,0)" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="393" height="200" fill="url(#topoGlow)" />
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
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 10,
                    letterSpacing: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('screens.home.fltDay', { day: streak })}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: -0.44,
                    marginTop: 2,
                  }}
                >
                  {greeting}
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
                {/* Phase 4 Block 1.A — Dictionary 📖 silindi
                    (Vocab artık Learn 3-segment'in tek primary gateway'i;
                    iki erişim yolu UX borç idi) */}
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
                  {/* Unread badge — sayı varsa göster */}
                  {unreadCount > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        minWidth: 16,
                        height: 16,
                        paddingHorizontal: 4,
                        borderRadius: 8,
                        backgroundColor: '#E63946',
                        borderWidth: 1.5,
                        borderColor: '#0F1E47',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 9,
                          fontWeight: '700',
                          lineHeight: 11,
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Avatar
                  initials={avatarInitials}
                  imageUrl={profile?.avatar_url ?? undefined}
                  color="#E63946"
                  size={44}
                />
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
        {/* Limited offer banner — aktif offer + audience match ise (kendi marginini yönetir) */}
        <LimitedOfferBanner />

        {/* Trial countdown — sadece subscription_status='trialing' ise (kendi marginini yönetir) */}
        <TrialCountdownChip />

        {/* Aktif yarışma banner (varsa, en başta) */}
        <View style={{ marginBottom: 14 }}>
          <CompetitionBanner />
        </View>

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
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Eyebrow>{t('screens.home.today')}</Eyebrow>
              <Mono style={{ fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                IST <Text style={{ color: '#8A93A6' }}>—————</Text> JFK
              </Mono>
              <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 4, lineHeight: 15 }}>
                {t('screens.home.todaySub', 'Bugün için seçilmiş 3 hızlı görev (5-15 dk)')}
              </Body>
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

          {/* Lesson list — gerçek son aktiviteler + bir sonraki ders */}
          <View style={{ padding: 16 }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((a, idx) => (
                <FlightPlanRow
                  key={a.id}
                  state="done"
                  title={a.titleTr}
                  meta={a.subtitleTr ?? ''}
                  hasBorder={idx > 0}
                />
              ))
            ) : (
              <FlightPlanRow
                state="done"
                title={t('screens.home.noActivityYet', 'Henüz aktivite yok')}
                meta={t('screens.home.startFirstLesson', 'İlk dersini aç')}
              />
            )}
            <FlightPlanRow
              state="current"
              title={
                nextLesson?.title_tr ??
                nextLesson?.title ??
                t('screens.home.allLessonsDone', 'Tüm dersler tamam')
              }
              meta={
                nextLesson
                  ? t('screens.home.lessonMeta', {
                      min: nextLesson.estimated_minutes,
                      defaultValue: '~{{min}} dk · co-pilot AI ile canlı',
                    })
                  : t('screens.home.continueOther', 'Pratik bölümünden devam et')
              }
              hasBorder={recentActivity.length > 0}
            />
          </View>

          {/* Resume button */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => {
                recordDailyActivity();
                if (nextLesson) {
                  router.push({ pathname: '/lesson/[id]', params: { id: nextLesson.slug } });
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
        <Eyebrow>{t('screens.home.weekRoute', { week: weekNumber, defaultValue: 'HAFTA {{week}} · YOLDA' })}</Eyebrow>
        <Card3D style={{ padding: 14, marginTop: 8, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {(() => {
              const labels = t('screens.home.weekDays', {
                returnObjects: true,
                defaultValue: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'],
              }) as string[];
              // Pazartesi=0 ... Pazar=6 indeksi (getDay: 0=Pazar, 1=Pazartesi).
              const todayDow = new Date().getDay();
              const todayIndex = (todayDow + 6) % 7;
              // states:
              //   'done'    → geçmiş + streak içinde (tamamlandı)
              //   'missed'  → geçmiş + streak dışı (kaçırıldı)
              //   'current' → bugün (aktif, alev)
              //   'future'  → gelecek (gri, gün rakamı, ASLA ✓)
              return labels.map((d, i) => {
                let s: 'done' | 'missed' | 'current' | 'future';
                if (i === todayIndex) s = 'current';
                else if (i < todayIndex) {
                  const daysAgo = todayIndex - i;
                  s = daysAgo <= streak ? 'done' : 'missed';
                } else {
                  s = 'future';
                }
                const bg =
                  s === 'done' ? '#2DBE6C'
                    : s === 'current' ? '#E63946'
                      : s === 'missed' ? 'rgba(230,57,70,0.12)'
                        : '#E9E6DD';
                const fg =
                  s === 'future' || s === 'missed' ? '#8A93A6' : '#FFFFFF';
                const glyph =
                  s === 'done' ? '✓'
                    : s === 'current' ? '🔥'
                      : s === 'missed' ? '✗'
                        : String(i + 1);
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 11,
                        color: s === 'current' ? '#E63946' : '#8A93A6',
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
                        backgroundColor: bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: s === 'current' ? 2 : 0,
                        borderColor: '#E63946',
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: fg }}>
                        {glyph}
                      </Text>
                    </View>
                  </View>
                );
              });
            })()}
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8', paddingTop: 10 }}>
            <Body style={{ fontSize: 13, color: '#5A6478', textAlign: 'center' }}>
              {t('screens.home.perfectWeek', {
                days: 4,
                defaultValue: 'Mükemmel hafta rozetine {{days}} gün kaldı.',
              })}
            </Body>
          </View>
        </Card3D>

        {/* Section sıralaması (Fix 8): Today → Week → Fast Practice → Career → Review → Word.
            Career + Review Queue Word of Flight'tan önce aşağıya taşındı.
            'KALDIĞIN YER' (Fix 7) kaldırıldı — recentActivity Bugünkü Plan card'ında kalır. */}

        {/* Quick practice 2x2 — tasarım grid: red·sky / purple·gold */}
        <Eyebrow style={{ marginTop: dueCount > 0 ? 18 : 0 }}>
          {t('screens.home.fastPractice', 'HIZLI ALIŞTIRMA — 90 SN')}
        </Eyebrow>
        <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 4, marginBottom: 4, lineHeight: 15 }}>
          {t('screens.home.fastPracticeSub', 'Kısa, odaklı seanslar — mola arası ideal')}
        </Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          <QuickCard
            icon="🎙"
            label={t('screens.home.qReadback', 'Telsiz tekrarı')}
            sub={t('screens.home.qReadbackSub', 'ATC izinleri')}
            color="#E63946"
            onPress={() => router.push('/readback')}
          />
          <QuickCard
            icon="🎧"
            label={t('screens.home.qListen', 'Dinle & çöz')}
            sub={t('screens.home.qListenSub', 'Parazitli telsiz')}
            color="#2EA8FF"
            onPress={() => router.push({ pathname: '/practice', params: { category: 'listening' } })}
          />
          <QuickCard
            icon="🤖"
            label={t('screens.home.qAi', 'AI ile rol yap')}
            sub={t('screens.home.qAiSub', 'Bekleme deseni')}
            color="#7C5CFF"
            onPress={() => router.push('/conversation')}
          />
          <QuickCard
            icon="🔊"
            label={t('screens.home.qPronounce', 'Telaffuz')}
            sub={t('screens.home.qPronounceSub', 'Sayılar 0-9')}
            color="#F2C14E"
            onPress={() => router.push('/pronunciation/p1')}
          />
        </View>

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
            marginTop: 18,
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
              {t('screens.home.careerSub', 'ICAO 4 sınavı + mülakat hazırlığı + havayolu cohort')}
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
              marginTop: 12,
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

        {/* Word of the flight */}
        <Eyebrow style={{ marginTop: 18 }}>{t('screens.home.wordOfFlight')}</Eyebrow>
        <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 4, marginBottom: 4, lineHeight: 15 }}>
          {t('screens.home.wordOfFlightSub', 'Her gün yeni bir havacılık terimi')}
        </Body>
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
    </TabletShell>
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
