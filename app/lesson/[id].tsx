import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import {
  LessonChrome,
  LessonOptionCard,
  LessonFeedbackInline,
  Button3D,
  Eyebrow as ASEyebrow,
  CoachMark,
} from '@/components/airspeak';
import { useLesson } from '@/features/content/api';
import type { ExerciseRow } from '@/features/content/types';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useProgressStore } from '@/stores/progressStore';
import { useQuestsStore } from '@/stores/questsStore';
import { useSrsStore } from '@/stores/srsStore';
import { useLessonHistoryStore } from '@/stores/lessonHistoryStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCoachMarkStore } from '@/stores/coachMarkStore';
import { useLessonProgressStore } from '@/stores/lessonProgressStore';
import { useDailyLimitsStore } from '@/stores/dailyLimitsStore';
import { useLessonLimit, bumpServerUsage } from '@/features/config/limits';
import { PaywallSheet } from '@/components/paywall/PaywallSheet';
import { track } from '@/lib/posthog';

export default function LessonScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const lessonSlug = typeof params.id === 'string' ? params.id : '';

  // ─────────── Stores ───────────
  const { addXp, recordDailyActivity, loseHeart, addCoins } = useGamificationStore();
  const hearts = useGamificationStore((s) => s.hearts ?? 5);
  const markLessonCompleted = useProgressStore((s) => s.markLessonCompleted);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);
  const reviewTerm = useSrsStore((s) => s.reviewTerm);
  const recordHistoryActivity = useLessonHistoryStore((s) => s.recordActivity);
  const recordRecentActivity = useActivityStore((s) => s.recordActivity);
  const lessonCoachSeen = useCoachMarkStore((s) => s.isSeen('lesson_first_open'));
  const markCoachSeen = useCoachMarkStore((s) => s.markSeen);

  // Persisted lesson progress (kaldığım yer)
  const persisted = useLessonProgressStore((s) => s.byLessonSlug[lessonSlug]);
  const saveProgress = useLessonProgressStore((s) => s.saveProgress);
  const markLessonProgressCompleted = useLessonProgressStore((s) => s.markCompleted);

  // Freemium günlük limit kontrolü
  const lessonLimit = useLessonLimit();
  const bumpDaily = useDailyLimitsStore((s) => s.bump);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // ─────────── DB lesson ───────────
  const { data: lesson, isLoading, error } = useLesson(lessonSlug);
  const exercises: ExerciseRow[] = lesson?.exercises ?? [];

  // ─────────── Local UI state ───────────
  const initialIdx = persisted?.currentIdx ?? 0;
  const initialCorrect = persisted?.correctCount ?? 0;

  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(initialCorrect);

  // İlk yüklemede persist edilen progress'i hydrate et — sadece ilk render
  // (exercises geldiğinde currentIdx out-of-range olabilir, clamp)
  useEffect(() => {
    if (exercises.length > 0) {
      const safeIdx = Math.min(currentIdx, exercises.length - 1);
      if (safeIdx !== currentIdx) setCurrentIdx(safeIdx);
      // İlk başlama timestamp
      if (!persisted?.startedAt) {
        saveProgress(lessonSlug, {
          startedAt: Date.now(),
          totalCount: exercises.length,
        });
      } else if (persisted.totalCount !== exercises.length) {
        saveProgress(lessonSlug, { totalCount: exercises.length });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  const total = exercises.length;
  const exercise = exercises[currentIdx];

  // ─────────── Loading / not found ───────────
  if (isLoading || (!lesson && !error)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF7' }}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={{ marginTop: 12, color: '#5A6478', fontSize: 13 }}>
          Ders yükleniyor…
        </Text>
      </View>
    );
  }

  if (error || !lesson || total === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF7', padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>✈️</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0E1116', marginBottom: 8 }}>
          Ders bulunamadı
        </Text>
        <Text style={{ fontSize: 13, color: '#5A6478', textAlign: 'center', marginBottom: 20 }}>
          Bu ders kaldırılmış veya henüz yayınlanmamış olabilir.
        </Text>
        <Button3D variant="primary" onPress={() => router.replace('/(tabs)/learn')}>
          Öğrenme ekranına dön
        </Button3D>
      </View>
    );
  }

  if (!exercise) {
    return (
      <LessonComplete
        correctCount={correctCount}
        total={total}
        exercises={exercises}
        lessonSlug={lessonSlug}
      />
    );
  }

  // Freemium limit aşıldıysa paywall göster (ders ortasında değil, başlangıçta)
  if (!lessonLimit.allowed && currentIdx === 0 && !persisted?.startedAt) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF7', padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>👑</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#0E1116', marginBottom: 8, textAlign: 'center' }}>
          Bugünkü ücretsiz dersleri tamamladın
        </Text>
        <Text style={{ fontSize: 13, color: '#5A6478', textAlign: 'center', marginBottom: 24, maxWidth: 320 }}>
          Bugün {lessonLimit.used}/{lessonLimit.limit} ders. Pro'ya geç → sınırsız ders.
        </Text>
        <Button3D variant="primary" onPress={() => setPaywallOpen(true)}>
          Pro'ya geç →
        </Button3D>
        <Button3D variant="ghost" onPress={() => router.back()}>
          Yarın geleceğim
        </Button3D>
        <PaywallSheet
          visible={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          reason="lesson_limit"
        />
      </View>
    );
  }

  const isCorrect = selected === exercise.correct_id;
  const dbOptions = (exercise.options ?? []) as { id: string; text: string }[];

  // ─────────── Handlers ───────────
  const handleAnswer = () => {
    if (!selected) return;
    setShowFeedback(true);
    const quality = isCorrect ? 4 : 1;
    if (exercise.vocab_term_id) {
      // SRS update via vocab_term_id (DB row id'si)
      reviewTerm(exercise.vocab_term_id, quality);
    }

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
      if (hearts <= 1) {
        setTimeout(() => router.push('/heart-refill'), 800);
      }
    }
  };

  const handleNext = () => {
    const isLast = currentIdx + 1 >= total;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;

    if (isLast) {
      addXp(50, 'lesson_completed');
      addCoins(10, 'lesson_completed');
      recordDailyActivity();
      recordHistoryActivity('lesson');
      bumpDaily('lessons_completed');
      void bumpServerUsage('lessons_completed');
      const score = Math.round((nextCorrect / total) * 100);
      markLessonCompleted(lessonSlug, score);
      recordRecentActivity({
        type: 'lesson',
        refId: lessonSlug,
        titleTr: lesson.title_tr ?? lesson.title,
        subtitleTr: `${nextCorrect}/${total} doğru`,
        score,
      });
      incrementQuest('complete_lessons', 1);
      incrementQuest('streak_check', 1);
      // Lesson progress'i tamamlandı işaretle (currentIdx 0'a sıfırlanır)
      markLessonProgressCompleted(lessonSlug);
      track('lesson_completed', {
        lesson_id: lessonSlug,
        score: nextCorrect,
        total,
      });
      // currentIdx total'a setlenir → exercise undefined → LessonComplete render
      setCurrentIdx(currentIdx + 1);
    } else {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      // Persist current state
      saveProgress(lessonSlug, {
        currentIdx: nextIdx,
        correctCount: nextCorrect,
      });
    }
    setSelected(null);
    setShowFeedback(false);
  };

  const exerciseTypeLabel = (type: string) =>
    ({
      'vocab-mc': 'Çoktan seçmeli',
      'fill-blank': 'Boşluk doldur',
      'dialogue-fill': 'Diyalog',
      'listening-mc': 'Dinleme',
      'pronunciation-record': 'Telaffuz',
      match: 'Eşleştir',
      order: 'Sırala',
      'drag-drop': 'Sürükle bırak',
      'open-text': 'Serbest cevap',
    })[type] ?? type;

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <LessonChrome
          progress={(currentIdx / total) * 100}
          hearts={hearts}
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
          {exercise.prompt_tr ?? exercise.prompt ?? ''}
        </Text>

        <View style={{ gap: 10, marginTop: 20 }}>
          {dbOptions.map((opt) => {
            const isSelected = selected === opt.id;
            const showAsCorrect = showFeedback && opt.id === exercise.correct_id;
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
              message={exercise.explanation_tr ?? exercise.explanation ?? ''}
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

      {!lessonCoachSeen && (
        <CoachMark
          text="Doğru cevabı seç → Cevapla'ya bas. Yanlışsa açıklamayı oku, hatalardan SRS otomatik tekrar üretir."
          position="top"
          onDismiss={() => markCoachSeen('lesson_first_open')}
        />
      )}
    </View>
  );
}

function LessonComplete({
  correctCount,
  total,
  exercises,
  lessonSlug: _lessonSlug,
}: {
  correctCount: number;
  total: number;
  exercises: ExerciseRow[];
  lessonSlug: string;
}) {
  const percent = Math.round((correctCount / total) * 100);
  const xpEarned = correctCount * 10 + 50;
  const isPerfect = correctCount === total;
  const uniqueTermCount = useMemo(
    () => new Set(exercises.map((e) => e.vocab_term_id).filter(Boolean)).size,
    [exercises],
  );

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
          TOUCHDOWN ✦ DERS TAMAM
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
          {isPerfect ? 'Mükemmel iniş.' : 'Güvenli iniş.'}
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_500Medium',
            fontSize: 15,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
          }}
        >
          {correctCount} / {total} doğru • %{percent}
        </Text>
      </View>

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
          KAZANILAN XP
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
          +10 🪙 coin
        </Text>
      </View>

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
          BU UÇUŞTA YENİ
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 17, color: '#FFFFFF' }}>
          {uniqueTermCount} terim · {exercises.length} egzersiz
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_400Regular',
            fontSize: 13,
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          Tekrar açarsan baştan başlarsın — ders şimdi tamamlanmış sayılır.
        </Text>
      </View>

      <Button3D variant="primary" fullWidth onPress={() => router.replace('/(tabs)/home')}>
        Ana sayfaya dön →
      </Button3D>
    </View>
  );
}
