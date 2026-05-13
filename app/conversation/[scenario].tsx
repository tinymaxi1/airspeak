/**
 * AI Conversation Screen — Gerçek scripted dialog tree motoru
 *
 * - Senaryo seçilir (URL params id veya rol bazlı default)
 * - ATC açılış: TTS ile sesli okunur (expo-speech) + chat bubble
 * - Mic: kullanıcı cevap verir → STT transcript
 * - matchTranscript: key phrases'a göre 0-100 skor
 *   - >= 70 → next turn
 *   - 50-70 → "Say again" + tekrar şans
 *   - < 50 → düzeltme + zorla ilerlet
 * - Tüm turn'ler bitince özet skor + XP
 *
 * Sıfır API maliyeti — tüm zekâ pattern matching.
 */
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { safeSpeechSpeak, safeSpeechStop } from '@/lib/speechSafe';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@/lib/speechRecognition';
import {
  matchTranscript,
  type ConversationScenario,
  type DialogTurn,
} from '@/features/conversation/scenarios';
import { useScenario, dbToStaticScenario } from '@/features/conversation/useScenarios';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useQuestsStore } from '@/stores/questsStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { useActivityStore } from '@/stores/activityStore';
import { Mono, FONTS, Button3D, Body } from '@/components/airspeak';
import { track } from '@/lib/posthog';

interface ChatItem {
  type: 'system' | 'atc' | 'user';
  name?: string;
  freq?: string;
  text: string;
  alert?: boolean;
  confidence?: number;
}

type Stage = 'briefing' | 'listening-atc' | 'awaiting-mic' | 'recording' | 'evaluating' | 'done';

