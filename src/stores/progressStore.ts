/**
 * Progress store — kullanıcının tamamladığı dersler.
 * Sprint 2'de Supabase'e senkronize edilir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

interface ProgressState {
  completedLessonIds: string[];
  bestScores: Record<string, number>; // lesson_id → 0-100

  markLessonCompleted: (lessonId: string, score: number) => void;
  isCompleted: (lessonId: string) => boolean;
  getCompletedSet: () => Set<string>;
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessonIds: [],
      bestScores: {},

      markLessonCompleted: (lessonId, score) => {
        const list = get().completedLessonIds;
        const updated = list.includes(lessonId) ? list : [...list, lessonId];
        const previousScore = get().bestScores[lessonId] ?? 0;
        const newScore = Math.max(previousScore, score);
        set({
          completedLessonIds: updated,
          bestScores: { ...get().bestScores, [lessonId]: newScore },
        });
      },

      isCompleted: (lessonId) => get().completedLessonIds.includes(lessonId),
      getCompletedSet: () => new Set(get().completedLessonIds),

      reset: () => set({ completedLessonIds: [], bestScores: {} }),
    }),
    {
      name: 'airspeak-progress',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
