import { ScrollView, View, Text } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import {
  LessonChrome,
  LessonOptionCard,
  LessonFeedbackInline,
  Button3D,
  Eyebrow as ASEyebrow,
} from '@/components/airspeak';
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
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <LessonChrome
          progress={(currentIdx / total) * 100}
          hearts={5}
          onClose={() => router.back()}
        />
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <ASEyebrow>{exerciseTypeLabel(exercise.type)}</ASEyebrow>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 24,
            fontWeight: '700',
            color: '#0E1116',
            marginTop: 6,
            lineHeight: 29,
            letterSpacing: -0.48,
          }}
        >
          {exercise.question}
        </Text>

        <View style={{ gap: 10, marginTop: 20 }}>
          {exercise.options.map((opt) => {
            const isSelected = selected === opt.id;
            const showAsCorrect = showFeedback && opt.id === exercise.correctId;
            const showAsWrong = showFeedback && isSelected && !showAsCorrect;
            const optState: 'idle' | 'correct' | 'wrong' = showAsCorrect
              ? 'correct'
              : showAsWrong
                ? 'wrong'
                : 'idle';

            return (
              <LessonOptionCard
                key={opt.id}
                letter={opt.id}
                text={opt.text}
                selected={isSelected}
                state={optState}
                onPress={() => !showFeedback && setSelected(opt.id)}
              />
            );
          })}
        </View>

        {showFeedback && (
          <View style={{ marginTop: 16 }}>
            <LessonFeedbackInline
              state={isCorrect ? 'correct' : 'wrong'}
              message={exercise.explanation}
            />
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ borderTopWidth: 1, borderTopColor: '#DCE0E8' }}>
        <View style={{ padding: 16 }}>
          {!showFeedback ? (
            <Button3D variant="primary" fullWidth disabled={!selected} onPress={handleAnswer}>
              Cevapla
            </Button3D>
          ) : (
            <Button3D variant="primary" fullWidth onPress={handleNext}>
              {currentIdx + 1 >= total ? 'Dersi bitir →' : 'Sonraki egzersiz →'}
            </Button3D>
          )}
        </View>
      </SafeAreaView>
    </View>
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
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F1E47',
        justifyContent: 'center',
        padding: 24,
        gap: 24,
      }}
    >
      <CelebrationOverlay
        emoji={isPerfect ? '🏆' : '🎉'}
        title={isPerfect ? 'Mükemmel!' : 'Tebrikler!'}
        subtitle={`+${xpEarned} XP`}
        visible={true}
      />

      {/* TOUCHDOWN moment */}
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 80 }}>{isPerfect ? '🏆' : '✈'}</Text>
        <Text
          style={{
            fontFamily: 'JetBrainsMono_500Medium',
            fontSize: 12,
            letterSpacing: 2.16,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
          }}
        >
          TOUCHDOWN ✦ LESSON COMPLETE
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 38,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: -1.14,
            textAlign: 'center',
            lineHeight: 40,
          }}
        >
          {isPerfect ? 'Perfect landing.' : 'Safely on the runway.'}
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 15,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
          }}
        >
          {correctCount} / {total} correct • {percent}%
        </Text>
      </View>

      {/* XP Card */}
      <View
        style={{
          backgroundColor: '#E63946',
          borderRadius: 14,
          padding: 20,
          alignItems: 'center',
          borderBottomWidth: 4,
          borderBottomColor: '#C8202E',
        }}
      >
        <Text
          style={{
            fontFamily: 'JetBrainsMono_500Medium',
            fontSize: 11,
            letterSpacing: 1.8,
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
          }}
        >
          XP EARNED
        </Text>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 56,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: -1.68,
            lineHeight: 56,
            marginTop: 4,
          }}
        >
          +{xpEarned}
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 4,
          }}
        >
          +10 🪙 coins
        </Text>
      </View>

      {/* Insight Card */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          gap: 4,
        }}
      >
        <Text
          style={{
            fontFamily: 'JetBrainsMono_500Medium',
            fontSize: 11,
            letterSpacing: 1.8,
            color: 'rgba(255,255,255,0.65)',
            textTransform: 'uppercase',
          }}
        >
          NEW IN THIS FLIGHT
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#FFFFFF' }}>
          {new Set(exercises.map((e) => e.termId)).size} terim · {exercises.length} egzersiz
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
          Tekrarsız sistemde — bir daha karşılaşmayacaksın.
        </Text>
      </View>

      <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
        Back to home →
      </Button3D>
    </View>
  );
}
