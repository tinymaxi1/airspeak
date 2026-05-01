/**
 * Settings → Daily plan — günlük hedef dakika + çalışma hatırlatıcısı saati.
 */
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  fetchUserSettings,
  updateUserSettings,
  updateDailyGoalMinutes,
} from '@/features/settings/api';
import { supabase } from '@/lib/supabase';
import { Eyebrow, Mono, Body, FONTS, BackButton } from '@/components/airspeak';

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function DailyPlanSettingsScreen() {
  const { t } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [reminderHour, setReminderHour] = useState<number | null>(null);
  const [goalMinutes, setGoalMinutes] = useState<number>(profile?.daily_goal_minutes ?? 15);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    void (async () => {
      const us = await fetchUserSettings(userId);
      if (us) setReminderHour(us.study_reminder_hour);
      setLoading(false);
    })();
  }, [userId]);

  async function changeGoal(m: number) {
    if (!userId) return;
    setGoalMinutes(m);
    const r = await updateDailyGoalMinutes(userId, m);
    if (r.ok) {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    } else {
      Alert.alert(t('common.error', 'Hata'), r.error ?? '');
      setGoalMinutes(profile?.daily_goal_minutes ?? 15);
    }
  }

  async function changeHour(h: number | null) {
    if (!userId) return;
    setReminderHour(h);
    const r = await updateUserSettings(userId, { study_reminder_hour: h });
    if (!r.ok) {
      Alert.alert(t('common.error', 'Hata'), r.error ?? '');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.dailyPlan.title', 'Günlük Plan')}
          </Text>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F1E47" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* HEDEF */}
          <Eyebrow>{t('settings.dailyPlan.goalEyebrow', 'GÜNLÜK HEDEF')}</Eyebrow>
          <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
            {t('settings.dailyPlan.goalBody', 'Streak\'in için günde kaç dakika hedefliyorsun?')}
          </Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_OPTIONS.map((m) => {
              const sel = goalMinutes === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => changeGoal(m)}
                  activeOpacity={0.85}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: sel ? '#0F1E47' : '#FFFFFF',
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: sel ? '#0F1E47' : '#DCE0E8',
                    minWidth: 64,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 15,
                      color: sel ? '#FFD56B' : '#0E1116',
                    }}
                  >
                    {m} dk
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* HATIRLATICI */}
          <Eyebrow style={{ marginTop: 28 }}>
            {t('settings.dailyPlan.reminderEyebrow', 'ÇALIŞMA HATIRLATICISI')}
          </Eyebrow>
          <Body color="#5A6478" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
            {t(
              'settings.dailyPlan.reminderBody',
              'Her gün belirlenen saatte "Bugün dersini yap" push gelir. Kapatmak için temizle.',
            )}
          </Body>

          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Text style={{ fontSize: 28 }}>⏰</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 16, color: '#0E1116' }}>
                {reminderHour === null
                  ? t('settings.dailyPlan.notSet', 'Ayarlanmamış')
                  : `${String(reminderHour).padStart(2, '0')}:00`}
              </Text>
              <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                {reminderHour === null
                  ? t('settings.dailyPlan.tapSet', 'Saat seç')
                  : t('settings.dailyPlan.everyDay', 'her gün')}
              </Body>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Stepper
                onPress={() => {
                  const next = reminderHour === null ? 19 : reminderHour === 0 ? null : reminderHour - 1;
                  changeHour(next);
                }}
                label="−"
              />
              <Stepper
                onPress={() => {
                  const next = reminderHour === null ? 19 : reminderHour === 23 ? null : reminderHour + 1;
                  changeHour(next);
                }}
                label="+"
              />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Stepper({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontSize: 20, color: '#0F1E47' }}>{label}</Text>
    </TouchableOpacity>
  );
}
