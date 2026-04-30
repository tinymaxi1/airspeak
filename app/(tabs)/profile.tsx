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
import {
  useUserExperiences,
  useUserEducation,
  useUserCertifications,
  useUserTypeRatings,
} from '@/features/profile/api';
import { useBadgeTemplates, useUserBadges } from '@/features/badges/api';
import { useUserXpSummary, useLeagueMembership } from '@/features/league/api';
import { useUserChampionships } from '@/features/league/championships';
import { LeagueChip } from '@/components/profile/LeagueChip';
import { ChampionshipsSection } from '@/components/profile/ChampionshipsSection';
import { Hero } from '@/components/profile/Hero';
import { StatStrip } from '@/components/profile/StatStrip';
import { LevelMap } from '@/components/profile/LevelMap';
import {
  ActivityHeatmap,
  type HeatmapBucket,
} from '@/components/profile/ActivityHeatmap';
import { DynamicGreeting } from '@/components/profile/DynamicGreeting';
import { SummaryCard } from '@/components/profile/SummaryCard';
import {
  BioSection,
  ExperienceTimeline,
  EducationSection,
  CertificationsSection,
  TypeRatingsSection,
  AviationLevelSection,
  SocialGrid,
} from '@/components/profile/ProfileSections';
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
  const localTotalXp = useGamificationStore((s) => s.totalXp ?? 0);
  const localStreak = useGamificationStore((s) => s.currentStreak ?? 0);
  // DB source of truth (Sprint 4B.2). Yoksa local fallback.
  const { row: xpSummary } = useUserXpSummary(user?.id);
  const { membership: lgMembership, group: lgGroup } = useLeagueMembership(user?.id);
  const { rows: championships } = useUserChampionships(user?.id);
  const totalXp = xpSummary?.total_xp ?? localTotalXp;
  const currentStreak = localStreak; // streak DB henüz lazy sync — local first
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const history = useLessonHistoryStore((s) => s.history);
  const { badges: badgeTemplates } = useBadgeTemplates();
  const { rows: userBadges } = useUserBadges(user?.id);
  const { rows: experiences } = useUserExperiences(user?.id);
  const { rows: education } = useUserEducation(user?.id);
  const { rows: certifications } = useUserCertifications(user?.id);
  const { rows: typeRatings } = useUserTypeRatings(user?.id);

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

  // Rozet sayısı — DB'den (gerçek user_badges count)
  const earnedBadges = userBadges.length;
  const earnedIdSet = useMemo(
    () => new Set(userBadges.map((u) => u.badge_id)),
    [userBadges],
  );
  const previewBadges = useMemo(() => {
    if (badgeTemplates.length === 0) return [];
    const earned = badgeTemplates.filter((b) => earnedIdSet.has(b.id));
    if (earned.length >= 6) return earned.slice(0, 6);
    // Earned + ilk locked'larla 6'a tamamla
    const locked = badgeTemplates.filter((b) => !earnedIdSet.has(b.id));
    return [...earned, ...locked].slice(0, 6);
  }, [badgeTemplates, earnedIdSet]);

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
            {lgGroup && (
              <View style={{ marginTop: 12 }}>
                <LeagueChip
                  classTier={lgGroup.class_tier}
                  rank={lgMembership?.rank ?? null}
                />
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Profesyonel özet + completion CTA */}
        {profile && (
          <View style={{ marginBottom: 18 }}>
            <SummaryCard
              position={profile.position}
              company={profile.company}
              baseAirport={profile.base_airport}
              city={profile.city}
              country={profile.country}
              bioShort={profile.bio_short}
              completionPercent={profile.profile_completion_percent}
            />
          </View>
        )}

        {/* Stat strip — 3 hücre */}
        <View style={{ marginBottom: 18 }}>
          <StatStrip
            totalXp={totalXp}
            currentStreak={currentStreak}
            badgeCount={earnedBadges}
            leagueRank={lgMembership?.rank ?? null}
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

        {/* Sprint 4C — Şampiyonluklar (en son 3) */}
        {championships.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <ChampionshipsSection rows={championships} />
          </View>
        )}

        {/* Sprint 3c-B detay bölümleri */}
        {profile?.bio_long ? (
          <View style={{ marginBottom: 18 }}>
            <BioSection bioLong={profile.bio_long} />
          </View>
        ) : null}

        <View style={{ marginBottom: 18 }}>
          <AviationLevelSection
            icaoLevel={profile?.icao_english_level ?? null}
            experienceYears={profile?.aviation_experience_years ?? null}
          />
        </View>

        <View style={{ marginBottom: 18 }}>
          <ExperienceTimeline items={experiences} />
        </View>

        <View style={{ marginBottom: 18 }}>
          <EducationSection items={education} />
        </View>

        <View style={{ marginBottom: 18 }}>
          <CertificationsSection items={certifications} />
        </View>

        {(role === 'pilot' || typeRatings.length > 0) && (
          <View style={{ marginBottom: 18 }}>
            <TypeRatingsSection items={typeRatings} />
          </View>
        )}

        <View style={{ marginBottom: 18 }}>
          <SocialGrid
            linkedinUrl={profile?.linkedin_url ?? null}
            instagram={profile?.instagram ?? null}
            twitter={profile?.twitter ?? null}
            youtube={profile?.youtube ?? null}
            facebook={profile?.facebook ?? null}
            website={profile?.website ?? null}
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

        {/* Badges — DB'den ilk 6 (earned + locked'larla 6'a tamamlanır) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow>{t('screens.profile.badges')}</Eyebrow>
          <TouchableOpacity onPress={() => router.push('/profile/badges')} hitSlop={8}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#E63946' }}>
              {t('screens.profile.badgesViewAll', 'Tümünü gör →')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 18 }}>
          {previewBadges.map((b) => (
            <BadgeCell
              key={b.id}
              emoji={b.icon_emoji}
              name={b.name_tr}
              earned={earnedIdSet.has(b.id)}
            />
          ))}
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
          <SettingsRow
            icon="👥"
            label={t('screens.profile.friends', 'Arkadaşlar')}
            value={t('screens.profile.friendsDesc', 'Kullanıcı adıyla ekle, sıralamayı gör')}
            onPress={() => router.push('/social/friends')}
          />
          <SettingsRow
            icon="✈️"
            label={t('screens.profile.squadrons', 'Squadrons')}
            value={t('screens.profile.squadronsDesc', 'Squadron oluştur, katıl, takımca yarış')}
            onPress={() => router.push('/social/squadrons')}
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
