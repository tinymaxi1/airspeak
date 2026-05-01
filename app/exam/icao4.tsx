import { ScrollView, Pressable } from 'react-native';
import {
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  Card,
  Button,
  Text,
  Spinner,
  Progress,
} from 'tamagui';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import {
  ICAO4_TASKS,
  type IcaoTask,
  type TaskType,
} from '@/features/icao4/tasks';
import {
  scoreIcaoTask,
  scoreIcaoFromTranscript,
  feedbackForLevel,
  levelLabel,
  type IcaoResult,
} from '@/features/icao4/scorer';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@/lib/speechRecognition';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { showPaywall } from '@/stores/paywallStore';
import { track } from '@/lib/posthog';

const TASK_TYPES: { type: TaskType; emoji: string; titleTr: string; descTr: string }[] = [
  { type: 'picture', emoji: '🖼️', titleTr: 'Picture Description', descTr: 'Fotoğraf yorumlama (1-2 dk)' },
  { type: 'story', emoji: '📖', titleTr: 'Story Telling', descTr: 'Hikaye anlatma (2 dk)' },
  { type: 'problem', emoji: '🧩', titleTr: 'Problem Solving', descTr: 'Acil durum çözme (1.5-2 dk)' },
  { type: 'topic', emoji: '💬', titleTr: 'Common Topics', descTr: 'Serbest konuşma (2 dk)' },
];

type Stage = 'menu' | 'briefing' | 'recording' | 'scoring' | 'result';

