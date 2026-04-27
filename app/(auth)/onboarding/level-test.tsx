import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Button, Card, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  PLACEMENT_QUESTIONS,
  calculateLevel,
  calculateScores,
} from '@/features/placement/questions';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { track } from '@/lib/posthog';

interface Answer {
  questionId: string;
  selectedId: string;
}

export default function LevelTestScreen() {
  const { t } = useTranslation();
  const setPlacementResult = useOnboardingStore((s) => s.setPlacementResult);
  const [step, setStep] = useState<'intro' | 'questions' | 'submitting'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const total = PLACEMENT_QUESTIONS.length;
  const current = PLACEMENT_QUESTIONS[currentIdx];

  if (step === 'intro') {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack flex={1} padding="$4" gap="$5" backgroundColor="$background">
          <Progress value={40} max={100} backgroundColor="$border">
            <Progress.Indicator animation="lazy" backgroundColor="$primary" />
          </Progress>
          <Paragraph size="$2" color="$textSecondary">
            {t('onboarding.step', 'Adım {{current}}/{{total}}', { current: 2, total: 5 })}
          </Paragraph>

          <H2 color="$text">
            {t('onboarding.levelTest.title', 'Şimdi seni daha iyi tanıyalım')}
          </H2>
          <Paragraph color="$textSecondary">
            {t(
              'onboarding.levelTest.intro',
              '10 kısa soru. Yaklaşık 3 dakika. Doğru cevaba odaklan, hızını dert etme.',
            )}
          </Paragraph>

          <Card padding="$4" backgroundColor="$accent" theme="alt2">
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color="$accentText">
                💡 Önemli
              </Text>
              <Paragraph color="$accentText">
                {t(
                  'onboarding.levelTest.warning',
                  'Yanlış cevap = ceza yok. Bu test sana özel ders zorluğunu ayarlamak için. "Bilmiyorum" seçeneği var, panik yok.',
                )}
              </Paragraph>
            </YStack>
          </Card>

          <Button
            size="$5"
            backgroundColor="$primary"
            color="$primaryText"
            onPress={() => {
              setStep('questions');
              track('level_test_started');
            }}
          >
            {t('onboarding.levelTest.start', 'Teste başla →')}
          </Button>
        </YStack>
      </ScrollView>
    );
  }

  if (!current) return null;

  const handleAnswer = () => {
    if (!selectedId) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    const newAnswers: Answer[] = selectedId
      ? [...answers, { questionId: current.id, selectedId }]
      : answers;
    setAnswers(newAnswers);

    if (currentIdx + 1 >= total) {
      // Test bitti — sonuçları hesapla
      const level = calculateLevel(newAnswers);
      const scores = calculateScores(newAnswers);
      setPlacementResult({
        level,
        totalScore: scores.total,
        byCategory: scores.byCategory,
      });
      track('level_test_completed', {
        result_level: level,
        score: scores.total,
      });
      router.push('/(auth)/onboarding/goals');
    } else {
      setCurrentIdx(currentIdx + 1);
      setSelectedId(null);
      setShowFeedback(false);
    }
  };

  const handleSkip = () => {
    setSelectedId(null);
    handleNext();
  };

  const isCorrect = selectedId === current.correctId;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={(currentIdx / total) * 100} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <Paragraph size="$2" color="$textSecondary">
          {t('onboarding.levelTest.progress', 'Soru {{current}} / {{total}}', {
            current: currentIdx + 1,
            total,
          })}
        </Paragraph>

        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            {current.level} · {current.category}
          </Text>
        </Card>

        <H3 color="$text">{current.question}</H3>

        {current.context && (
          <Card padding="$3" backgroundColor="$backgroundHover">
            <Text color="$textSecondary">{current.context}</Text>
          </Card>
        )}

        <YStack gap="$3">
          {current.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isThisCorrect = option.id === current.correctId;
            const showAsCorrect = showFeedback && isThisCorrect;
            const showAsWrong = showFeedback && isSelected && !isThisCorrect;

            let bgColor: string = '$surface';
            let borderColor: string = '$border';
            let textColor: string = '$text';

            if (showAsCorrect) {
              bgColor = '$success';
              borderColor = '$success';
              textColor = '$primaryText';
            } else if (showAsWrong) {
              bgColor = '$danger';
              borderColor = '$danger';
              textColor = '$primaryText';
            } else if (isSelected) {
              bgColor = '$primary';
              borderColor = '$primary';
              textColor = '$primaryText';
            }

            return (
              <Card
                key={option.id}
                bordered
                padding="$4"
                backgroundColor={bgColor as any}
                borderColor={borderColor as any}
                onPress={() => !showFeedback && setSelectedId(option.id)}
                disabled={showFeedback}
                pressStyle={{ scale: 0.98 }}
              >
                <XStack gap="$3" alignItems="center">
                  <Text fontSize="$5" fontWeight="600" color={textColor as any}>
                    {option.id.toUpperCase()})
                  </Text>
                  <Text fontSize="$4" color={textColor as any} flex={1}>
                    {option.text}
                  </Text>
                </XStack>
              </Card>
            );
          })}
        </YStack>

        {showFeedback && (
          <Card
            padding="$4"
            backgroundColor={isCorrect ? '$successSubtle' : '$dangerSubtle'}
            theme="alt2"
          >
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color={isCorrect ? '$success' : '$danger'}>
                {isCorrect
                  ? t('onboarding.levelTest.correct', '✓ Doğru!')
                  : t('onboarding.levelTest.wrong', '✗ Yanlış')}
              </Text>
              <Paragraph color="$text">{current.explanationTr}</Paragraph>
              {current.icaoReference && (
                <Text fontSize="$2" color="$textSecondary">
                  📘 {current.icaoReference}
                </Text>
              )}
            </YStack>
          </Card>
        )}

        {!showFeedback ? (
          <YStack gap="$2">
            <Button
              size="$5"
              backgroundColor={selectedId ? '$primary' : '$border'}
              color={selectedId ? '$primaryText' : '$textSecondary'}
              disabled={!selectedId}
              onPress={handleAnswer}
            >
              {t('onboarding.levelTest.answer', 'Cevapla')}
            </Button>
            <Button variant="outlined" onPress={handleSkip}>
              🤔 {t('onboarding.levelTest.skip', 'Bilmiyorum, geç')}
            </Button>
          </YStack>
        ) : (
          <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={handleNext}>
            {currentIdx + 1 >= total
              ? t('onboarding.levelTest.finish', 'Sonuçları gör →')
              : t('onboarding.levelTest.next', 'Sonraki soru →')}
          </Button>
        )}
      </YStack>
    </ScrollView>
  );
}
