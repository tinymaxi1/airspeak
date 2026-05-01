/**
 * ICAO L4 Live — gerçek state machine.
 *
 * Akış:
 *   idle → countdown(3) → recording → uploading → transcribing → evaluating → done
 *
 * - simulationId + promptId params'tan gelir (briefing route'lar).
 * - Audio kayıt + native STT paralel (live transcript).
 * - Stop → upload (oral-recordings/<uid>/<id>.m4a) → submit RPC + edge fn trigger.
 * - Realtime: oral_exam_attempts UPDATE → state='done' → result ekranı.
 *
 * Graceful fallback:
 *   - STT native unavailable (Expo Go) → audio kayıt yine yapılır, transcript boş;
 *     edge fn whisper provider varsa transkribe eder, mock provider deterministik.
 *   - Edge fn unreachable → submit_oral_attempt yine yapılır, 'evaluating' takılırsa
 *     mobile timeout (30sn) + retry button.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mono, FONTS } from '@/components/airspeak';
import {
  startOralAttempt,
  submitOralAttempt,
  uploadOralRecording,
  triggerOralEvaluate,
  fetchOralPrompt,
  type OralPrompt,
} from '@/features/oral/api';
import {
  startRecording,
  stopRecording,
  cancelRecording,
} from '@/lib/audioRecording';
import { useOralSTT, joinTranscript } from '@/features/oral/stt';

type Phase =
  | 'loading'      // prompt yükleniyor
  | 'idle'         // user "Başla" bekliyor
  | 'countdown'    // 3-2-1
  | 'recording'    // audio + STT
  | 'uploading'    // storage upload
  | 'submitting'   // submit RPC + trigger evaluate
  | 'evaluating'   // edge fn cevabı bekliyoruz (max 30sn timeout)
  | 'error';

const COUNTDOWN_SECONDS = 3;
const MAX_RECORDING_SECONDS = 90;
const EVALUATION_TIMEOUT_MS = 30_000;

export default function ICAO4LiveScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ simulationId: string; promptId: string }>();
  const simulationId = typeof params.simulationId === 'string' ? params.simulationId : '';
  const promptId = typeof params.promptId === 'string' ? params.promptId : '';

  const [prompt, setPrompt] = useState<OralPrompt | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [meteringDb, setMeteringDb] = useState<number | null>(null);

  const stt = useOralSTT();
  const recordingFileUri = useRef<string | null>(null);

  // ─── 1. Prompt yükle ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!simulationId || !promptId) {
      setError('missing_params');
      setPhase('error');
      return;
    }
    void (async () => {
      const p = await fetchOralPrompt(promptId);
      if (!p) {
        setError('prompt_not_found');
        setPhase('error');
        return;
      }
      setPrompt(p);
      setPhase('idle');
    })();
  }, [simulationId, promptId]);

  // ─── 2. Countdown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) {
      void enterRecording();
      return;
    }
    const id = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // ─── 3. Recording timeout (max 90sn) ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'recording') return;
    if (elapsedMs / 1000 >= MAX_RECORDING_SECONDS) {
      void enterStop();
    }
  }, [phase, elapsedMs]);

  // ─── 4. Evaluation timeout ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'evaluating') return;
    const id = setTimeout(() => {
      if (attemptId) {
        // Realtime'a güvenmiyoruz — direkt result'a yönlendir, attempt id ile
        router.replace(`/exam/icao4-result?attemptId=${attemptId}` as any);
      }
    }, EVALUATION_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [phase, attemptId]);

  function enterCountdown() {
    setCountdown(COUNTDOWN_SECONDS);
    setPhase('countdown');
  }

  async function enterRecording() {
    // 1. start_oral_attempt RPC
    const r = await startOralAttempt({ simulationId, promptId });
    if (!r.ok || !r.attempt_id || !r.audio_path) {
      setError(r.error ?? 'start_failed');
      setPhase('error');
      return;
    }
    setAttemptId(r.attempt_id);
    setAudioPath(r.audio_path);

    // 2. Audio recording başlat
    setElapsedMs(0);
    setMeteringDb(null);
    const recRes = await startRecording((s) => {
      setElapsedMs(s.durationMs);
      setMeteringDb(s.meteringDb);
    });
    if (!recRes.ok) {
      setError(recRes.error ?? 'recording_failed');
      setPhase('error');
      return;
    }

    // 3. STT paralel başlat (varsa)
    if (stt.available) {
      void stt.start({ lang: 'en-US' });
    }

    setPhase('recording');
  }

  async function enterStop() {
    if (phase !== 'recording') return;
    setPhase('uploading');

    // 1. Audio durdur
    const stopRes = await stopRecording();
    if (!stopRes.ok || !stopRes.uri) {
      setError(stopRes.error ?? 'stop_failed');
      setPhase('error');
      return;
    }
    recordingFileUri.current = stopRes.uri;

    // 2. STT durdur
    if (stt.recording) await stt.stop();

    // 3. Upload (private bucket)
    if (!audioPath) {
      setError('no_audio_path');
      setPhase('error');
      return;
    }
    const upRes = await uploadOralRecording({ audioPath, fileUri: stopRes.uri });
    if (!upRes.ok) {
      setError(upRes.error ?? 'upload_failed');
      setPhase('error');
      return;
    }

    // 4. Submit RPC (transcript + duration)
    setPhase('submitting');
    const finalTranscript = stt.final.trim();
    const durationSeconds = Math.round((stopRes.durationMs ?? elapsedMs) / 1000);
    if (!attemptId) {
      setError('no_attempt');
      setPhase('error');
      return;
    }
    const submitRes = await submitOralAttempt({
      attemptId,
      transcript: finalTranscript,
      durationSeconds,
    });
    if (!submitRes.ok) {
      setError(submitRes.error ?? 'submit_failed');
      setPhase('error');
      return;
    }

    // 5. Evaluate edge fn — fire and forget; result ekranı realtime ile günceller
    setPhase('evaluating');
    void triggerOralEvaluate(attemptId).then((r) => {
      // Result ekranına geç — realtime UPDATE rubric/band'i göstermiş olur
      router.replace(`/exam/icao4-result?attemptId=${attemptId}` as any);
    }).catch(() => {
      router.replace(`/exam/icao4-result?attemptId=${attemptId}` as any);
    });
  }

  function onCancel() {
    Alert.alert(
      'Sınavı bitir?',
      'Cevabın kaydedilmeyecek.',
      [
        { text: 'Devam et', style: 'cancel' },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: async () => {
            await cancelRecording().catch(() => undefined);
            if (stt.recording) await stt.stop();
            router.back();
          },
        },
      ],
    );
  }

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const remainingSec = Math.max(0, MAX_RECORDING_SECONDS - elapsedSec);
  const liveText = joinTranscript(stt.final, stt.interim);

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#06091A' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View>
            <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.55)' }}>
              {prompt?.task_type?.replace(/_/g, ' ').toUpperCase() ?? 'ICAO 4 ORAL'}
            </Mono>
            <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF', marginTop: 2 }}>
              {prompt?.difficulty_hint ?? 'B1'} · {prompt?.task_type === 'picture_description' ? 'Resim tasviri' : 'Konuşma'}
            </Text>
          </View>
          {phase === 'recording' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(230,57,70,0.16)',
                borderWidth: 1,
                borderColor: 'rgba(230,57,70,0.5)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FB6D78',
                }}
              />
              <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#FFFFFF' }}>
                {String(Math.floor(remainingSec / 60)).padStart(2, '0')} : {String(remainingSec % 60).padStart(2, '0')}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={onCancel} hitSlop={8}>
            <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {phase === 'loading' && (
          <View style={{ marginTop: 80, alignItems: 'center' }}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>Yükleniyor…</Text>
          </View>
        )}

        {phase === 'error' && (
          <View style={{ marginTop: 60, alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 48 }}>⚠</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center', maxWidth: 280 }}>
              {error === 'permission_denied'
                ? 'Mikrofon izni reddedildi. Ayarlar\'dan izin ver.'
                : error === 'prompt_not_found'
                  ? 'Prompt bulunamadı.'
                  : `Hata: ${error}`}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#E63946',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Geri dön</Text>
            </TouchableOpacity>
          </View>
        )}

        {prompt && (phase === 'idle' || phase === 'countdown' || phase === 'recording') && (
          <>
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>SCENARIO</Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 10,
                lineHeight: 28,
              }}
            >
              {prompt.prompt}
            </Text>
            {prompt.context && (
              <Text style={{ color: 'rgba(255,255,255,0.55)', marginTop: 8, fontFamily: FONTS.body, fontSize: 13, lineHeight: 19 }}>
                {prompt.context}
              </Text>
            )}
            {prompt.expected_topics?.length > 0 && (
              <View style={{ marginTop: 16, flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {prompt.expected_topics.slice(0, 6).map((t, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                    }}
                  >
                    <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8 }}>
                      {t}
                    </Mono>
                  </View>
                ))}
              </View>
            )}

            {phase === 'countdown' && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 96,
                    fontWeight: '700',
                    color: '#FB6D78',
                  }}
                >
                  {countdown || 'GO'}
                </Text>
              </View>
            )}

            {phase === 'recording' && (
              <View
                style={{
                  marginTop: 18,
                  padding: 14,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  minHeight: 120,
                }}
              >
                <Mono
                  style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.8, marginBottom: 8 }}
                >
                  LIVE TRANSCRIPT {stt.available ? '' : '· STT N/A'}
                </Mono>
                <Text
                  style={{ fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.85)', fontFamily: FONTS.body }}
                >
                  {liveText || (stt.available ? 'Konuşmaya başla...' : 'Native STT yok — kayıt yapılıyor, transcript bitince oluşturulacak')}
                  {phase === 'recording' && <Text style={{ color: '#FB6D78' }}> ▌</Text>}
                </Text>
              </View>
            )}
          </>
        )}

        {(phase === 'uploading' || phase === 'submitting' || phase === 'evaluating') && (
          <View style={{ marginTop: 60, alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color="#FB6D78" size="large" />
            <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
              {phase === 'uploading' && 'Ses dosyası yükleniyor…'}
              {phase === 'submitting' && 'Kayıt tamamlanıyor…'}
              {phase === 'evaluating' && 'AI değerlendirmesi yapılıyor…'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Mic dock */}
      {(phase === 'idle' || phase === 'recording') && (
        <SafeAreaView
          edges={['bottom']}
          style={{
            backgroundColor: '#0F1E47',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center', height: 24 }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const baseHeight = 4;
                  const phase01 = phase === 'recording' ? Math.min(1, Math.max(0, ((meteringDb ?? -50) + 50) / 50)) : 0;
                  const variance = Math.abs(Math.sin(i * 0.6 + elapsedMs * 0.005)) * 18 * phase01;
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        height: baseHeight + variance,
                        backgroundColor: phase === 'recording' ? '#FB6D78' : 'rgba(255,255,255,0.18)',
                        borderRadius: 1,
                      }}
                    />
                  );
                })}
              </View>
              <Mono
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 2,
                  letterSpacing: 1,
                }}
              >
                {phase === 'recording' ? 'RECORDING' : 'READY'}
              </Mono>
            </View>
            {phase === 'idle' ? (
              <TouchableOpacity
                onPress={enterCountdown}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#2DBE6C',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 4,
                  borderBottomColor: '#1F8B4D',
                }}
              >
                <Text style={{ fontSize: 24, color: '#FFFFFF' }}>●</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={enterStop}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#E63946',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 4,
                  borderBottomColor: '#C8202E',
                }}
              >
                <Text style={{ fontSize: 24, color: '#FFFFFF' }}>⏹</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
