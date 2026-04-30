/**
 * Profile Screen — Pilot Logbook
 *
 * Sprint 3a refactor:
 * - DynamicGreeting + Hero (avatar uploadable) — useProfile hook'tan beslenir
 * - StatStrip (XP / Streak / Rozet) — Reanimated entry + count-up
 * - LevelMap — XP bar + milestone marker
 * - ActivityHeatmap (84 gün) — ayrı component, stagger entry
 * - Badges + Settings + SignOut korunur
 */
import { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  useGamificationStore,
  calculateLevelFromXp,
} from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/features/auth/api';
import { useAirlines } from '@/features/content/api';
import { useProfile } from '@/features/profile/useProfile';
import { Hero } from '@/components/profile/Hero';
import { StatStrip } from '@/components/profile/StatStrip';
import { LevelMap } from '@/components/profile/LevelMap';
import {
  ActivityHeatmap,
  type HeatmapBucket,
} from '@/components/profile/ActivityHeatmap';
import { DynamicGreeting } from '@/components/profile/DynamicGreeting';
import {
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';
import { getCurrentLanguage } from '@/lib/i18n';

const HEATMAP_DAYS = 84;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { profile } = useProfile(user?.id);
  const role = useOnboardingStore((s) => s.role);
  const { data: airlines = [] } = useAirlines();
  const placement = useOnboardingStore((s) => s.placementResult);
  const totalXp = useGamificationStore((s) => s.totalXp ?? 0);
  const currentStreak = useGamificationStore((s) => s.currentStreak ?? 0);
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const history = useLessonHistoryStore((s) => s.history);

  const heatmapBuckets = useMemo<HeatmapBucket[]>(() => {
    const map = new Map(history.map((e) => [e.date, e.count]));
    const out: HeatmapBucket[] = [];
    const today = new Date();
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const k = `${y}-${m}-${day}`;
      out.push({ date: k, count: map.get(k) ?? 0 });
    }
    return out;
  }, [history]);

  const activeDayCount = useMemo(
    () => history.filter((e) => e.count > 0).length,
    [history],
  );

  const lang = getCurrentLanguage();

  const placementLevel =
    placement?.generalEnglish?.label ?? placement?.level ?? 'B1';
  const username = profile?.username ?? user?.email?.split('@')[0] ?? 'pilot';
  const displayName = profile?.full_name ?? username;
  const initials = (displayName || username).slice(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url ?? null;

  const roleLabel = {
    pilot: 'Pilot',
    cabin: 'Cabin Crew',
    technician: 'Technician',
    ground: 'Ground Ops',
    student: 'Student',
  }[role ?? 'student'];

  const xpLevel = calculateLevelFromXp(totalXp);

  // Rozet sayısı — mevcut 6 koşullu rozetin earned olanları
  const earnedBadges = [
    completedCount >= 5,
    currentStreak >= 7,
    completedCount >= 100,
    (placement?.aviationEnglish?.label ?? '') === 'L4',
    totalXp >= 4000,
    totalXp >= 1000,
  ].filter(Boolean).length;

  const handleSignOut = () => {
    Alert.alert(t('screens.profile.signOut'), t('screens.profile.signOutConfirm'), [
      { text: t('screens.profile.cancel'), style: 'cancel' },
      {
        text: t('screens.profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* ═══════ NAVY HEADER ═══════ */}
      <View style={{ backgroundColor: '#0F1E47', position: 'relative' }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 }}
            accessibilityRole="header"
            accessibilityLabel={`${roleLabel}, ${displayName}, Level ${placementLevel}`}
          >
            <View style={{ marginBottom: 10 }}>
              <DynamicGreeting name={displayName} streak={currentStreak} />
            </View>
            {user?.id ? (
              <Hero
                userId={user.id}
                displayName={displayName}
                avatarUrl={avatarUrl}
                initials={initials}
                roleLabel={roleLabel}
                level={String(placementLevel)}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Stat strip — 3 hücre */}
        <View style={{ marginBottom: 18 }}>
          <StatStrip
            totalXp={totalXp}
            currentStreak={currentStreak}
            badgeCount={earnedBadges}
          />
        </View>

        {/* Level map */}
        <View style={{ marginBottom: 18 }}>
          <LevelMap
            level={xpLevel.level}
            xpInLevel={xpLevel.xpInLevel}
            xpToNextLevel={xpLevel.xpToNext}
          />
        </View>

        {/* Activity heatmap — 84 gün */}
        <View style={{ marginBottom: 18 }}>
          <ActivityHeatmap
            buckets={heatmapBuckets}
            activeDayCount={activeDayCount}
            flightLogLabel={t('screens.profile.flightLog')}
            activeDaysLabel={t(
              'screens.profile.activeDays',
              '{{n}} aktif gün · 84',
              { n: activeDayCount },
            )}
            emptyLabel={t(
              'screens.profile.heatmapEmpty',
              'Henüz aktivite yok. İlk dersi tamamla, heatmap dolmaya başlasın.',
            )}
            lessLabel={t('screens.profile.less')}
            moreLabel={t('screens.profile.more')}
          />
        </View>

        {/* Badges — gerçek state'ten türetilir */}
        <Eyebrow>{t('screens.profile.badges')}</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 18 }}>
          <BadgeCell emoji="🎙" name={t('screens.profile.badgeReadbackPro', 'Read-back Pro')} earned={completedCount >= 5} />
          <BadgeCell emoji="🔥" name={t('screens.profile.badgeStreak', '7-gün streak')} earned={currentStreak >= 7} />
          <BadgeCell emoji="✈" name={t('screens.profile.badgeLessons', '100 ders')} earned={completedCount >= 100} />
          <BadgeCell emoji="🏆" name={t('screens.profile.badgeIcao', 'ICAO L4')} earned={(placement?.aviationEnglish?.label ?? '') === 'L4'} />
          <BadgeCell emoji="👑" name={t('screens.profile.badgeLeague', 'Lig Captain')} earned={totalXp >= 4000} />
          <BadgeCell emoji="⚡" name={t('screens.profile.badgeSpeed', 'XP 1000')} earned={totalXp >= 1000} />
        </View>

        {/* Settings rows */}
        <Eyebrow>{t('screens.profile.account')}</Eyebrow>
        <View style={{ marginTop: 8, gap: 8, marginBottom: 18 }}>
          <SettingsRow
            icon="⚙"
            label={t('screens.profile.settings')}
            value={t('screens.profile.settingsDesc')}
            onPress={() => router.push('/settings')}
          />
          <SettingsRow
            icon="🔔"
            label={t('screens.profile.notifications')}
            value={t('screens.profile.notificationsDesc', { count: 3 })}
            onPress={() => router.push('/notifications')}
          />
          <SettingsRow
            icon="🌐"
            label={t('screens.profile.language')}
            value={lang === 'tr' ? '🇹🇷 Türkçe' : lang === 'en' ? '🇬🇧 English' : `🌐 ${lang.toUpperCase()}`}
            onPress={() => router.push('/settings/language')}
          />
          <SettingsRow
            icon="🎯"
            label={t('screens.profile.career', 'Kariyer Merkezi')}
            value={t('screens.profile.careerDesc', 'ICAO 4 · {{count}} havayolu · Squadron', { count: airlines.length })}
            onPress={() => router.push('/career')}
          />
          <SettingsRow
            icon="⭐"
            label={t('screens.profile.bookmarks', 'Yer İmleri')}
            value={t('screens.profile.bookmarksDesc', 'Kaydettiğin vocab ve senaryolar')}
            onPress={() => router.push('/bookmarks')}
          />
        </View>

        {/* Sign out */}
        <Button3D variant="ghost" fullWidth onPress={handleSignOut}>
          {t('screens.profile.signOut')}
        </Button3D>
      </ScrollView>
    </View>
  );
}

function BadgeCell({
  emoji,
  name,
  earned,
}: {
  emoji: string;
  name: string;
  earned?: boolean;
}) {
  return (
    <View
      style={{
        width: '30%',
        backgroundColor: earned ? '#FFFFFF' : '#F4F2EC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: earned ? '#DCE0E8' : '#E9E6DD',
        padding: 12,
        alignItems: 'center',
        opacity: earned ? 1 : 0.5,
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 4 }}>{emoji}</Text>
      <Mono style={{ fontSize: 10, color: '#5A6478', textAlign: 'center', letterSpacing: 0.8 }}>
        {name}
      </Mono>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>{label}</Text>
        <Body style={{ fontSize: 12, marginTop: 2 }}>{value}</Body>
      </View>
      <Text style={{ fontSize: 20, color: '#8A93A6' }}>›</Text>
    </TouchableOpacity>
  );
}
