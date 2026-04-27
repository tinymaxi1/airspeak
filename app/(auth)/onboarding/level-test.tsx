/**
 * Level Test — 4 Segmentli Çok Boyutlu Placement
 *
 * Akış:
 *   intro → 1/4 Genel İngilizce (6) → ara1 → 2/4 Aviation English (6, rol bazlı)
 *   → ara2 → 3/4 Aviation Knowledge (6, rol bazlı) → ara3 → 4/4 Communication (4)
 *   → result ekrana yönlendir (placement-result.tsx)
 *
 * Skip yok, hepsi zorunlu. "Daha fazla oku" ile uzun açıklama expand.
 */
import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Button, Card, Text, Progress } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  getQuestionsForSegment,
  calculateAllDimensions,
  calculateLevel,
  calculateScores,
  type Dimension,
  type PlacementQuestion,
} from '@/features/placement/questions';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { track } from '@/lib/posthog';

interface Answer {
  questionId: string;
  selectedId: string;
}

const SEGMENTS: { dim: Dimension; titleTr: string; emoji: string; descriptionTr: string }[] = [
  {
    dim: 'generalEnglish',
    titleTr: 'Genel İngilizce',
    emoji: '📚',
    descriptionTr: 'Havacılık DIŞI temel İngilizce yeterliliğin (gramer, kelime, okuma).',
  },
  {
    dim: 'aviationEnglish',
    titleTr: 'Havacılık İngilizcesi',
    emoji: '✈️',
    descriptionTr: 'Havacılığa özel İngilizce dil yeterliliğin (rolüne özel jargon, frazeoloji).',
  },
  {
    dim: 'aviationKnowledge',
    titleTr: 'Havacılık Bilgisi',
    emoji: '🛩️',
    descriptionTr: 'Operasyonel ve prosedürel bilgi seviyen (rolüne özel).',
  },
  {
    dim: 'communication',
    titleTr: 'İletişim & Mülakat',
    emoji: '💼',
    descriptionTr: 'Sözlü iletişim, mülakat senaryosu, kriz yönetimi yetkinliğin.',
  },
];

type Step = 'intro' | 'segment' | 'segmentBreak';