export default function Icao4Screen() {
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);

  const [stage, setStage] = useState<Stage>('menu');
  const [task, setTask] = useState<IcaoTask | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordStart, setRecordStart] = useState(0);
  const [result, setResult] = useState<IcaoResult | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const finalTranscriptRef = useRef('');

  // STT events
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript ?? '';
    setRecognizedText(transcript);
    if (event.isFinal) finalTranscriptRef.current = transcript;
  });

  // Free user'a sadece ilk picture task açık
  const FREE_TASK_ID = ICAO4_TASKS[0]?.id;

  useEffect(() => {
    return () => {
      recording?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, [recording]);

  function startBriefing(t: IcaoTask) {
    if (t.id !== FREE_TASK_ID) {
      // Premium task tap'i → trigger sheet (full paywall yerine yumuşak nudge,
      // cooldown ile spam önler)
      showPaywall('icao_oral_first_task_done');
      return;
    }
    setTask(t);
    setStage('briefing');
    track('icao4_task_started', { task_id: t.id, task_type: t.type });
  }

  async function startRecording() {
    if (!task) return;
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        alert('Mikrofon ve konuşma tanıma izni gerekli');
        return;
      }
      finalTranscriptRef.current = '';
      setRecognizedText('');
      setRecordStart(Date.now());
      setStage('recording');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });
    } catch (err) {
      console.warn('STT start failed', err);
      // Fallback: Audio.Recording (sadece süre bazlı heuristic)
      try {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) return;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        setRecording(rec);
        setRecordStart(Date.now());
        setStage('recording');
      } catch {
        /* ignore */
      }
    }
  }

  async function stopAndScore() {
    if (!task) return;
    setStage('scoring');
    try {
      // STT durduruldu — finalTranscriptRef dolmuş olmalı
      try {
        await ExpoSpeechRecognitionModule.stop();
      } catch {
        /* ignore — fallback */
      }

      const duration = Date.now() - recordStart;
      const transcript = finalTranscriptRef.current || recognizedText;

      // Gerçek scoring: STT varsa, yoksa fallback heuristic
      const scored = transcript
        ? scoreIcaoFromTranscript(task.id, task.type, transcript, duration)
        : await scoreIcaoTask(task.id, recording?.getURI() ?? '', duration);

      // Audio recording fallback'i kapat
      if (recording) {
        await recording.stopAndUnloadAsync().catch(() => undefined);
      }

      setResult(scored);
      setStage('result');
      addXp(200, 'icao4_task');
      recordDailyActivity();
      recordHistoryActivity('exam');
      track('icao4_task_completed', {
        task_id: task.id,
        overall_level: scored.overallLevel,
        is_heuristic: scored.isHeuristic,
      });
      // Free user 1. görevi bitirdi → diğer 3 görev kilitli paywall nudge
      if (task.id === FREE_TASK_ID) {
        setTimeout(() => showPaywall('icao_oral_first_task_done'), 1500);
      }
    } catch (err) {
      console.warn('Scoring failed', err);
      setStage('briefing');
    }
  }

  function reset() {
    setTask(null);
    setRecording(null);
    setResult(null);
    setStage('menu');
  }

  // ============== MENU ==============
  if (stage === 'menu') {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
          <YStack gap="$1">
            <H2 color="$text">ICAO Level 4 Sözlü Sınav</H2>
            <Paragraph color="$textSecondary">
              Gerçek sınavla birebir aynı format. 4 görev tipi, 6-alan rubric değerlendirme.
            </Paragraph>
          </YStack>

          <Card padding="$4" backgroundColor="$accent">
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="700" color="$accentText">
                💡 Sınav formatı
              </Text>
              <Paragraph color="$accentText">
                ICAO Doc 9835: pilot 4 görev sırasıyla yapar. Her görev 1-2 dk. Sınav komisyonu
                6 alanda 1-6 arası puan verir. En düşük skor genel seviyendir (Level 4 = Operational).
              </Paragraph>
            </YStack>
          </Card>

          <YStack gap="$3">
            {TASK_TYPES.map((tt) => {
              const tasks = ICAO4_TASKS.filter((t) => t.type === tt.type);
              return (
                <Card
                  key={tt.type}
                  padding="$4"
                  backgroundColor="$surface"
                  bordered
                >
                  <YStack gap="$2">
                    <XStack gap="$3" alignItems="center">
                      <Text fontSize={32}>{tt.emoji}</Text>
                      <YStack flex={1}>
                        <Text fontSize="$5" fontWeight="700" color="$text">
                          {tt.titleTr}
                        </Text>
                        <Text fontSize="$3" color="$textSecondary">
                          {tt.descTr}
                        </Text>
                      </YStack>
                    </XStack>
                    <YStack gap="$1">
                      {tasks.map((t) => {
                        const isLocked = t.id !== FREE_TASK_ID;
                        return (
                          <Pressable key={t.id} onPress={() => startBriefing(t)}>
                            <Card
                              padding="$3"
                              backgroundColor={isLocked ? '$backgroundHover' : '$primary'}
                              opacity={isLocked ? 0.6 : 1}
                            >
                              <XStack gap="$2" alignItems="center">
                                <Text
                                  fontSize="$4"
                                  fontWeight="500"
                                  color={isLocked ? '$text' : '$primaryText'}
                                  flex={1}
                                >
                                  {t.titleTr}
                                </Text>
                                <Text fontSize="$5" color={isLocked ? '$text' : '$primaryText'}>
                                  {isLocked ? '🔒' : '→'}
                                </Text>
                              </XStack>
                            </Card>
                          </Pressable>
                        );
                      })}
                    </YStack>
                  </YStack>
                </Card>
              );
            })}
          </YStack>

          <Card padding="$3" backgroundColor="$warning">
            <Text color="$primaryText" fontSize="$3">
              🔒 İlk görev ücretsiz. Diğer 7 görev premium.
            </Text>
          </Card>
        </YStack>
      </ScrollView>
    );
  }

  if (!task) return null;

  // ============== BRIEFING ==============
  if (stage === 'briefing') {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
          <Card padding="$3" backgroundColor="$backgroundHover">
            <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
              {task.type} · {task.expectedDurationSeconds}sn beklenen süre
            </Text>
          </Card>

          <H2 color="$text">{task.titleTr}</H2>

          <Card padding="$4" backgroundColor="$primary">
            <YStack gap="$2">
              <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                Görev (English)
              </Text>
              <Paragraph color="$primaryText" fontSize="$5">
                {task.promptEn}
              </Paragraph>
            </YStack>
          </Card>

          <Card padding="$3" backgroundColor="$surface" bordered>
            <YStack gap="$1">
              <Text fontSize="$3" color="$textSecondary">
                🇹🇷 Türkçe açıklama
              </Text>
              <Paragraph color="$text">{task.promptTr}</Paragraph>
            </YStack>
          </Card>

          <Card padding="$3" backgroundColor="$accent">
            <YStack gap="$1">
              <Text fontSize="$3" color="$accentText" fontWeight="600">
                💡 İpucu
              </Text>
              <Text color="$accentText">{task.hintTr}</Text>
            </YStack>
          </Card>

          <YStack gap="$2">
            <Button
              size="$5"
              backgroundColor="$primary"
              color="$primaryText"
              onPress={startRecording}
            >
              🎙️ Hazırım, kaydı başlat
            </Button>
            <Button variant="outlined" onPress={reset}>
              Geri dön
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    );
  }

  // ============== RECORDING ==============
  if (stage === 'recording') {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Card padding="$5" backgroundColor="$danger" alignItems="center">
          <YStack gap="$3" alignItems="center">
            <Text fontSize={80}>🔴</Text>
            <H3 color="$primaryText">Kayıt yapılıyor…</H3>
            <Text fontSize="$3" color="$primaryText">
              Beklenen süre: {task.expectedDurationSeconds}sn
            </Text>
          </YStack>
        </Card>
        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={stopAndScore}
        >
          Bitti — değerlendir
        </Button>
      </YStack>
    );
  }

  // ============== SCORING ==============
  if (stage === 'scoring') {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <YStack alignItems="center" gap="$3">
          <Spinner size="large" color="$primary" />
          <H3 color="$text">Ses kaydın analiz ediliyor…</H3>
          <Text fontSize="$3" color="$textSecondary">
            6-alan rubric değerlendirme
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            (mock — Sprint 5'te Claude Sonnet 4.6)
          </Text>
        </YStack>
      </YStack>
    );
  }

  // ============== RESULT ==============
  if (stage === 'result' && result) {
    const passed = result.overallLevel >= 4;
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
          <Card padding="$4" backgroundColor={passed ? '$success' : '$warning'}>
            <YStack gap="$2" alignItems="center">
              <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                Genel seviyen
              </Text>
              <Text fontSize={64} fontWeight="700" color="$primaryText">
                {result.overallLevel}
              </Text>
              <Text fontSize="$5" fontWeight="600" color="$primaryText">
                {levelLabel(result.overallLevel)}
              </Text>
              <Paragraph color="$primaryText" textAlign="center">
                {result.feedbackTr}
              </Paragraph>
            </YStack>
          </Card>

          <Card padding="$4" backgroundColor="$surface" bordered>
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="700" color="$text">
                6-Alan Rubric
              </Text>
              {(
                [
                  { key: 'pronunciation', label: 'Pronunciation' },
                  { key: 'structure', label: 'Structure' },
                  { key: 'vocabulary', label: 'Vocabulary' },
                  { key: 'fluency', label: 'Fluency' },
                  { key: 'comprehension', label: 'Comprehension' },
                  { key: 'interactions', label: 'Interactions' },
                ] as const
              ).map((cat) => {
                const score = result.rubric[cat.key];
                const percent = (score / 6) * 100;
                const color = score >= 4 ? '$success' : score >= 3 ? '$warning' : '$danger';
                return (
                  <YStack key={cat.key} gap="$1">
                    <XStack justifyContent="space-between">
                      <Text fontSize="$3" color="$text">
                        {cat.label}
                      </Text>
                      <Text fontSize="$3" fontWeight="700" color={color}>
                        {score}/6
                      </Text>
                    </XStack>
                    <Progress value={percent} max={100} backgroundColor="$border">
                      <Progress.Indicator animation="lazy" backgroundColor={color} />
                    </Progress>
                  </YStack>
                );
              })}
            </YStack>
          </Card>

          <Card padding="$4" backgroundColor="$primary">
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="700" color="$primaryText">
                💡 Öneriler
              </Text>
              {result.recommendations.map((r, i) => (
                <Text key={i} color="$primaryText">
                  {r}
                </Text>
              ))}
            </YStack>
          </Card>

          <YStack gap="$2">
            <Button
              size="$5"
              backgroundColor="$primary"
              color="$primaryText"
              onPress={reset}
            >
              Başka görev dene
            </Button>
            <Button variant="outlined" onPress={() => router.replace('/(tabs)/practice')}>
              Pratik tab'ına dön
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    );
  }

  return null;
}
