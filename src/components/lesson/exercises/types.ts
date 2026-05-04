/**
 * Sprint 14.B.2 — Egzersiz tipleri için ortak interface
 *
 * Her custom egzersiz component'i kendi internal state'ini tutar
 * ve Cevapla butonunu kendi içinde render eder. Parent (lesson/[id].tsx)
 * onSubmit callback'i ile feedback akışını başlatır.
 *
 * Çoktan seçmeli (vocab-mc) için bu interface kullanılmaz — parent
 * default LessonOptionCard render eder.
 */
import type { ExerciseRow } from '@/features/content/types';

export interface ExerciseProps {
  exercise: ExerciseRow;
  /** Parent feedback gösteriyorsa true — child interactivity'sini disable et */
  showFeedback: boolean;
  /** Child butona basınca çağırır; parent SRS/XP/hearts akışını başlatır */
  onSubmit: (isCorrect: boolean) => void;
}