export default function ConversationScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ scenario: string }>();
  const role = useOnboardingStore((s) => s.role);
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);
  const recordRecentActivity = useActivityStore((s) => s.recordActivity);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);

  // Senaryo seç — DB'den slug ile
  const slug = typeof params.scenario === 'string' ? params.scenario : null;
  const { data: dbScenario } = useScenario(slug);
  const scenario: ConversationScenario | undefined = dbScenario
    ? dbToStaticScenario(dbScenario)
    : undefined;

  const [chat, setChat] = useState<ChatItem[]>([]);
  const [turnIdx, setTurnIdx] = useState(0);
  const [stage, setStage] = useState<Stage>('briefing');
  const [recognized, setRecognized] = useState('');
  const [scores, setScores] = useState<number[]>([]);
  // Block 1.C — Lightning hint progressive disclosure (silenceMs > 4000 → fade)
  const [showHint, setShowHint] = useState(false);
  // Block 1.C — Mic recording pulse animation (1.0 ↔ 1.2, 1.5s loop)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Block 1.C — Headset pulse during ATC speaking (green dot opacity 1 ↔ 0.4)
  const headsetPulseAnim = useRef(new Animated.Value(1)).current;

  const finalTranscriptRef = useRef('');

  const currentTurn: DialogTurn | undefined = scenario?.turns[turnIdx];

  // Block 1.C — Lightning hint timer: awaiting-mic'te 4s sonra fade-in
  useEffect(() => {
    setShowHint(false);
    if (stage === 'awaiting-mic') {
      const t = setTimeout(() => setShowHint(true), 4000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  // Block 1.C — Mic pulse animation (recording sırasında)
  useEffect(() => {
    if (stage === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 750,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [stage, pulseAnim]);

  // Block 1.C — Headset pulse (listening-atc stage)
  useEffect(() => {
    if (stage === 'listening-atc') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(headsetPulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(headsetPulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    headsetPulseAnim.setValue(1);
  }, [stage, headsetPulseAnim]);

  // Block 1.C — Headset: ATC mesajını tekrar dinle
  function replayCurrentAtc() {
    if (currentTurn?.atcUtterance) {
      safeSpeechStop();
      safeSpeechSpeak(currentTurn.atcUtterance, { language: 'en-US', rate: 0.9 });
    }
  }

  // Block 1.C — Lightning: hint Alert (sadece awaiting-mic + currentTurn.hintTr)
  function showHintAlert() {
    if (currentTurn?.hintTr) {
      Alert.alert(t('conversation.hint', 'İpucu'), currentTurn.hintTr);
    }
  }

  // Block 1.C — Mic primary: stage'e göre handler
  function onMicPress() {
    if (stage === 'briefing') startScenario();
    else if (stage === 'awaiting-mic') startRecording();
    else if (stage === 'recording') {
      try {
        const r = ExpoSpeechRecognitionModule.stop();
        if (r && typeof (r as Promise<void>).catch === 'function') {
          (r as Promise<void>).catch(() => evaluateTurn());
        }
      } catch {
        evaluateTurn();
      }
    }
  }

  // STT events
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    setRecognized(transcript);
    if (event.isFinal) finalTranscriptRef.current = transcript;
  });

  useSpeechRecognitionEvent('end', () => {
    if (stage === 'recording') evaluateTurn();
  });

  // Senaryo yüklü değilse
  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* ignore */
      }
      safeSpeechStop();
    };
  }, []);

  if (!scenario) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06091A', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16 }}>
          {t('conversation.notFound', 'Senaryo bulunamadı.')}
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button3D variant="primary" fullWidth onPress={() => router.back()}>
            {t('common.back', 'Geri')}
          </Button3D>
        </View>
      </View>
    );
  }

  // Briefing → ilk ATC turunu başlat
  function startScenario() {
    setStage('listening-atc');
    setChat([{ type: 'system', text: scenario!.titleTr.toUpperCase() }]);
    playAtcTurn(0);
  }

  function playAtcTurn(idx: number) {
    const turn = scenario!.turns[idx];
    if (!turn) return;
    setChat((c) => [
      ...c,
      {
        type: 'atc',
        name: turn.atcStation,
        freq: turn.frequency,
        text: turn.atcUtterance,
      },
    ]);
    const spoke = safeSpeechSpeak(turn.atcUtterance, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => setStage('awaiting-mic'),
      onError: () => setStage('awaiting-mic'),
    });
    // TTS yoksa (native modül eksik veya iptal) kullanıcı metni okuyabilsin,
    // mic stage'ine manuel düş — sonsuza dek "DİNLE" stuck kalmasın.
    if (!spoke) {
      setStage('awaiting-mic');
    }
  }

  async function startRecording() {
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('conversation.permTitle', 'Mikrofon izni'), t('conversation.permBody', 'Konuşma tanıma için izin gerekli.'));
        return;
      }
      finalTranscriptRef.current = '';
      setRecognized('');
      setStage('recording');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        contextualStrings: currentTurn?.expectedReadback.split(/\s+/).filter(Boolean),
      });
    } catch (err) {
      if (__DEV__) console.warn('STT start failed', err);
      // Fallback: kullanıcının konuştuğunu kabul et, expected readback'i kullan
      finalTranscriptRef.current = currentTurn?.expectedReadback ?? '';
      setStage('recording');
      setTimeout(evaluateTurn, 1500);
    }
  }

  function evaluateTurn() {
    if (!currentTurn || !scenario) return;
    setStage('evaluating');
    const transcript = finalTranscriptRef.current || recognized;
    const result = matchTranscript(transcript, currentTurn.keyPhrases);

    setChat((c) => [
      ...c,
      {
        type: 'user',
        text: transcript || '[konuşma algılanmadı]',
        confidence: result.score,
      },
    ]);

    setScores((s) => [...s, result.score]);
    track('conversation_turn_evaluated', {
      scenario: scenario.id,
      turn: currentTurn.id,
      score: result.score,
    });

    setTimeout(() => {
      // Skor değerlendir + sonraki adım
      if (result.score >= 70) {
        setChat((c) => [
          ...c,
          {
            type: 'atc',
            name: currentTurn.atcStation,
            freq: currentTurn.frequency,
            text: t('conversation.readBackCorrect', 'Read-back correct.'),
          },
        ]);
        proceedNext();
      } else if (result.score >= 40) {
        // Hatırlatma + tekrar şans (bir kerelik)
        setChat((c) => [
          ...c,
          {
            type: 'atc',
            name: currentTurn.atcStation,
            text: t('conversation.sayAgain', 'Say again, Turkish 1453.'),
            alert: true,
          },
          {
            type: 'system',
            text: currentTurn.hintTr ?? currentTurn.correctionTr,
          },
        ]);
        setStage('awaiting-mic');
      } else {
        // Çok kötü → düzeltme ver, ilerlet
        setChat((c) => [
          ...c,
          {
            type: 'system',
            text: `❌ ${currentTurn.correctionTr}`,
          },
        ]);
        proceedNext();
      }
    }, 800);
  }

  function proceedNext() {
    const nextIdx = turnIdx + 1;
    const nextTurn = scenario!.turns[nextIdx];
    if (!nextTurn) {
      finishScenario();
      return;
    }
    setTurnIdx(nextIdx);
    setStage('listening-atc');
    setTimeout(() => playAtcTurn(nextIdx), 1200);
  }

  function finishScenario() {
    if (!scenario) return;
    setStage('done');
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1));
    const xp = avg >= 80 ? 80 : avg >= 60 ? 50 : 25;
    addXp(xp, 'ai_conversation');
    incrementQuest('practice_conversation', 1);
    recordDailyActivity();
    recordHistoryActivity('conversation');
    recordRecentActivity({
      type: 'conversation',
      refId: scenario.id,
      titleTr: scenario.titleTr,
      subtitleTr: `Skor ${avg}`,
      score: avg,
    });
    track('conversation_completed', {
      scenario: scenario.id,
      avg_score: avg,
      xp_earned: xp,
    });
  }

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
                {scenario.titleTr.toUpperCase()}
              </Mono>
              <Text style={{ fontFamily: FONTS.body800, fontSize: 14, color: '#FFFFFF', marginTop: 2 }}>
                {t('conversation.live', 'AI Co-pilot · LIVE')}
              </Text>
            </View>
            {/* Live indicator */}
            {stage !== 'briefing' && stage !== 'done' && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(45,190,108,0.18)',
                  borderWidth: 1,
                  borderColor: 'rgba(45,190,108,0.4)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4FD487' }} />
                <Mono style={{ fontSize: 11, color: '#FFFFFF' }}>
                  {turnIdx + 1}/{scenario.turns.length}
                </Mono>
              </View>
            )}
          </View>

          {/* Gauges */}
          {scenario.gauges && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {scenario.gauges.alt && <Gauge label="ALT" value={scenario.gauges.alt} />}
              {scenario.gauges.hdg && <Gauge label="HDG" value={scenario.gauges.hdg} />}
              {scenario.gauges.spd && <Gauge label="SPD" value={scenario.gauges.spd} />}
              {scenario.gauges.freq && <Gauge label="FREQ" value={scenario.gauges.freq} />}
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Briefing card */}
        {stage === 'briefing' && (
          <View
            style={{
              backgroundColor: 'rgba(255,213,107,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,213,107,0.4)',
              borderRadius: 14,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#FFD56B', letterSpacing: 1.8 }}>
              {t('conversation.briefing', 'BRİFİNG')}
            </Mono>
            <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 15, marginTop: 8, lineHeight: 22 }}>
              {scenario.contextTr}
            </Body>
            <Body color="rgba(255,255,255,0.6)" style={{ fontSize: 13, marginTop: 12 }}>
              {t('conversation.estimated', '~{{sec}}sn · {{turns}} turn', {
                sec: scenario.estimatedSeconds,
                turns: scenario.turns.length,
              })}
            </Body>
          </View>
        )}

        {/* Chat history */}
        {chat.map((item, i) => {
          if (item.type === 'system') {
            return (
              <Mono
                key={i}
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 1.8,
                  textAlign: 'center',
                  marginVertical: 12,
                }}
              >
                ─── {item.text} ───
              </Mono>
            );
          }
          return <ChatBubble key={i} item={item} />;
        })}

        {/* Live recognized text (recording sırasında) */}
        {stage === 'recording' && (
          <View
            style={{
              backgroundColor: 'rgba(230,57,70,0.12)',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: '#FB6D78',
              borderRadius: 12,
              padding: 12,
              marginTop: 6,
            }}
          >
            <Mono style={{ fontSize: 11, color: '#FB6D78', letterSpacing: 1.32, marginBottom: 6 }}>
              {t('conversation.youSpeaking', '🎙 SEN — KONUŞ')}
            </Mono>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
              {recognized || '...'}
            </Text>
          </View>
        )}

        {/* Done summary */}
        {stage === 'done' && (
          <View
            style={{
              backgroundColor: '#E63946',
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
              borderBottomWidth: 4,
              borderBottomColor: '#C8202E',
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 56 }}>🎯</Text>
            <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.8, marginTop: 8 }}>
              {t('conversation.complete', 'SENARYO TAMAM')}
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
              {Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1))}
            </Text>
            <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 14, marginTop: 4 }}>
              {t('conversation.avgScore', 'ortalama eşleşme · {{turns}} turn', { turns: scores.length })}
            </Body>
          </View>
        )}
      </ScrollView>

      {/* Block 1.C — Hibrit dock: Headset (sol) + Mic 64px (orta) + Lightning (sağ) */}
      <SafeAreaView
        edges={['bottom']}
        style={{
          backgroundColor: '#0A1430',
          borderTopWidth: 1,
          borderTopColor: '#14275F',
        }}
      >
        {stage === 'done' ? (
          <View style={{ padding: 14 }}>
            <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
              {t('conversation.backHome', 'Ana sayfa →')}
            </Button3D>
          </View>
        ) : (
          <View
            style={{
              minHeight: 96,
              paddingHorizontal: 24,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* HEADSET — sol 48px (ATC tekrar dinle) */}
            <Animated.View style={{ opacity: stage === 'listening-atc' ? headsetPulseAnim : 1 }}>
              <DockSideButton
                icon="🎧"
                disabled={
                  stage === 'recording' ||
                  stage === 'briefing' ||
                  stage === 'evaluating'
                }
                pulseRing={stage === 'listening-atc'}
                onPress={replayCurrentAtc}
                accessibilityLabel="ATC mesajını tekrar dinle"
              />
            </Animated.View>

            {/* MIC — orta 64px primary */}
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  disabled={
                    stage === 'listening-atc' || stage === 'evaluating'
                  }
                  onPress={onMicPress}
                  activeOpacity={0.85}
                  accessibilityLabel={
                    stage === 'briefing'
                      ? 'Senaryoyu başlat'
                      : stage === 'recording'
                        ? 'Kaydı bitir'
                        : 'Cevap için bas'
                  }
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor:
                      stage === 'listening-atc' || stage === 'evaluating'
                        ? 'rgba(255,255,255,0.08)'
                        : '#E63946',
                    borderBottomWidth: 4,
                    borderBottomColor:
                      stage === 'listening-atc' || stage === 'evaluating'
                        ? 'rgba(255,255,255,0.04)'
                        : '#C8202E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: stage === 'listening-atc' || stage === 'evaluating' ? 0.5 : 1,
                  }}
                >
                  {stage === 'evaluating' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontSize: 26, color: '#FFFFFF' }}>
                      {stage === 'recording' ? '⏹' : stage === 'briefing' ? '✈' : '🎤'}
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <Mono
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: 1.2,
                  textAlign: 'center',
                }}
              >
                {stage === 'briefing'
                  ? 'BAŞLAT'
                  : stage === 'listening-atc'
                    ? 'DİNLE'
                    : stage === 'awaiting-mic'
                      ? 'CEVAP İÇİN BAS'
                      : stage === 'recording'
                        ? 'DİNLİYOR…'
                        : 'DEĞERLENDİRİLİYOR…'}
              </Mono>
            </View>

            {/* LIGHTNING — sağ 48px (conditional fade-in: 4s sonra awaiting-mic) */}
            {showHint && stage === 'awaiting-mic' && currentTurn?.hintTr ? (
              <DockSideButton
                icon="⚡"
                ghost
                onPress={showHintAlert}
                accessibilityLabel="İpucu göster"
              />
            ) : (
              <View style={{ width: 48 }} />
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────
// DockSideButton — Block 1.C: Headset & Lightning side instruments
// ─────────────────────────────────────────────
function DockSideButton({
  icon,
  disabled = false,
  ghost = false,
  pulseRing = false,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  disabled?: boolean;
  ghost?: boolean;
  pulseRing?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: ghost ? 'transparent' : 'rgba(255,255,255,0.08)',
        borderWidth: ghost ? 1.5 : pulseRing ? 1.5 : 0,
        borderColor: pulseRing ? '#4FD487' : 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Text style={{ fontSize: 20, color: '#FFFFFF' }}>{icon}</Text>
    </TouchableOpacity>
  );
}

// useMemoScenario kaldırıldı — useScenario(slug) hook'u DB'den çeker.

function Gauge({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.32)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 8,
        alignItems: 'center',
      }}
    >
      <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.08 }}>
        {label}
      </Mono>
      <Text style={{ fontFamily: FONTS.mono700, fontSize: 13, color: '#FFD56B', marginTop: 1 }}>
        {value}
      </Text>
    </View>
  );
}

