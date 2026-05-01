/**
 * ICAO 4 oral exam history — kullanıcının geçmiş attempt'ları.
 *
 * - useUserOralHistory(userId, 30): son 30 attempt
 * - List: tarih · task_type · band score · provider
 * - Tap → /exam/icao4-result?attemptId=X
 * - Skill radar (son 10 attempt ortalama) header'da inline
 */
import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useUserOralHistory,
  aggregateRubric,
  type OralExamAttempt,
} from '@/features/oral/api';
import { SkillRadar } from '@/components/oral/SkillRadar';
import { FONTS, Mono, Body } from '@/components/airspeak';

const TASK_LABEL: Record<string, string> = {
  picture_description: 'Resim tasviri',
  story_telling: 'Hikâye anlatma',
  problem_solving: 'Problem çözme',
  common_topics: 'Genel konular',
};

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}sn`;
  if (d < 3600) return `${Math.floor(d / 60)}dk`;
  if (d < 86400) return `${Math.floor(d / 3600)}sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

function bandColor(band: number | null | undefined): string {
  if (band === null || band === undefined) return '#8A93A6';
  if (band >= 5) return '#2DBE6C';
  if (band >= 4) return '#1F8B4D';
  return '#E63946';
}

export default function ICAO4HistoryScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const { rows, loading, refresh } = useUserOralHistory(userId, 30);
  const [refreshing, setRefreshing] = useState(false);

  // Skill radar — sadece evaluated + rubric'i olanlar (son 10)
  const recentEvaluated = useMemo(
    () =>
      rows
        .filter((r) => r.evaluated_at && r.rubric)
        .slice(0, 10),
    [rows],
  );
  const aggregated = useMemo(() => aggregateRubric(recentEvaluated), [recentEvaluated]);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

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
              ICAO 4 ORAL · {rows.length} ATTEMPT
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}>
              Geçmiş denemeler
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {loading && rows.length === 0 ? (
          <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
            Yükleniyor…
          </Body>
        ) : rows.length === 0 ? (
          <View style={{ marginTop: 60, alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 48 }}>🎙</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', maxWidth: 260 }}>
              Henüz oral exam denemen yok. ICAO 4'ten başla.
            </Body>
          </View>
        ) : (
          <>
            {/* Skill radar (son 10 ortalama) */}
            {aggregated && (
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
                  alignItems: 'center',
                }}
              >
                <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
                  SON {recentEvaluated.length} DENEMENİN ORTALAMASI
                </Mono>
                <SkillRadar rubric={aggregated} size={220} />
              </View>
            )}

            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
              TÜM DENEMELER
            </Mono>

            {rows.map((r) => (
              <AttemptRow key={r.id} attempt={r} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function AttemptRow({ attempt }: { attempt: OralExamAttempt }) {
  const evaluated = attempt.evaluated_at && attempt.rubric;
  const taskLabel = TASK_LABEL[(attempt as any).task_type ?? ''] ?? 'Oral exam';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/exam/icao4-result?attemptId=${attempt.id}` as any)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: bandColor(attempt.band_score),
          backgroundColor: `${bandColor(attempt.band_score)}11`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 18,
            fontWeight: '700',
            color: bandColor(attempt.band_score),
          }}
        >
          {attempt.band_score ? `L${attempt.band_score}` : '—'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}
          numberOfLines={1}
        >
          {taskLabel}
        </Text>
        <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 2 }}>
          {relTime(attempt.attempted_at)}
          {attempt.duration_seconds ? ` · ${attempt.duration_seconds}sn` : ''}
          {attempt.provider ? ` · ${attempt.provider}` : ''}
        </Mono>
        {!evaluated && (
          <Mono style={{ fontSize: 10, color: '#F2C14E', letterSpacing: 0.8, marginTop: 2 }}>
            ⏱ EVALUATING
          </Mono>
        )}
        {attempt.review_status === 'pending' && (
          <Mono style={{ fontSize: 10, color: '#F2C14E', letterSpacing: 0.8, marginTop: 2 }}>
            ⏱ MOD REVIEW
          </Mono>
        )}
        {attempt.review_status === 'overridden' && (
          <Mono style={{ fontSize: 10, color: '#2DBE6C', letterSpacing: 0.8, marginTop: 2 }}>
            ✓ MOD ONAYLI
          </Mono>
        )}
      </View>

      <Text style={{ fontSize: 16, color: '#8A93A6' }}>›</Text>
    </TouchableOpacity>
  );
}
