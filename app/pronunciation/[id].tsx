import { ScrollView, Pressable } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Spinner } from 'tamagui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
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

type Stage = 'ready' | 'recording' | 'scoring' | 'result';

export default function PronunciationScreen() {
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
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup
      recording?.stopAndUnloadAsync().catch(() => undefined);
    };
  }, [recording]);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
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
  }

  async function stopAndScore() {
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

  function tryAgain() {
    setResult(null);
    setRecording(null);
    setStage('ready');
  }

  function finish() {
    router.back();
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            🎤 Telaffuz · {sentence.category} · {sentence.level}
          </Text>
        </Card>

        <YStack gap="$2">
          <H3 color="$textSecondary" fontWeight="400">
            Şu cümleyi söyle:
          </H3>
          {result ? (
            <WordHighlightedText words={result.words} />
          ) : (
            <H2 color="$text">"{sentence.text}"</H2>
          )}
          {sentence.hint && stage === 'ready' && (
            <Card padding="$3" backgroundColor="$accent">
              <Text color="$accentText" fontSize="$3">
                💡 {sentence.hint}
              </Text>
            </Card>
          )}
        </YStack>

        {permissionDenied && (
          <Card padding="$3" backgroundColor="$dangerSubtle">
            <Text color="$danger">
              Mikrofon izni gerekli. Ayarlar &gt; AirSpeak'ten aç.
            </Text>
          </Card>
        )}

        {/* Stage UI */}
        {stage === 'ready' && (
          <Pressable onPress={startRecording}>
            <Card
              padding="$5"
              backgroundColor="$primary"
              alignItems="center"
              borderRadius={9999}
            >
              <Text fontSize={64}>🎙️</Text>
              <Text color="$primaryText" fontSize="$5" fontWeight="600" marginTop="$2">
                Basılı tutmak yerine dokun başla
              </Text>
            </Card>
          </Pressable>
        )}

        {stage === 'recording' && (
          <YStack gap="$3" alignItems="center">
            <Card padding="$5" backgroundColor="$danger" borderRadius={9999}>
              <Text fontSize={64}>🔴</Text>
              <Text color="$primaryText" fontSize="$5" fontWeight="600" marginTop="$2">
                Kayıt yapılıyor…
              </Text>
            </Card>
            <Button
              size="$5"
              backgroundColor="$primary"
              color="$primaryText"
              onPress={stopAndScore}
            >
              Bitti — analiz et
            </Button>
          </YStack>
        )}

        {stage === 'scoring' && (
          <YStack gap="$3" alignItems="center" paddingVertical="$8">
            <Spinner size="large" color="$primary" />
            <Text fontSize="$5" color="$textSecondary">
              Telaffuzun analiz ediliyor…
            </Text>
            <Text fontSize="$2" color="$textSecondary">
              (mock — Sprint 6'da Whisper)
            </Text>
          </YStack>
        )}

        {stage === 'result' && result && (
          <ResultView
            result={result}
            onTryAgain={tryAgain}
            onFinish={finish}
          />
        )}
      </YStack>
    </ScrollView>
  );
}

function WordHighlightedText({ words }: { words: PronunciationResult['words'] }) {
  return (
    <XStack flexWrap="wrap" gap="$1">
      {words.map((w, i) => {
        const color =
          w.level === 'good'
            ? '$success'
            : w.level === 'fair'
              ? '$warning'
              : '$danger';
        return (
          <Text key={i} fontSize="$7" fontWeight="700" color={color as any}>
            {w.word}{' '}
          </Text>
        );
      })}
    </XStack>
  );
}

function ResultView({
  result,
  onTryAgain,
  onFinish,
}: {
  result: PronunciationResult;
  onTryAgain: () => void;
  onFinish: () => void;
}) {
  return (
    <YStack gap="$4">
      <Card padding="$4" backgroundColor="$accent">
        <YStack gap="$2" alignItems="center">
          <Text fontSize="$3" color="$accentText" textTransform="uppercase">
            Genel skor
          </Text>
          <Text fontSize={56} fontWeight="700" color="$accentText">
            {result.overallScore}
          </Text>
          <Text fontSize="$3" color="$accentText">
            ICAO Seviye {result.icaoRubric} / 6
          </Text>
        </YStack>
      </Card>

      <Card padding="$4" backgroundColor="$surface" bordered>
        <YStack gap="$2">
          <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
            Geri bildirim
          </Text>
          <Paragraph color="$text">{result.feedbackTr}</Paragraph>
        </YStack>
      </Card>

      <Card padding="$4" backgroundColor="$surface" bordered>
        <YStack gap="$2">
          <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
            Renk kodu
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            <XStack gap="$1" alignItems="center">
              <Text color="$success">●</Text>
              <Text fontSize="$2" color="$text">Doğru</Text>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <Text color="$warning">●</Text>
              <Text fontSize="$2" color="$text">İdare eder</Text>
            </XStack>
            <XStack gap="$1" alignItems="center">
              <Text color="$danger">●</Text>
              <Text fontSize="$2" color="$text">Tekrar dene</Text>
            </XStack>
          </XStack>
        </YStack>
      </Card>

      <YStack gap="$2">
        <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={onTryAgain}>
          🔄 Tekrar dene
        </Button>
        <Button size="$5" variant="outlined" onPress={onFinish}>
          Bitir
        </Button>
      </YStack>
    </YStack>
  );
}