function ChatBubble({ item }: { item: ChatItem }) {
  const isUser = item.type === 'user';
  return (
    <View style={{ alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      {!isUser && (
        <Mono
          style={{
            fontSize: 10,
            color: item.alert ? '#FFD56B' : 'rgba(255,255,255,0.5)',
            marginBottom: 4,
            letterSpacing: 1.2,
          }}
        >
          🗼 {item.name}
          {item.freq && ` · ${item.freq}`}
        </Mono>
      )}
      <View
        style={{
          maxWidth: '85%',
          backgroundColor: isUser
            ? '#E63946'
            : item.alert
              ? 'rgba(255,213,107,0.16)'
              : 'rgba(255,255,255,0.08)',
          borderWidth: item.alert ? 1 : isUser ? 0 : 1,
          borderColor: item.alert ? '#FFD56B' : 'rgba(255,255,255,0.12)',
          borderRadius: 18,
          borderTopRightRadius: isUser ? 4 : 18,
          borderTopLeftRadius: isUser ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontFamily: FONTS.body }}>
          {item.text}
        </Text>
        {item.confidence !== undefined && (
          <View
            style={{
              marginTop: 6,
              paddingTop: 6,
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderTopColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>
              ✓ {item.confidence}% MATCH
            </Mono>
          </View>
        )}
      </View>
    </View>
  );
}
