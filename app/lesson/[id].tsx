import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Progress } from 'tamagui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import type { VocabularyTerm } from '@/features/lessons/seed/pilotVocab';
import { getVocabForRole } from '@/features/lessons/seed';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useQuestsStore } from '@/stores/questsStore';
import { track } from '@/lib/posthog';

interface VocabExercise {
  type: 'multiple_choice';
  questionTerm: VocabularyTerm;
  correctOption: string;
  options: string[];
}

/**
 * Sample lesson — ilk 5 vocab terimini quiz formatında gösterir.
 * Sprint 2'de generic LessonRunner'a evrilecek.
 */
function generateExercises(terms: VocabularyTerm[]): VocabExercise[] {
  return terms.slice(0, 5).map((term) => {
    const otherTerms = terms.filter((t) => t.id !== term.id);
    const distractors = shuffle(otherTerms).slice(0, 3).map((t) => t.termTr);
    const options = shuffle([term.termTr, ...distractors]);
    return {
      type: 'multiple_choice',
      questionTerm: term,
      correctOption: term.termTr,
      options,
    };
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export default function LessonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { addXp, recordDailyActivity, loseHeart, addCoins } = useGamificationStore();
  const markLessonCompleted = useProgressStore((s) => s.markLessonCompleted);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);
  const role = useOnboardingStore((s) => s.role);
  const [exercises] = useState<VocabExercise[]>(() => generateExercises(getVocabForRole(role)));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const total = exercises.length;
  const exercise = exercises[currentIdx];

  if (!exercise) {
    // Lesson finished
    return <LessonComplete correctCount={correctCount} total={total} />;
  }

  const isCorrect = selected === exercise.correctOption;

  const handleAnswer = () => {
    if (!selected) return;
    setShowFeedback(true);
    if (isCorrect) {
      addXp(10, 'lesson_exercise');
      setCorrectCount((c) => c + 1);
      track('exercise_answered', {
        exercise_id: exercise.questionTerm.id,
        is_correct: true,
      });
    } else {
      loseHeart();
      track('exercise_answered', {
        exercise_id: exercise.questionTerm.id,
        is_correct: false,
      });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= total) {
      // Bonus XP for completing the lesson
      addXp(50, 'lesson_completed');
      addCoins(10, 'lesson_completed');
      recordDailyActivity();
      const score = Math.round((correctCount / total) * 100);
      const lessonId = typeof params.id === 'string' ? params.id : 'unknown';
      markLessonCompleted(lessonId, score);
      // Daily quest progress
      incrementQuest('complete_lessons', 1);
      incrementQuest('streak_check', 1);
      track('lesson_completed', {
        lesson_id: lessonId,
        score: correctCount,
        total,
      });
    }
    setCurrentIdx(currentIdx + 1);
    setSelected(null);
    setShowFeedback(false);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress
          value={(currentIdx / total) * 100}
          max={100}
          backgroundColor="$border"
        >
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <Paragraph size="$2" color="$textSecondary">
          Egzersiz {currentIdx + 1} / {total}
        </Paragraph>

        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            {exercise.questionTerm.category} · {exercise.questionTerm.pronunciation}
          </Text>
        </Card>

        <H2 color="$text">"{exercise.questionTerm.term}"</H2>
        <H3 color="$textSecondary" fontWeight="400">
          Türkçesi nedir?
        </H3>

        <YStack gap="$3">
          {exercise.options.map((opt) => {
            const isSelected = selected === opt;
            const showAsCorrect = showFeedback && opt === exercise.correctOption;
            const showAsWrong = showFeedback && isSelected && !showAsCorrect;

            let bg: string = '$surface';
            let border: string = '$border';
            let color: string = '$text';
            if (showAsCorrect) {
              bg = '$success';
              border = '$success';
              color = '$primaryText';
            } else if (showAsWrong) {
              bg = '$danger';
              border = '$danger';
              color = '$primaryText';
            } else if (isSelected) {
              bg = '$primary';
              border = '$primary';
              color = '$primaryText';
            }

            return (
              <Card
                key={opt}
                bordered
                padding="$4"
                backgroundColor={bg as any}
                borderColor={border as any}
                onPress={() => !showFeedback && setSelected(opt)}
                disabled={showFeedback}
                pressStyle={{ scale: 0.98 }}
              >
                <Text fontSize="$5" fontWeight="500" color={color as any}>
                  {opt}
                </Text>
              </Card>
            );
          })}
        </YStack>

        {showFeedback && (
          <Card
            padding="$4"
            backgroundColor={isCorrect ? '$successSubtle' : '$dangerSubtle'}
          >
            <YStack gap="$2">
              <Text fontSize="$5" fontWeight="600" color={isCorrect ? '$success' : '$danger'}>
                {isCorrect ? '✓ Doğru! +10 XP' : `✗ Doğru cevap: ${exercise.correctOption}`}
              </Text>
              <Paragraph color="$text">{exercise.questionTerm.definitionTr}</Paragraph>
              {exercise.questionTerm.examples[0] && (
                <YStack gap="$1" marginTop="$2">
                  <Text fontSize="$3" fontStyle="italic" color="$text">
                    {exercise.questionTerm.examples[0].en}
                  </Text>
                  <Text fontSize="$3" color="$textSecondary">
                    {exercise.questionTerm.examples[0].tr}
                  </Text>
                </YStack>
              )}
            </YStack>
          </Card>
        )}

        {!showFeedback ? (
          <Button
            size="$5"
            backgroundColor={selected ? '$primary' : '$border'}
            color={selected ? '$primaryText' : '$textSecondary'}
            disabled={!selected}
            onPress={handleAnswer}
          >
            Cevapla
          </Button>
        ) : (
          <Button size="$5" backgroundColor="$primary" color="$primaryText" onPress={handleNext}>
            {currentIdx + 1 >= total ? 'Dersi bitir →' : 'Sonraki egzersiz →'}
          </Button>
        )}
      </YStack>
    </ScrollView>
  );
}

function LessonComplete({ correctCount, total }: { correctCount: number; total: number }) {
  const percent = Math.round((correctCount / total) * 100);
  const xpEarned = correctCount * 10 + 50;
  const isPerfect = correctCount === total;

  return (
    <YStack flex={1} padding="$4" gap="$5" backgroundColor="$background" justifyContent="center">
      <CelebrationOverlay
        emoji={isPerfect ? '🏆' : '🎉'}
        title={isPerfect ? 'Mükemmel!' : 'Tebrikler!'}
        subtitle={`+${xpEarned} XP`}
        visible={true}
      />
      <YStack alignItems="center" gap="$3">
        <Text fontSize={64}>🎉</Text>
        <H2 color="$text">Ders tamamlandı!</H2>
        <Text fontSize="$5" color="$textSecondary">
          {correctCount} / {total} doğru ({percent}%)
        </Text>
      </YStack>

      <Card padding="$4" backgroundColor="$accent">
        <YStack gap="$2" alignItems="center">
          <Text fontSize="$3" color="$accentText" textTransform="uppercase">
            Kazandığın
          </Text>
          <Text fontSize="$8" fontWeight="700" color="$accentText">
            +{xpEarned} XP
          </Text>
          <Text fontSize="$3" color="$accentText">
            +10 🪙 coin
          </Text>
        </YStack>
      </Card>

      <Button
        size="$5"
        backgroundColor="$primary"
        color="$primaryText"
        onPress={() => router.replace('/(tabs)/home')}
      >
        Ana sayfaya dön
      </Button>
    </YStack>
  );
}
