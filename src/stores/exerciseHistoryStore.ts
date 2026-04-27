/**
 * Exercise history — kullanıcının gördüğü egzersizleri takip eder.
 * "Tekrarsız" akış için kritik.
 *
 * Görülen exercise.id'ler set'te tutulur. Lesson generator
 * bu set'te olmayanlardan seçim yapar.
 *
 * Sprint 2'de Supabase'e senkronize edilir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

interface ExerciseHistoryState {
  seenExerciseIds: string[];

  markSeen: (exerciseIds: string[]) => void;
  isSeen: (exerciseId: string) => boolean;
  getSeenSet: () => Set<string>;
  clear: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useExerciseHistoryStore = create<ExerciseHistoryState>()(
  persist(
    (set, get) => ({
      seenExerciseIds: [],

      markSeen: (exerciseIds) => {
        const current = new Set(get().seenExerciseIds);
        for (const id of exerciseIds) current.add(id);
        set({ seenExerciseIds: Array.from(current) });
      },

      isSeen: (id) => get().seenExerciseIds.includes(id),

      getSeenSet: () => new Set(get().seenExerciseIds),

      clear: () => set({ seenExerciseIds: [] }),
    }),
    {
      name: 'airspeak-exercise-history',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
