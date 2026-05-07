/**
 * ICAO L4 Result — gerçek veri (oral_exam_attempts realtime).
 *
 * Param: attemptId
 * - useOralAttempt realtime subscribe → rubric/band/feedback geldiğinde otomatik
 *   render (evaluating loading state'i bitiyor).
 * - PASSED/FAILED stamp band >= 4 ise PASSED.
 * - İtiraz et butonu → request_oral_review RPC (manual review queue).
 * - Yeni deneme → /exam/icao4-briefing.
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mono,
  FONTS,
  Button3D,
} from '@/components/airspeak';
import {
  useOralAttempt,
  requestOralReview,
  type OralRubric,
} from '@/features/oral/api';
import { IcaoDisclaimer } from '@/components/legal/IcaoDisclaimer';

const DESCRIPTOR_META: { key: keyof OralRubric; code: string; name: string }[] = [
  { key: 'pronunciation', code: 'PRO', name: 'Pronunciation' },
  { key: 'structure',     code: 'STR', name: 'Structure' },
  { key: 'vocabulary',    code: 'VOC', name: 'Vocabulary' },
  { key: 'fluency',       code: 'FLU', name: 'Fluency' },
  { key: 'comprehension', code: 'CMP', name: 'Comprehension' },
  { key: 'interactions',  code: 'INT', name: 'Interactions' },
];

export default function ICAO4ResultScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ attemptId: string }>();
  const attemptId = typeof params.attemptId === 'string' ? params.attemptId : '';
  const { attempt, loading } = useOralAttempt(attemptId);
  const [requesting, setRequesting] = useState(false);

  const evaluated = !!attempt?.evaluated_at && !!attempt?.rubric;

  async function onDispute() {
    if (!attemptId) return;
    Alert.alert(
      'Sonuca itiraz et',
      'Cevabın insan moderatör tarafından yeniden değerlendirilecek. 24 saat içinde dönüş yaparız.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'İtiraz et',
          onPress: async () => {
            setRequesting(true);
            const r = await requestOralReview({
              attemptId,
              reason: 'user_disputes_score',
            });
            setRequesting(false);
            if (r.ok) {
              Alert.alert('✓ Talebin alındı', 'Mod ekibi inceleyecek.');
            } else {
              Alert.alert('Hata', r.error ?? 'Tekrar deneyin');
            }
          },
        },
      ],
    );
  }

  // Loading veya henüz evaluated değil
  if (loading || !attempt || !evaluated) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
              <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
            </TouchableOpacity>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
              EVALUATING
            </Mono>
            <Text style={{ fontSize: 22 }}>✦</Text>
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <ActivityIndicator color="#E63946" size="large" />
          <Text
            style={{ fontFamily: FONTS.body700, fontSize: 16, color: '#0E1116', textAlign: 'center' }}
          >
            AI değerlendirmesi yapılıyor…
          </Text>
          <Text
            style={{
              fontFamily: FONTS.body,
              fontSize: 13,
              color: '#5A6478',
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            Examiner cevabını analiz ediyor — pronunciation, structure, vocabulary,
            fluency, comprehension, interactions. Bu birkaç saniye sürer.
          </Text>
        </View>
      </View>
    );
  }

  const rubric = attempt.rubric!;
  const overall = attempt.band_score ?? Math.min(
    rubric.pronunciation,
    rubric.structure,
    rubric.vocabulary,
    rubric.fluency,
    rubric.comprehension,
    rubric.interactions,
  );
  const passed = overall >= 4;

  // En zayıf descriptor (FOCUS tag için)
  let weakest = DESCRIPTOR_META[0]!;
  for (const d of DESCRIPTOR_META) {
    if (rubric[d.key] < rubric[weakest.key]) weakest = d;
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
            <Text style={{ fontSize: 22, color: '#0E1116' }}>✕</Text>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            {t('screens.icao.examComplete', 'EXAM COMPLETE')}
          </Mono>
          <Text style={{ fontSize: 22 }}>✦</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        <View style={{ marginBottom: 12 }}>
          <IcaoDisclaimer compact />
        </View>
        {/* Stamp result card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#0F1E47',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 24,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.8 }}>
              ICAO LEVEL
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 80,
                fontWeight: '700',
                color: '#F2C14E',
                marginTop: 4,
                lineHeight: 84,
              }}
            >
              L{overall}
            </Text>
            <Mono
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4, marginTop: 4 }}
            >
              {passed ? 'OPERATIONAL · ICAO ANNEX 1' : 'BELOW OPERATIONAL · KEEP TRAINING'}
            </Mono>

            {/* PASSED/FAILED stamp — Phase 7 auto-fix: 64→80px (tasarım 92, kart sıkışmasın diye 80) */}
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: passed ? '#2DBE6C' : '#E63946',
                backgroundColor: passed ? 'rgba(45,190,108,0.08)' : 'rgba(230,57,70,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ rotate: '-8deg' }],
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  color: passed ? '#2DBE6C' : '#E63946',
                  marginBottom: 2,
                }}
              >
                {passed ? '✓' : '✕'}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 10,
                  color: passed ? '#2DBE6C' : '#E63946',
                  letterSpacing: 1.2,
                }}
              >
                {passed ? 'PASSED' : 'RETRY'}
              </Text>
            </View>
          </View>

          {/* Cut line stub */}
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderTopColor: '#DCE0E8',
              padding: 14,
              gap: 12,
            }}
          >
            <Stub label="VALID UNTIL" value={validUntilText(attempt.attempted_at)} />
            <Stub label="ATTEMPT ID" value={attempt.id.slice(0, 8).toUpperCase()} />
            <Stub
              label="EXAMINER"
              value={
                attempt.provider === 'claude'
                  ? `Claude · ${attempt.examiner_model?.replace('claude-', '') ?? ''}`
                  : attempt.provider === 'gpt'
                    ? `GPT · ${attempt.examiner_model ?? ''}`
                    : 'Mock (admin yapılandırma)'
              }
            />
          </View>
        </View>

        {/* 6 descriptor profile */}
        <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
          DESCRIPTOR PROFILE
        </Mono>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            padding: 14,
            gap: 10,
            marginBottom: 20,
          }}
        >
          {DESCRIPTOR_META.map((d) => {
            const score = rubric[d.key];
            const isWeakest = d.key === weakest.key;
            return (
              <View
                key={d.code}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 4,
                  paddingHorizontal: isWeakest ? 8 : 0,
                  borderRadius: 8,
                  borderWidth: isWeakest ? 1.5 : 0,
                  borderColor: isWeakest ? '#E63946' : 'transparent',
                  backgroundColor: isWeakest ? '#FFF2F4' : 'transparent',
                }}
              >
                <Mono
                  style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.2, width: 36 }}
                >
                  {d.code}
                </Mono>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#0E1116', width: 110 }}>
                  {d.name}
                </Text>
                <View style={{ flex: 1, flexDirection: 'row', gap: 3, height: 16 }}>
                  {[1, 2, 3, 4, 5, 6].map((b) => (
                    <View
                      key={b}
                      style={{
                        flex: 1,
                        height: 16,
                        borderRadius: 3,
                        backgroundColor:
                          b <= score
                            ? score >= 4
                              ? '#2DBE6C'
                              : '#FFD56B'
                            : '#EDEFF3',
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={{ fontFamily: FONTS.mono700, fontSize: 14, color: '#0E1116', width: 28, textAlign: 'right' }}
                >
                  {score.toFixed(1)}
                </Text>
                {isWeakest && (
                  <View
                    style={{
                      backgroundColor: '#E63946',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Mono style={{ fontSize: 9, color: '#FFFFFF', letterSpacing: 0.8 }}>
                      FOCUS
                    </Mono>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Examiner note */}
        {attempt.feedback_tr && (
          <>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
              EXAMINER NOTE
            </Mono>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                padding: 14,
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 14, lineHeight: 21, color: '#0E1116', fontFamily: FONTS.body }}
              >
                {attempt.feedback_tr}
              </Text>
            </View>
          </>
        )}

        {/* Transcript (collapsed, small) */}
        {attempt.transcript && (
          <>
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 1.4, marginBottom: 8 }}>
              TRANSCRIPT
            </Mono>
            <View
              style={{
                backgroundColor: '#F4F5F8',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 12, lineHeight: 18, color: '#5A6478', fontFamily: FONTS.body, fontStyle: 'italic' }}
                numberOfLines={6}
              >
                "{attempt.transcript}"
              </Text>
            </View>
          </>
        )}

        {/* Confidence + provider hint (admin/dev) */}
        {attempt.confidence_score !== null && attempt.provider === 'mock' && (
          <View
            style={{
              backgroundColor: 'rgba(255,213,107,0.18)',
              borderWidth: 1,
              borderColor: 'rgba(242,193,78,0.5)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#7A5C00', letterSpacing: 1.2 }}>
              ℹ MOCK MODE
            </Mono>
            <Text style={{ fontSize: 12, color: '#7A5C00', marginTop: 4, lineHeight: 17 }}>
              Bu sonuç deterministik mock examiner tarafından üretildi. Admin AI provider'ı
              aktive ettiğinde gerçek Claude değerlendirmesi gelir.
            </Text>
          </View>
        )}

        {/* İtiraz buton */}
        {attempt.review_status === 'none' && (
          <TouchableOpacity
            onPress={onDispute}
            disabled={requesting}
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              marginBottom: 8,
            }}
          >
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, textDecorationLine: 'underline' }}>
              {requesting ? 'GÖNDERİLİYOR…' : 'SONUCA İTİRAZ ET'}
            </Mono>
          </TouchableOpacity>
        )}
        {attempt.review_status === 'pending' && (
          <View style={{ alignItems: 'center', paddingVertical: 8, marginBottom: 8 }}>
            <Mono style={{ fontSize: 11, color: '#F2C14E', letterSpacing: 1 }}>
              ⏱ MANUAL REVIEW BEKLİYOR
            </Mono>
          </View>
        )}
        {attempt.review_status === 'overridden' && (
          <View style={{ alignItems: 'center', paddingVertical: 8, marginBottom: 8 }}>
            <Mono style={{ fontSize: 11, color: '#2DBE6C', letterSpacing: 1 }}>
              ✓ MOD ONAYLI
            </Mono>
          </View>
        )}
      </ScrollView>

      {/* Sticky CTA */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FFFFFF' }}>
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#EDEFF3',
            gap: 8,
          }}
        >
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => router.replace('/exam/icao4-briefing' as any)}
          >
            {passed ? `Aim for L${Math.min(6, overall + 1)} →` : 'Tekrar dene'}
          </Button3D>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Stub({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9 }}>{label}</Mono>
      <Text
        style={{ fontFamily: FONTS.mono700, fontSize: 11, color: '#0E1116', marginTop: 2 }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function validUntilText(attemptedAt: string): string {
  const d = new Date(attemptedAt);
  d.setFullYear(d.getFullYear() + 3);
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: '2-digit' });
}
