/**
 * Pronunciation Screen — Phoneme-level scoring drill
 *
 * Tasarım birebir (screens-ai.jsx PronunciationScreen):
 * - Score ring (168px gold/green/red) overall score
 * - Word + IPA + Native (US) audio chip
 * - Phoneme tiles (4 tiles, color-coded weak phoneme red bg)
 * - Tip card (red 3D, FOCUS · /mɪ/ + lip sync demo)
 * - Compare waveform card (Native green / You red)
 * - Sticky bottom: Skip + Try again red CTA
 */
import { ScrollView, View, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
  PRONUNCIATION_SENTENCES,
  type PronunciationSentence,
} from '@/features/pronunciation/sentences';
import {
  scorePronunciation,
  type PronunciationResult,
} from '@/features/pronunciation/scorer';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useQuestsStore } from '@/stores/questsStore';
import { track } from '@/lib/posthog';
import {
  Eyebrow,
  Mono,
  Body,
  FONTS,
  Button3D,
  Avatar,
} from '@/components/airspeak';

type Stage = 'ready' | 'recording' | 'scoring' | 'result';

interface Phoneme {
  p: string;
  score: number;
}

export default function PronunciationScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id: string }>();
  const sentence = (PRONUNCIATION_SENTENCES.find((s) => s.id === params.id) ??
    PRONUNCIATION_SENTENCES[0]) as PronunciationSentence;

  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);

  const [stage, setStage] = useState<Stage>('ready');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [recordStart, setRecordStart] = useState<number>(0);

  useEffect(() => {
    return () => {
      recording?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, [recording]);

  async function toggleRecording() {
    if (stage === 'ready') {
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          Alert.alert('Mikrofon izni', 'Ayarlar > AirSpeak\'ten aç.');
          return;
        }
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(rec);
        setRecordStart(Date.now());
        setStage('recording');
        track('pronunciation_started', { sentence_id: sentence.id });
      } catch (err) {
        console.warn('Recording start failed', err);
      }
    } else if (stage === 'recording') {
      if (!recording) return;
      setStage('scoring');
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI() ?? '';
        const duration = Date.now() - recordStart;
        const scored = await scorePronunciation(sentence.text, uri, duration);
        setResult(scored);
        setStage('result');
        addXp(scored.overallScore >= 70 ? 30 : 10, 'pronunciation_drill');
        incrementQuest('practice_pronunciation', 1);
        incrementQuest('streak_check', 1);
        recordDailyActivity();
        track('pronunciation_attempt', {
          sentence_id: sentence.id,
          score: scored.overallScore,
          icao_rubric: scored.icaoRubric,
        });
      } catch (err) {
        console.warn('Scoring failed', err);
        setStage('ready');
      }
    }
  }

  const tryAgain = () => {
    setResult(null);
    setRecording(null);
    setStage('ready');
  };

  // Generate phoneme tiles from result words
  const phonemes: Phoneme[] = result
    ? result.words.slice(0, 4).map((w) => ({
        p: w.word.slice(0, 3).toLowerCase(),
        score: w.level === 'good' ? 90 : w.level === 'fair' ? 65 : 40,
      }))
    : [
        { p: 'ˈæl', score: 95 },
        { p: 'tə', score: 88 },
        { p: 'mɪ', score: 42 },
        { p: 'tər', score: 76 },
      ];

  const overall = result?.overallScore ?? 72;
  const word = sentence.text.split(' ')[0] ?? 'altimeter';
  const ringColor = overall >= 80 ? '#2DBE6C' : overall >= 60 ? '#F2C14E' : '#E63946';
  const weakIdx = phonemes.findIndex((p) => p.score < 60);
  const weakPhoneme = weakIdx >= 0 ? phonemes[weakIdx] : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24, color: '#0E1116' }}>←</Text>
          </TouchableOpacity>
          <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: '#5A6478' }}>
            {t('screens.pronunciation.eyebrow')}
          </Mono>
          <Text style={{ fontSize: 22 }}>⚙</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        {/* Score ring */}
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <View style={{ width: 168, height: 168 }}>
            <Svg width="168" height="168" viewBox="0 0 168 168">
              <Circle cx={84} cy={84} r={72} stroke="#EDEFF3" strokeWidth={14} fill="none" />
              <Circle
                cx={84}
                cy={84}
                r={72}
                stroke={ringColor}
                strokeWidth={14}
                fill="none"
                strokeDasharray={`${(overall / 100) * 452.4} 452.4`}
                strokeLinecap="round"
                transform="rotate(-90 84 84)"
              />
            </Svg>
            <View
              style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 56,
                  fontWeight: '700',
                  color: ringColor,
                  letterSpacing: -2.24,
                  lineHeight: 56,
                }}
              >
                {overall}
              </Text>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.8, marginTop: 4 }}>
                {t('screens.pronunciation.score')}
              </Mono>
            </View>
          </View>
        </View>

        {/* Word + IPA */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 38,
              fontWeight: '700',
              color: '#0E1116',
              letterSpacing: -0.76,
            }}
          >
            {word}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: '#5A6478',
              marginTop: 2,
            }}
          >
            /ˈæl.tə.ˌmɪ.tər/
          </Text>
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 14 }}>🔊</Text>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0F1E47' }}>
              {t('screens.pronunciation.native')}
            </Text>
          </View>
        </View>

        {/* Phoneme tiles */}
        <Eyebrow>{t('screens.pronunciation.phonemes')}</Eyebrow>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, marginBottom: 18 }}>
          {phonemes.map((ph, i) => {
            const c = ph.score >= 80 ? '#2DBE6C' : ph.score >= 60 ? '#F2C14E' : '#E63946';
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 6,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: c,
                  backgroundColor: ph.score < 60 ? '#FFE4E7' : '#FFFFFF',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.mono700,
                    fontSize: 18,
                    color: '#0E1116',
                  }}
                >
                  {ph.p}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.body800,
                    fontSize: 11,
                    color: c,
                    marginTop: 4,
                  }}
                >
                  {ph.score}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tip card for weak phoneme */}
        {weakPhoneme && (
          <View
            style={{
              backgroundColor: '#E63946',
              borderRadius: 14,
              padding: 14,
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🎯</Text>
              <Mono style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: 1.8 }}>
                {t('screens.pronunciation.focus', { phoneme: weakPhoneme.p })}
              </Mono>
            </View>
            <Text
              style={{
                fontFamily: FONTS.body800,
                fontSize: 16,
                color: '#FFFFFF',
                lineHeight: 21,
              }}
            >
              {t('screens.pronunciation.focusBody')}
            </Text>
            <View
              style={{
                marginTop: 10,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(0,0,0,0.18)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text style={{ fontSize: 12, color: '#FFFFFF' }}>▶</Text>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#FFFFFF' }}>
                {t('screens.pronunciation.lipSync')}
              </Text>
            </View>
          </View>
        )}

        {/* Compare waveform */}
        <Eyebrow>{t('screens.pronunciation.compare')}</Eyebrow>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderRadius: 14,
            padding: 14,
            marginTop: 8,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials="N" color="#2DBE6C" size={32} />
            <Waveform color="#2DBE6C" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials="EK" color="#E63946" size={32} />
            <Waveform color="#E63946" />
          </View>
        </View>

        <Body color="#5A6478" style={{ fontSize: 13, marginTop: 12, textAlign: 'center' }}>
          {stage === 'recording' ? '🔴 Kayıt sürüyor...' :
           stage === 'scoring' ? '⏳ Analiz ediliyor...' :
           result?.feedbackTr ?? `"${sentence.text}" — kayıt başlat.`}
        </Body>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button3D variant="secondary" fullWidth onPress={() => router.back()}>
              {t('screens.pronunciation.skip')}
            </Button3D>
          </View>
          <View style={{ flex: 2 }}>
            <Pressable onPress={stage === 'result' ? tryAgain : toggleRecording}>
              <Button3D
                variant="primary"
                fullWidth
                onPress={stage === 'result' ? tryAgain : toggleRecording}
              >
                {stage === 'recording' ? '⏹ Bitir' :
                 stage === 'scoring' ? '⏳ ...' :
                 stage === 'result' ? t('screens.pronunciation.tryAgain') :
                 t('screens.pronunciation.tryAgain')}
              </Button3D>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Waveform({ color }: { color: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 2, alignItems: 'center', height: 32 }}>
      {Array.from({ length: 32 }).map((_, i) => {
        const h = 4 + Math.abs(Math.sin(i * 0.6)) * 24;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: h,
              backgroundColor: color,
              borderRadius: 1,
              opacity: 0.85,
            }}
          />
        );
      })}
    </View>
  );
}
