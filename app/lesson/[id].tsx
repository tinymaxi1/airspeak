import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Progress } from 'tamagui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import { generateLesson } from '@/features/lessons/lessonGenerator';
import type { Exercise } from '@/features/lessons/exerciseTypes';
import { getVocabForRole } from '@/features/lessons/seed';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useQuestsStore } from '@/stores/questsStore';
import { useExerciseHistoryStore } from '@/stores/exerciseHistoryStore';
import { track } from '@/lib/posthog';

export default function LessonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { addXp, recordDailyActivity, loseHeart, addCoins } = useGamificationStore();
  const markLessonCompleted = useProgressStore((s) => s.markLessonCompleted);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);
  const role = useOnboardingStore((s) => s.role);
  const seenIds = useExerciseHistoryStore((s) => s.seenExerciseIds);
  const seenSet = useMemo(() => new Set(seenIds), [seenIds]);
  const markSeen = useExerciseHistoryStore((s) => s.markSeen);

  const [exercises] = useState<Exercise[]>(() =>
    generateLesson(getVocabForRole(role), seenSet, 5),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const total = exercises.length;
  const exercise = exercises[currentIdx];

  if (!exercise) {
    return <LessonComplete correctCount={correctCount} total={total} exercises={exercises} markSeen={markSeen} />;
  }

  const isCorrect = selected === exercise.correctId;

  const handleAnswer = () => {
    if (!selected) return;
    setShowFeedback(true);
    if (isCorrect) {
      addXp(10, 'lesson_exercise');
      setCorrectCount((c) => c + 1);
      track('exercise_answered', {
        exercise_id: exercise.id,
        type: exercise.type,
        is_correct: true,
      });
    } else {
      loseHeart();
      track('exercise_answered', {
        exercise_id: exercise.id,
        type: exercise.type,
        is_correct: false,
      });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= total) {
      addXp(50, 'lesson_completed');
      addCoins(10, 'lesson_completed');
      recordDailyActivity();
      const score = Math.round((correctCount / total) * 100);
      const lessonId = typeof params.id === 'string' ? params.id : 'unknown';
      markLessonCompleted(lessonId, score);
      // No-repeat: tüm egzersizleri "görüldü" olarak işaretle
      markSeen(exercises.map((e) => e.id));
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

  const exerciseTypeLabel = (type: string) =>
    ({
      tr_to_en: 'TR → EN',
      en_to_tr: 'EN → TR',
      fill_blank: 'Boşluk doldur',
      definition_match: 'Tanımdan terim',
      term_to_definition: 'Terimden tanım',
      sentence_build: 'Cümle kur',
      category_match: 'Kategori',
      true_false: 'Doğru / Yanlış',
    })[type] ?? type;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={(currentIdx / total) * 100} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <Paragraph size="$2" color="$textSecondary">
          Egzersiz {currentIdx + 1} / {total}
        </Paragraph>

        <Card padding="$3" backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
            {exerciseTypeLabel(exercise.type)}
          </Text>
        </Card>

        <H3 color="$text">{exercise.question}</H3>

        <YStack gap="$3">
          {exercise.options.map((opt) => {
            const isSelected = selected === opt.id;
            const showAsCorrect = showFeedback && opt.id === exercise.correctId;
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
                key={opt.id}
                bordered
                padding="$4"
                backgroundColor={bg as any}
                borderColor={border as any}
                onPress={() => !showFeedback && setSelected(opt.id)}
                disabled={showFeedback}
                pressStyle={{ scale: 0.98 }}
              >
                <Text fontSize="$5" fontWeight="500" color={color as any}>
                  {opt.text}
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
                {isCorrect ? '✓ Doğru! +10 XP' : '✗ Yanlış'}
              </Text>
              <Paragraph color="$text">{exercise.explanation}</Paragraph>
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

function LessonComplete({
  correctCount,
  total,
  exercises,
  markSeen: _markSeen,
}: {
  correctCount: number;
  total: number;
  exercises: Exercise[];
  markSeen: (ids: string[]) => void;
}) {
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

      <Card padding="$3" backgroundColor="$surface" bordered>
        <YStack gap="$1">
          <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
            Bu derste yeni
          </Text>
          <Text fontSize="$4" color="$text">
            {new Set(exercises.map((e) => e.termId)).size} terim, {exercises.length} egzersiz
          </Text>
          <Text fontSize="$2" color="$textSecondary">
            Bu egzersizler artık "görüldü" işaretlendi — bir daha karşılaşmayacaksın.
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
