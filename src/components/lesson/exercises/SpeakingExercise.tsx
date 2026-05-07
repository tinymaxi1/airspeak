/**
 * SpeakingExercise — telaffuz / konuşma pratiği
 *
 * Format:
 * - exercise.prompt: söylenmesi gereken hedef cümle (target_text)
 * - exercise.prompt_tr: Türkçe çevirisi
 * - Mikrofon butonu: tıklayınca kayıt başlar / durur
 * - Kayıt sonrası kullanıcı self-assess yapar (Doğru / Yanlış söyledim)
 *
 * Not: AI değerlendirme Sprint 7 ICAO oral'da var; bu egzersiz tipi
 * için entegrasyon ileride eklenebilir. Şimdilik self-assess pattern.
 */
import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import {
  Button3D,
  FONTS,
  LessonFeedbackInline,
  LessonATCBubble,
  LessonHintBanner,
  Eyebrow,
} from '@/components/airspeak';
import {
  ensureAudioPermission,
  prepareForRecording,
  startRecording,
  stopRecording,
} from '@/lib/audioRecording';
import type { ExerciseProps } from './types';

type Phase = 'idle' | 'recording' | 'recorded';

export function SpeakingExercise({ exercise, showFeedback, onSubmit }: ExerciseProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [userAssessment, setUserAssessment] = useState<boolean | null>(null);

  const targetText = exercise.prompt ?? '';
  const promptTr = exercise.prompt_tr ?? '';

  async function toggleRecord() {
    if (showFeedback) return;
    if (phase === 'idle') {
      const ok = await ensureAudioPermission();
      if (!ok) {
        Alert.alert('Mikrofon izni gerekli', 'Telaffuz egzersizi için mikrofon erişimi vermelisin.');
        return;
      }
      await prepareForRecording();
      const r = await startRecording();
      if (!r.ok) {
        Alert.alert('Kayıt başlatılamadı', r.error ?? 'Tekrar dene.');
        return;
      }
      setPhase('recording');
    } else if (phase === 'recording') {
      await stopRecording();
      setPhase('recorded');
    }
  }

  function selfAssess(correct: boolean) {
    setUserAssessment(correct);
    onSubmit(correct);
  }

  // Block 3.C — Conditional rich UI
  // exercise.context (ATC mesajı) varsa → ATC bubble + hint banner mode
  // Yoksa → generic "BUNU SÖYLE" mode (tüm speaking exercise için ortak)
  const atcMessage = (exercise as { context?: string }).context;
  const isReadback = !!atcMessage;

  return (
    <View>
      {isReadback ? (
        // ─── ReadBack rich UI ───
        <>
          <Eyebrow accent>READ-BACK · LIVE MIC</Eyebrow>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: '700',
              color: '#0E1116',
              marginTop: 6,
              lineHeight: 27,
              letterSpacing: -0.44,
              marginBottom: 18,
            }}
          >
            {targetText || 'Read back the ATC clearance.'}
          </Text>

          <LessonATCBubble message={atcMessage!} />

          <View style={{ marginTop: 18 }}>
            <LessonHintBanner>
              Standart read-back: callsign → komut → frekans
            </LessonHintBanner>
          </View>

          {promptTr && promptTr !== targetText && (
            <Text
              style={{
                marginTop: 14,
                fontFamily: FONTS.body,
                fontSize: 13,
                color: '#5A6478',
                fontStyle: 'italic',
              }}
            >
              {promptTr}
            </Text>
          )}
        </>
      ) : (
        // ─── Generic "BUNU SÖYLE" mode ───
        <View
          style={{
            backgroundColor: '#0F1E47',
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: 1.4,
              marginBottom: 8,
            }}
          >
            BUNU SÖYLE
          </Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: '700',
              color: '#FFFFFF',
              lineHeight: 30,
              letterSpacing: -0.44,
            }}
          >
            {targetText}
          </Text>
          {promptTr && promptTr !== targetText && (
            <Text
              style={{
                marginTop: 10,
                fontFamily: FONTS.body,
                fontSize: 13,
                color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic',
              }}
            >
              {promptTr}
            </Text>
          )}
        </View>
      )}

      {/* Mic button */}
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={showFeedback || phase === 'recorded'}
          onPress={toggleRecord}
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: phase === 'recording' ? '#E63946' : '#FFFFFF',
            borderWidth: 4,
            borderColor: phase === 'recording' ? '#C8202E' : '#0F1E47',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: phase === 'recorded' ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 50 }}>🎙</Text>
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 12,
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: '#5A6478',
            letterSpacing: 1.4,
          }}
        >
          {phase === 'recording'
            ? 'KAYIT YAPILIYOR · DURDURMAK İÇİN DOKUN'
            : phase === 'recorded'
              ? 'KAYIT TAMAM'
              : 'BAŞLATMAK İÇİN DOKUN'}
        </Text>
      </View>

      {/* Self-assessment */}
      {phase === 'recorded' && !showFeedback && (
        <View style={{ gap: 10 }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: FONTS.body700,
              fontSize: 14,
              color: '#0E1116',
              marginBottom: 4,
            }}
          >
            Hedef cümleyi nasıl söyledin?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button3D
                variant="ghost"
                fullWidth
                onPress={() => selfAssess(false)}
              >
                ✗ Yanlış
              </Button3D>
            </View>
            <View style={{ flex: 1 }}>
              <Button3D
                variant="primary"
                fullWidth
                onPress={() => selfAssess(true)}
              >
                ✓ Doğru
              </Button3D>
            </View>
          </View>
        </View>
      )}

      {showFeedback && userAssessment !== null && (
        <View style={{ marginTop: 16 }}>
          <LessonFeedbackInline
            state={userAssessment ? 'correct' : 'wrong'}
            message={
              exercise.explanation_tr ??
              exercise.explanation ??
              (userAssessment ? 'Tebrikler!' : 'Bir dahaki sefere daha yavaş söyle.')
            }
          />
        </View>
      )}
    </View>
  );
}
