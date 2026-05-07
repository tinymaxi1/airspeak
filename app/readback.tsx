/**
 * Read-back Drill Screen — ATC clearance rapid fire (gerçek STT eşleşme).
 *
 * Flow:
 *   1. Briefing: "60 sec · 12 clearances"
 *   2. Her clearance:
 *      - ATC utterance TTS okur (cihaz)
 *      - Mic açılır, kullanıcı read-back yapar
 *      - STT transcript → keyPhrases match → 0-100 skor
 *      - Skor + hızlı feedback (correct/say-again/wrong)
 *      - Sonraki clearance
 *   3. Özet: ortalama skor + XP
 */
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@/lib/speechRecognition';
import { getRandomClearances, type AtcClearance } from '@/features/readback/clearances';
import { matchTranscript } from '@/features/conversation/scenarios';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useQuestsStore } from '@/stores/questsStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import {
  Mono,
  FONTS,
  Body,
  Eyebrow,
  Button3D,
} from '@/components/airspeak';
import { track } from '@/lib/posthog';

type Stage = 'briefing' | 'listening' | 'awaiting' | 'recording' | 'feedback' | 'done';

export default function ReadbackDrillScreen() {
  const { t } = useTranslation();
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);

  const [clearances] = useState<AtcClearance[]>(() => getRandomClearances(8));
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<Stage>('briefing');
  const [recognized, setRecognized] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [missedPhrases, setMissedPhrases] = useState<string[][]>([]);

  const finalTranscriptRef = useRef('');
  const total = clearances.length;
  const current = clearances[idx];

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    setRecognized(transcript);
    if (event.isFinal) finalTranscriptRef.current = transcript;
  });

  useSpeechRecognitionEvent('end', () => {
    if (stage === 'recording') evaluateClearance();
  });

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* ignore */
      }
      Speech.stop();
    };
  }, []);

  function startDrill() {
    setStage('listening');
    playAtcClearance();
  }

  function playAtcClearance() {
    if (!current) return;
    Speech.speak(current.atcUtterance, {
      language: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      onDone: () => setStage('awaiting'),
      onError: () => setStage('awaiting'),
    });
  }

  async function startRecording() {
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('readback.permTitle', 'Mikrofon izni'), t('readback.permBody', 'Konuşma tanıma için izin gerekli.'));
        return;
      }
      finalTranscriptRef.current = '';
      setRecognized('');
      setStage('recording');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        contextualStrings: current?.expectedReadback.split(/\s+/).filter(Boolean),
      });
    } catch (err) {
      if (__DEV__) console.warn('STT failed', err);
      finalTranscriptRef.current = current?.expectedReadback ?? '';
      setStage('recording');
      setTimeout(evaluateClearance, 1000);
    }
  }

  function evaluateClearance() {
    if (!current) return;
    const transcript = finalTranscriptRef.current || recognized;
    const result = matchTranscript(transcript, current.keyPhrases);
    setLastScore(result.score);
    setMissedPhrases(result.missed);
    setScores((s) => [...s, result.score]);
    setStage('feedback');
    track('readback_evaluated', {
      clearance: current.id,
      score: result.score,
    });
  }

  function next() {
    if (idx + 1 >= total) {
      finishDrill();
      return;
    }
    setIdx(idx + 1);
    setLastScore(null);
    setMissedPhrases([]);
    setRecognized('');
    finalTranscriptRef.current = '';
    setStage('listening');
    setTimeout(playAtcClearance, 800);
  }

  function finishDrill() {
    setStage('done');
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1));
    const xp = avg >= 80 ? 100 : avg >= 60 ? 60 : 30;
    addXp(xp, 'readback_drill');
    incrementQuest('practice_pronunciation', 1);
    incrementQuest('streak_check', 1);
    recordDailyActivity();
    recordHistoryActivity('lesson');
    track('readback_drill_completed', {
      avg_score: avg,
      total: total,
      xp_earned: xp,
    });
  }

  if (!current) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#06091A' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, color: '#FFFFFF' }}>✕</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.7)' }}>
                {t('readback.eyebrow', 'READ-BACK DRILL · RAPID FIRE')}
              </Mono>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF', marginTop: 2 }}>
                {stage === 'briefing'
                  ? t('readback.title', 'ATC clearance rapid fire')
                  : `${idx + 1} / ${total}`}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {stage !== 'briefing' && stage !== 'done' && (
            <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginTop: 10 }}>
              <View
                style={{
                  width: `${(idx / total) * 100}%`,
                  height: '100%',
                  backgroundColor: '#E63946',
                }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Briefing */}
        {stage === 'briefing' && (
          <View
            style={{
              backgroundColor: 'rgba(255,213,107,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,213,107,0.4)',
              borderRadius: 14,
              padding: 20,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
              {t('readback.briefingEyebrow', 'BRİFİNG')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 28,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 8,
                lineHeight: 31,
                letterSpacing: -0.56,
              }}
            >
              {t('readback.briefingTitle', '{{count}} ATC clearance · 60 saniye', { count: total })}
            </Text>
            <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 15, marginTop: 12, lineHeight: 22 }}>
              {t(
                'readback.briefingBody',
                'ATC seni arar, sen okuduğunu standart frazeoloji ile read-back yaparsın. Her clearance keyPhrases ile gerçekten eşleştirilir.',
              )}
            </Body>
          </View>
        )}

        {/* Active clearance */}
        {(stage === 'listening' || stage === 'awaiting' || stage === 'recording') && (
          <>
            {/* Station + freq */}
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.2, marginBottom: 8 }}>
              🗼 {current.station}
              {current.freq && ` · ${current.freq}`}
            </Mono>

            {/* ATC bubble */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                borderRadius: 16,
                borderTopLeftRadius: 4,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 22, fontFamily: FONTS.body }}>
                {current.atcUtterance}
              </Text>
            </View>

            {/* Live transcript */}
            {stage === 'recording' && (
              <View
                style={{
                  backgroundColor: 'rgba(230,57,70,0.12)',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: '#FB6D78',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Mono style={{ fontSize: 11, color: '#FB6D78', letterSpacing: 1.32, marginBottom: 6 }}>
                  {t('readback.youReadback', '🎙 SEN — READ-BACK YAP')}
                </Mono>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
                  {recognized || '...'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Feedback */}
        {stage === 'feedback' && lastScore !== null && (
          <>
            <View
              style={{
                backgroundColor:
                  lastScore >= 80 ? '#2DBE6C' : lastScore >= 50 ? '#FF7847' : '#E63946',
                borderRadius: 14,
                padding: 20,
                alignItems: 'center',
                borderBottomWidth: 4,
                borderBottomColor:
                  lastScore >= 80 ? '#22A659' : lastScore >= 50 ? '#E5602F' : '#C8202E',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 56 }}>
                {lastScore >= 80 ? '✅' : lastScore >= 50 ? '⚠️' : '❌'}
              </Text>
              <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8, marginTop: 8 }}>
                {lastScore >= 80
                  ? t('readback.correct', 'READ-BACK CORRECT')
                  : lastScore >= 50
                    ? t('readback.partial', 'EKSİK READ-BACK')
                    : t('readback.wrong', 'YANLIŞ READ-BACK')}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 56,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginTop: 4,
                }}
              >
                {lastScore}%
              </Text>
            </View>

            {/* Hatırlatma */}
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.2 }}>
                {t('readback.expected', 'BEKLENEN')}
              </Mono>
              <Text style={{ color: '#FFFFFF', fontSize: 14, marginTop: 4, lineHeight: 20 }}>
                {current.expectedReadback}
              </Text>

              {missedPhrases.length > 0 && (
                <>
                  <Mono style={{ fontSize: 10, color: '#FB6D78', letterSpacing: 1.2, marginTop: 12 }}>
                    {t('readback.missed', 'KAÇIRILANLAR')}
                  </Mono>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, lineHeight: 20 }}>
                    {missedPhrases.map((g) => g[0]).join(' · ')}
                  </Text>
                </>
              )}

              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.2, marginTop: 12 }}>
                💡 {t('readback.hint', 'İPUCU')}
              </Mono>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, lineHeight: 20 }}>
                {current.hintTr}
              </Text>
              {current.icaoRef && (
                <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                  📘 {current.icaoRef}
                </Mono>
              )}
            </View>
          </>
        )}

        {/* Done summary */}
        {stage === 'done' && (
          <View
            style={{
              backgroundColor: '#E63946',
              borderRadius: 14,
              padding: 24,
              alignItems: 'center',
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
            }}
          >
            <Text style={{ fontSize: 64 }}>🎯</Text>
            <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8, marginTop: 12 }}>
              {t('readback.complete', 'DRILL TAMAM')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 64,
                fontWeight: '700',
                color: '#FFFFFF',
                marginTop: 4,
                letterSpacing: -2.56,
              }}
            >
              {Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1))}%
            </Text>
            <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 14, marginTop: 4 }}>
              {t('readback.completeSub', '{{count}} clearance · ortalama eşleşme', { count: scores.length })}
            </Body>
          </View>
        )}
      </ScrollView>

      {/* Action area */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          backgroundColor: '#0F1E47',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ padding: 14 }}>
          {stage === 'briefing' && (
            <Button3D variant="primary" fullWidth onPress={startDrill}>
              {t('readback.start', 'Başla')}
            </Button3D>
          )}
          {stage === 'listening' && (
            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.32 }}>
                🔊 ATC KONUŞUYOR
              </Mono>
            </View>
          )}
          {stage === 'awaiting' && (
            <Button3D variant="primary" fullWidth onPress={startRecording}>
              {t('readback.tapToSpeak', '🎙 Read-back için bas')}
            </Button3D>
          )}
          {stage === 'recording' && (
            <Button3D
              variant="primary"
              fullWidth
              onPress={async () => {
                try {
                  await ExpoSpeechRecognitionModule.stop();
                } catch {
                  evaluateClearance();
                }
              }}
            >
              {t('readback.tapToFinish', '⏹ Bitir')}
            </Button3D>
          )}
          {stage === 'feedback' && (
            <Button3D variant="primary" fullWidth onPress={next}>
              {idx + 1 >= total
                ? t('readback.finish', 'Bitir →')
                : t('readback.nextClearance', 'Sonraki clearance →')}
            </Button3D>
          )}
          {stage === 'done' && (
            <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
              {t('readback.backHome', 'Ana sayfa →')}
            </Button3D>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
