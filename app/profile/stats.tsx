/**
 * Profile detaylı istatistik ekranı.
 *
 * Bölümler (yukarıdan aşağı):
 *   1. Hedefler kartı (3 progress bar) + edit modal
 *   2. XP trendi (12 hafta line)
 *   3. Çalışma dakikası (12 hafta bar)
 *   4. Doğruluk trendi (12 hafta line)
 *   5. En aktif saat (24h heatmap)
 *   6. En aktif gün (7-DOW bar)
 *   7. Aylık özet (son 3 ay)
 *   8. Akran kıyaslaması
 */
import { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/features/profile/useProfile';
import {
  useWeeklyStats,
  useMonthlyStats,
  useHourlyActivity,
  useDowActivity,
  usePeerComparison,
  useGoalsProgress,
  updateUserGoals,
} from '@/features/stats/api';
import { LineChart, BarChart, HourlyHeatmap } from '@/components/stats/Charts';
import { GoalsCard, PeerCard, MonthlyCards } from '@/components/stats/InfoCards';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

const DOW_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function fmtWeekLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ProfileStatsScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { profile } = useProfile(userId);
  const tz = profile?.timezone ?? 'Europe/Istanbul';

  const { rows: weekly, refresh: refreshWeekly } = useWeeklyStats(userId, 12);
  const { rows: monthly, refresh: refreshMonthly } = useMonthlyStats(userId, 12);
  const { buckets: hourly } = useHourlyActivity(userId, tz, 90);
  const { buckets: dow } = useDowActivity(userId, tz, 90);
  const { peer } = usePeerComparison(userId);
  const { goals, refresh: refreshGoals } = useGoalsProgress(userId);

  const [refreshing, setRefreshing] = useState(false);
  const [goalsEditOpen, setGoalsEditOpen] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refreshWeekly(), refreshMonthly(), refreshGoals()]);
    setRefreshing(false);
  }

  // XP trendi data
  const weeklyXpData = useMemo(
    () => weekly.map((w) => ({ label: fmtWeekLabel(w.week_start), value: w.total_xp })),
    [weekly],
  );
  // Çalışma dakikası
  const weeklyMinutesData = useMemo(
    () =>
      weekly.map((w) => ({
        label: fmtWeekLabel(w.week_start),
        value: Math.round(w.total_seconds / 60),
        highlight: false,
      })),
    [weekly],
  );
  // Doğruluk
  const accuracyData = useMemo(
    () =>
      weekly.map((w) => ({
        label: fmtWeekLabel(w.week_start),
        value: w.accuracy_avg !== null ? Number(w.accuracy_avg) : null,
      })),
    [weekly],
  );
  // DOW
  const dowData = useMemo(() => {
    const max = Math.max(...dow.map((b) => b.lessons_count), 1);
    const peakDow = dow.reduce((p, c) => (c.lessons_count > p.lessons_count ? c : p), dow[0] ?? { dow: 1, lessons_count: 0 });
    return dow.map((b) => ({
      label: DOW_LABELS[b.dow - 1] ?? '?',
      value: b.lessons_count,
      highlight: b.dow === peakDow.dow && b.lessons_count > 0,
    }));
  }, [dow]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              ANALİZ
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}>
              📊 Detaylı İstatistik
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {/* 1. Goals */}
        {goals && (
          <GoalsCard goals={goals} onEdit={() => setGoalsEditOpen(true)} />
        )}

        {/* 2. XP trendi */}
        <Section title="XP TRENDİ (12 HAFTA)">
          <LineChart
            data={weeklyXpData}
            color="#E63946"
            yFormatter={(n) => `${Math.round(n)}`}
          />
        </Section>

        {/* 3. Çalışma dakikası */}
        <Section title="HAFTALIK ÇALIŞMA DAKİKASI">
          <BarChart data={weeklyMinutesData} color="#1F4FB6" />
        </Section>

        {/* 4. Doğruluk */}
        <Section title="DOĞRULUK ORANI (HAFTALIK %)">
          <LineChart
            data={accuracyData}
            color="#2DBE6C"
            yMin={0}
            yMax={100}
            yLabels={[0, 50, 100]}
            threshold={80}
            thresholdLabel="HEDEF %80"
            yFormatter={(n) => `${Math.round(n)}%`}
          />
        </Section>

        {/* 5. Hourly heatmap */}
        <Section title="EN AKTİF SAAT (SON 90 GÜN)">
          <HourlyHeatmap buckets={hourly} />
        </Section>

        {/* 6. DOW */}
        <Section title="EN AKTİF GÜN (SON 90 GÜN)">
          <BarChart data={dowData} color="#7C5CFF" highlightColor="#E63946" />
        </Section>

        {/* 7. Monthly cards */}
        <MonthlyCards rows={monthly} />

        {/* 8. Peer */}
        {peer && <PeerCard peer={peer} />}

        {/* Empty state hint */}
        {weekly.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              padding: 24,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
            }}
          >
            <Text style={{ fontSize: 36 }}>📊</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              Henüz yeterli veri yok. İlk dersini bitirdikten sonra detaylar burada belirir.
            </Body>
          </View>
        )}
      </ScrollView>

      {/* Goals edit modal */}
      <GoalsEditModal
        visible={goalsEditOpen}
        onClose={() => setGoalsEditOpen(false)}
        initial={
          goals
            ? {
                daily: goals.daily_goal_minutes,
                weekly: goals.weekly_goal_xp,
                monthly: goals.monthly_goal_lessons,
              }
            : null
        }
        onSaved={() => {
          void refreshGoals();
          setGoalsEditOpen(false);
        }}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#DCE0E8',
        padding: 14,
      }}
    >
      <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, marginBottom: 10 }}>
        {title}
      </Mono>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

