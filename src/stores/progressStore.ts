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
  /**
   * Server'dan gelen progress'le local state'i birleştir.
   * Server source-of-truth — yarış durumlarında server tarafı kazanır:
   *   - completedLessonIds: union (server + local, dedup)
   *   - bestScores: per-lesson MAX(server, local)
   * Cihaz değişimi / uninstall sonrası login'de çağrılır.
   */
  hydrateFromServer: (snapshot: { completedLessonIds: string[]; bestScores: Record<string, number> }) => void;
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

      hydrateFromServer: (snapshot) => {
        const localIds = get().completedLessonIds;
        const merged = Array.from(new Set([...localIds, ...snapshot.completedLessonIds]));
        const localScores = get().bestScores;
        const mergedScores: Record<string, number> = { ...localScores };
        for (const [id, score] of Object.entries(snapshot.bestScores)) {
          mergedScores[id] = Math.max(mergedScores[id] ?? 0, score);
        }
        set({ completedLessonIds: merged, bestScores: mergedScores });
      },

      reset: () => set({ completedLessonIds: [], bestScores: {} }),
    }),
    {
      name: 'airspeak-progress',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
