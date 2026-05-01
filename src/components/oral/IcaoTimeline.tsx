/**
 * IcaoTimeline — son N evaluated attempt'ı dikey timeline.
 *
 * Sol: dot (band-renkli L band) — sağ: tarih + task type + provider hint.
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import type { OralExamAttempt } from '@/features/oral/api';
import { FONTS, Mono } from '@/components/airspeak';

interface Props {
  attempts: OralExamAttempt[];
  limit?: number;
}

function bandColor(band: number | null | undefined): string {
  if (band === null || band === undefined) return '#8A93A6';
  if (band >= 5) return '#2DBE6C';
  if (band >= 4) return '#1F8B4D';
  return '#E63946';
}

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 86400) return `bugün`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)} gün önce`;
  if (d < 30 * 86400) return `${Math.floor(d / 86400 / 7)} hafta önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

export function IcaoTimeline({ attempts, limit = 8 }: Props) {
  const evaluated = attempts
    .filter((a) => a.evaluated_at && a.band_score)
    .slice(0, limit);

  if (evaluated.length === 0) {
    return null;
  }

  return (
    <View style={{ paddingVertical: 4 }}>
      {evaluated.map((a, i) => {
        const isLast = i === evaluated.length - 1;
        const color = bandColor(a.band_score);
        return (
          <TouchableOpacity
            key={a.id}
            activeOpacity={0.85}
            onPress={() => router.push(`/exam/icao4-result?attemptId=${a.id}` as any)}
            style={{ flexDirection: 'row', gap: 12 }}
          >
            {/* Timeline rail */}
            <View style={{ alignItems: 'center', width: 28 }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: color,
                  backgroundColor: `${color}11`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.body800,
                    fontSize: 10,
                    color,
                  }}
                >
                  L{a.band_score}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={{
                    width: 1.5,
                    flex: 1,
                    minHeight: 20,
                    backgroundColor: '#DCE0E8',
                    marginTop: 2,
                  }}
                />
              )}
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
                Band L{a.band_score}{' '}
                {(a.band_score ?? 0) >= 4 ? '✓ Operational' : '✗ Below operational'}
              </Text>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 2 }}>
                {relTime(a.evaluated_at!)} · {a.provider ?? '—'}
                {a.review_status === 'overridden' && ' · MOD'}
                {a.duration_seconds && ` · ${a.duration_seconds}sn`}
              </Mono>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