function GoalsEditModal({
  visible,
  onClose,
  initial,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  initial: { daily: number; weekly: number; monthly: number } | null;
  onSaved: () => void;
}) {
  const [daily, setDaily] = useState(String(initial?.daily ?? 15));
  const [weekly, setWeekly] = useState(String(initial?.weekly ?? 1000));
  const [monthly, setMonthly] = useState(String(initial?.monthly ?? 30));
  const [saving, setSaving] = useState(false);

  async function save() {
    const d = Number(daily);
    const w = Number(weekly);
    const m = Number(monthly);
    if (d < 5 || d > 240) {
      Alert.alert('Hata', 'Günlük hedef 5-240 dk arası olmalı');
      return;
    }
    if (w < 0 || w > 100000) {
      Alert.alert('Hata', 'Haftalık XP 0-100k arası');
      return;
    }
    if (m < 0 || m > 1000) {
      Alert.alert('Hata', 'Aylık ders 0-1000 arası');
      return;
    }
    setSaving(true);
    const r = await updateUserGoals({ dailyMinutes: d, weeklyXp: w, monthlyLessons: m });
    setSaving(false);
    if (r.ok) onSaved();
    else Alert.alert('Hata', r.error ?? 'Kaydedilemedi');
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FAFAF7' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#EDEFF3',
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: '#5A6478' }}>İptal</Text>
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: FONTS.body800,
                fontSize: 16,
                color: '#0E1116',
              }}
            >
              🎯 Hedefler
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <GoalField label="GÜNLÜK ÇALIŞMA (DK)" hint="5-240 dk" value={daily} onChange={setDaily} />
            <GoalField label="HAFTALIK XP" hint="0-100000" value={weekly} onChange={setWeekly} />
            <GoalField label="AYLIK DERS" hint="0-1000" value={monthly} onChange={setMonthly} />
          </ScrollView>
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#EDEFF3' }}>
            <Button3D variant="primary" fullWidth disabled={saving} onPress={save}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button3D>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function GoalField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1, marginBottom: 6 }}>{label}</Mono>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        style={{
          borderWidth: 1.5,
          borderColor: '#DCE0E8',
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          fontFamily: FONTS.body700,
          backgroundColor: '#FFFFFF',
          color: '#0E1116',
        }}
      />
      <Body color="#8A93A6" style={{ fontSize: 11, marginTop: 4 }}>
        {hint}
      </Body>
    </View>
  );
}