export default function LevelTestScreen() {
  const { t } = useTranslation();
  const setPlacementResult = useOnboardingStore((s) => s.setPlacementResult);
  const role = useOnboardingStore((s) => s.role);

  const [step, setStep] = useState<Step>('intro');
  const [segmentIdx, setSegmentIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLongExplanation, setShowLongExplanation] = useState(false);
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);

  // Her segment için soru havuzu (memoized)
  const segmentQuestions = useMemo<PlacementQuestion[][]>(
    () => SEGMENTS.map((s) => getQuestionsForSegment(role, s.dim)),
    [role],
  );

  const totalQuestions = segmentQuestions.reduce((sum, arr) => sum + arr.length, 0);
  const answeredCount = allAnswers.length;
  const overallProgress = (answeredCount / Math.max(totalQuestions, 1)) * 100;

  const currentSegment = SEGMENTS[segmentIdx];
  const currentSegmentPool = segmentQuestions[segmentIdx] ?? [];
  const currentQuestion = currentSegmentPool[questionIdx];

  // ═══════════════ INTRO ═══════════════
  if (step === 'intro') {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
          <Progress value={5} max={100} backgroundColor="$border">
            <Progress.Indicator animation="lazy" backgroundColor="$primary" />
          </Progress>
          <Paragraph size="$2" color="$textSecondary">
            {t('onboarding.step', 'Adım 2/5')}
          </Paragraph>

          <H2 color="$text">Çok Boyutlu Seviye Belirleme</H2>
          <Paragraph color="$textSecondary">
            {totalQuestions} soru · ~10 dakika · 4 farklı alanda seviyen ölçülecek.
          </Paragraph>

          <YStack gap="$2">
            {SEGMENTS.map((seg, idx) => {
              const count = segmentQuestions[idx]?.length ?? 0;
              return (
                <Card key={seg.dim} padding="$3" backgroundColor="$surface" bordered>
                  <XStack gap="$3" alignItems="center">
                    <Text fontSize={28}>{seg.emoji}</Text>
                    <YStack flex={1}>
                      <Text fontSize="$4" fontWeight="700" color="$text">
                        {idx + 1}. {seg.titleTr}
                      </Text>
                      <Text fontSize="$2" color="$textSecondary">
                        {seg.descriptionTr}
                      </Text>
                      <Text fontSize="$1" color="$primary" fontWeight="600">
                        {count} soru
                      </Text>
                    </YStack>
                  </XStack>
                </Card>
              );
            })}
          </YStack>

          <Card padding="$4" backgroundColor="$accent">
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color="$accentText">
                💡 Önemli
              </Text>
              <Paragraph color="$accentText">
                Yanlış cevap = ceza yok. Bu test sana özel ders zorluğunu ayarlamak için.
                Her sorunun ardından öğretici açıklama göreceksin.
              </Paragraph>
            </YStack>
          </Card>

          <Button
            size="$5"
            backgroundColor="$primary"
            color="$primaryText"
            onPress={() => {
              setStep('segment');
              track('level_test_started');
            }}
          >
            Teste başla →
          </Button>
        </YStack>
      </ScrollView>
    );
  }

  // ═══════════════ SEGMENT BREAK (ara kart) ═══════════════
  if (step === 'segmentBreak') {
    const justFinishedIdx = segmentIdx; // Tamamlanan segment
    const justFinished = SEGMENTS[justFinishedIdx];
    const nextSegmentIdx = justFinishedIdx + 1;
    const nextSegment = SEGMENTS[nextSegmentIdx];

    const finishedAnswers = allAnswers.filter((a) =>
      (segmentQuestions[justFinishedIdx] ?? []).some((q) => q.id === a.questionId),
    );
    const correctInSegment = finishedAnswers.filter((a) => {
      const q = (segmentQuestions[justFinishedIdx] ?? []).find((qq) => qq.id === a.questionId);
      return q && a.selectedId === q.correctId;
    }).length;

    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
          <Progress value={overallProgress} max={100} backgroundColor="$border">
            <Progress.Indicator animation="lazy" backgroundColor="$primary" />
          </Progress>

          <Card padding="$5" backgroundColor="$successSubtle">
            <YStack gap="$3" alignItems="center">
              <Text fontSize={64}>{justFinished?.emoji ?? '✅'}</Text>
              <H2 color="$text" textAlign="center">
                {justFinishedIdx + 1}/4 tamam!
              </H2>
              <Text fontSize="$5" fontWeight="700" color="$success">
                {justFinished?.titleTr}
              </Text>
              <Text fontSize="$3" color="$text" textAlign="center">
                {correctInSegment} / {finishedAnswers.length} doğru
              </Text>
            </YStack>
          </Card>

          {nextSegment && (
            <Card padding="$4" backgroundColor="$primary">
              <YStack gap="$2">
                <Text fontSize="$3" color="$primaryText" textTransform="uppercase">
                  Sıradaki segment
                </Text>
                <XStack gap="$2" alignItems="center">
                  <Text fontSize={32}>{nextSegment.emoji}</Text>
                  <YStack flex={1}>
                    <Text fontSize="$5" fontWeight="700" color="$primaryText">
                      {nextSegmentIdx + 1}/4 {nextSegment.titleTr}
                    </Text>
                    <Text fontSize="$2" color="$primaryText">
                      {nextSegment.descriptionTr}
                    </Text>
                    <Text fontSize="$2" color="$primaryText">
                      {segmentQuestions[nextSegmentIdx]?.length ?? 0} soru
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </Card>
          )}

          <Button
            size="$5"
            backgroundColor="$primary"
            color="$primaryText"
            onPress={() => {
              setSegmentIdx(nextSegmentIdx);
              setQuestionIdx(0);
              setSelectedId(null);
              setShowFeedback(false);
              setShowLongExplanation(false);
              setStep('segment');
            }}
          >
            Devam et →
          </Button>
        </YStack>
      </ScrollView>
    );
  }

  // ═══════════════ SEGMENT (soru ekranı) ═══════════════
  if (!currentQuestion) {
    // Bu segmentte hiç soru yok (ör. role havuz tükendi) → ara karta atla
    setStep('segmentBreak');
    return null;
  }

  const handleAnswer = () => {
    if (!selectedId) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!selectedId) return;
    const newAnswer: Answer = { questionId: currentQuestion.id, selectedId };
    const newAllAnswers = [...allAnswers, newAnswer];
    setAllAnswers(newAllAnswers);

    const isLastInSegment = questionIdx + 1 >= currentSegmentPool.length;
    const isLastSegment = segmentIdx >= SEGMENTS.length - 1;

    if (isLastInSegment && isLastSegment) {
      // Test tamamen bitti — 4 boyut sonuç + result ekrana yönlendir
      const dims = calculateAllDimensions(newAllAnswers, role);
      const allPool = segmentQuestions.flat();
      const level = calculateLevel(newAllAnswers, allPool);
      const scores = calculateScores(newAllAnswers, allPool);

      setPlacementResult({
        generalEnglish: dims.generalEnglish,
        aviationEnglish: dims.aviationEnglish,
        aviationKnowledge: dims.aviationKnowledge,
        communication: dims.communication,
        recommendations: dims.recommendations,
        completedAt: new Date().toISOString(),
        level,
        totalScore: scores.total,
        byCategory: scores.byCategory,
      });
      track('level_test_completed', {
        result_level: level,
        score: scores.total,
        general_english: dims.generalEnglish.label,
        aviation_english: dims.aviationEnglish.label,
        aviation_knowledge: dims.aviationKnowledge.label,
        communication: dims.communication.label,
      });
      router.replace('/(auth)/onboarding/placement-result');
    } else if (isLastInSegment) {
      // Segment bitti, ara karta git
      setStep('segmentBreak');
      setQuestionIdx(0);
      setSelectedId(null);
      setShowFeedback(false);
      setShowLongExplanation(false);
    } else {
      // Sonraki soru
      setQuestionIdx(questionIdx + 1);
      setSelectedId(null);
      setShowFeedback(false);
      setShowLongExplanation(false);
    }
  };

  const isCorrect = selectedId === currentQuestion.correctId;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={overallProgress} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>

        <XStack gap="$2" alignItems="center" justifyContent="space-between">
          <Text fontSize="$2" color="$textSecondary">
            {currentSegment?.emoji} {segmentIdx + 1}/4 {currentSegment?.titleTr}
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            Soru {questionIdx + 1} / {currentSegmentPool.length}
          </Text>
        </XStack>

        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            {currentQuestion.level} · {currentQuestion.format} · {currentQuestion.category}
          </Text>
        </Card>

        <H3 color="$text">{currentQuestion.question}</H3>

        {currentQuestion.questionTr && (
          <Text fontSize="$3" color="$textSecondary" fontStyle="italic">
            💡 {currentQuestion.questionTr}
          </Text>
        )}

        {currentQuestion.context && (
          <Card padding="$3" backgroundColor="$backgroundHover">
            <Text color="$textSecondary">{currentQuestion.context}</Text>
          </Card>
        )}

        <YStack gap="$3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isThisCorrect = option.id === currentQuestion.correctId;
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
          <Card padding="$4" backgroundColor={isCorrect ? '$successSubtle' : '$dangerSubtle'}>
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color={isCorrect ? '$success' : '$danger'}>
                {isCorrect ? '✓ Doğru!' : '✗ Yanlış'}
              </Text>
              <Paragraph color="$text">{currentQuestion.explanationTr}</Paragraph>
              {currentQuestion.icaoReference && (
                <Text fontSize="$2" color="$textSecondary">
                  📘 {currentQuestion.icaoReference}
                </Text>
              )}

              {/* Daha fazla oku — uzun açıklama */}
              {currentQuestion.explanationLongTr && (
                <YStack gap="$2" marginTop="$2">
                  {!showLongExplanation ? (
                    <Button
                      size="$3"
                      variant="outlined"
                      onPress={() => setShowLongExplanation(true)}
                    >
                      📖 Daha fazla oku
                    </Button>
                  ) : (
                    <Card padding="$3" backgroundColor="$surface" bordered>
                      <YStack gap="$2">
                        <Text fontSize="$3" color="$primary" textTransform="uppercase">
                          Detaylı açıklama
                        </Text>
                        <Paragraph color="$text">{currentQuestion.explanationLongTr}</Paragraph>
                        <Button size="$2" variant="outlined" onPress={() => setShowLongExplanation(false)}>
                          ▲ Kapat
                        </Button>
                      </YStack>
                    </Card>
                  )}
                </YStack>
              )}
            </YStack>
          </Card>
        )}

        {!showFeedback ? (
          <Button
            size="$5"
            backgroundColor={selectedId ? '$primary' : '$border'}
            color={selectedId ? '$primaryText' : '$textSecondary'}
            disabled={!selectedId}
            onPress={handleAnswer}
          >
            Cevapla
          </Button>
        ) : (
          <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={handleNext}>
            {questionIdx + 1 >= currentSegmentPool.length && segmentIdx >= SEGMENTS.length - 1
              ? 'Sonuçları gör →'
              : questionIdx + 1 >= currentSegmentPool.length
                ? `${segmentIdx + 2}/4'e geç →`
                : 'Sonraki soru →'}
          </Button>
        )}
      </YStack>
    </ScrollView>
  );
}
