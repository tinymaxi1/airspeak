/**
 * Profile Screen — Pilot Logbook
 *
 * Tasarım birebir (screens-other.jsx Profile):
 * - Header: navy + avatar + "Captain Ekrem" + callsign + role
 * - Stats grid: XP / Streak / Level / Lessons (4 hücre)
 * - Heatmap: 7x12 grid (12 hafta) — green/red/empty
 * - Badges row (3-4 earned + locked)
 * - Settings link, Language link, Logout
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/features/auth/api';
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
  StreakChip,
} from '@/components/airspeak';
import { getCurrentLanguage } from '@/lib/i18n';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const role = useOnboardingStore((s) => s.role);
  const placement = useOnboardingStore((s) => s.placementResult);
  const totalXp = useGamificationStore((s) => s.totalXp ?? 0);
  const currentStreak = useGamificationStore((s) => s.currentStreak ?? 0);
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const lang = getCurrentLanguage();

  const level = placement?.generalEnglish?.label ?? placement?.level ?? 'B1';
  const username = user?.email?.split('@')[0] ?? 'pilot';
  const initials = username.slice(0, 2).toUpperCase();

  const roleLabel = {
    pilot: 'Pilot',
    cabin: 'Cabin Crew',
    technician: 'Technician',
    ground: 'Ground Ops',
    student: 'Student',
  }[role ?? 'student'];

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
          <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Avatar initials={initials} color="#E63946" size={64} />
              <View style={{ flex: 1 }}>
                <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
                  {t('screens.profile.captain')}
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: -0.52,
                    marginTop: 2,
                    lineHeight: 28,
                  }}
                >
                  {username}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Mono style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 0.88 }}>
                      {roleLabel}
                    </Mono>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#F2C14E',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Mono style={{ fontSize: 11, color: '#0A1430', letterSpacing: 0.88 }}>
                      LEVEL {level}
                    </Mono>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Stats grid — 4 cells */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
          <StatCell label={t('screens.profile.xp')} value={totalXp.toLocaleString()} accent="#E63946" />
          <StatCell label={t('screens.profile.streak')} value={`${currentStreak}d`} accent="#FF7847" />
          <StatCell label={t('screens.profile.level')} value={level} accent="#0F1E47" />
          <StatCell label={t('screens.profile.lessons')} value={String(completedCount)} accent="#2DBE6C" />
        </View>

        {/* Heatmap — 12 hafta x 7 gün */}
        <Eyebrow>{t('screens.profile.flightLog')}</Eyebrow>
        <Card3D style={{ marginTop: 8, marginBottom: 18, padding: 14 }}>
          <View style={{ gap: 4 }}>
            {Array.from({ length: 7 }).map((_, dayIdx) => (
              <View key={dayIdx} style={{ flexDirection: 'row', gap: 4 }}>
                {Array.from({ length: 12 }).map((_, weekIdx) => {
                  const seed = (dayIdx * 13 + weekIdx * 7) % 100;
                  const intensity = seed > 70 ? 'high' : seed > 40 ? 'mid' : seed > 15 ? 'low' : 'none';
                  const color = {
                    high: '#2DBE6C',
                    mid: '#4FD487',
                    low: '#DDF7E6',
                    none: '#EDEFF3',
                  }[intensity];
                  return (
                    <View
                      key={weekIdx}
                      style={{
                        flex: 1,
                        height: 14,
                        borderRadius: 3,
                        backgroundColor: color,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
            <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>{t('screens.profile.less')}</Mono>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {['#EDEFF3', '#DDF7E6', '#4FD487', '#2DBE6C'].map((c) => (
                <View key={c} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c }} />
              ))}
            </View>
            <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>{t('screens.profile.more')}</Mono>
          </View>
        </Card3D>

        {/* Badges */}
        <Eyebrow>{t('screens.profile.badges')}</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, marginBottom: 18 }}>
          <BadgeCell emoji="🎙" name="Read-back Pro" earned />
          <BadgeCell emoji="🔥" name="7-day streak" earned />
          <BadgeCell emoji="✈" name="100 lessons" earned />
          <BadgeCell emoji="🏆" name="ICAO L4" />
          <BadgeCell emoji="👑" name="League Capt." />
          <BadgeCell emoji="⚡" name="Speed run" />
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
            icon="✈"
            label={t('screens.profile.myExams')}
            value={t('screens.profile.myExamsDesc')}
            onPress={() => router.push('/exam')}
          />
          <SettingsRow
            icon="💼"
            label={t('screens.profile.interviews')}
            value={t('screens.profile.interviewsDesc', { count: 31 })}
            onPress={() => router.push('/exam/airlines')}
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

function StatCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        borderBottomWidth: 4,
        padding: 14,
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 28,
          fontWeight: '700',
          color: accent,
          letterSpacing: -0.56,
          marginTop: 4,
          lineHeight: 30,
        }}
      >
        {value}
      </Text>
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
