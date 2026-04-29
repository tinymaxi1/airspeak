/**
 * Lesson Progress Store — kullanıcı bir dersi yarıda bırakırsa kaldığı egzersiz indeksini
 * MMKV'ye persist eder. Tekrar açılışta o indeksten devam eder.
 *
 * Bu store, statik egzersiz havuzu varsayar (Faz 2 sonrası — DB'den sıralı geliyor).
 * Eskiden lessonGenerator her açılışta random 5 egzersiz seçtiği için "kaldığım yer"
 * mantıksızdı; artık aynı lesson her açılışta aynı sıralı egzersizleri gösteriyor.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export interface LessonProgress {
  /** 0-tabanlı, çözmesi gereken bir sonraki egzersiz indeksi */
  currentIdx: number;
  /** O ana kadar doğru cevap sayısı */
  correctCount: number;
  /** Lesson'a ilk başlama timestamp'i */
  startedAt: number;
  /** Tamamlandıysa timestamp; undefined = devam ediyor */
  completedAt?: number;
  /** Toplam egzersiz sayısı (DB'den geldiğinde kayıt edilir) */
  totalCount?: number;
}

interface LessonProgressState {
  byLessonSlug: Record<string, LessonProgress>;

  /** Bir lesson için mevcut progress'i getir (yoksa default 0) */
  getProgress: (lessonSlug: string) => LessonProgress;

  /** Progress'i güncelle (kısmi update) */
  saveProgress: (lessonSlug: string, partial: Partial<LessonProgress>) => void;

  /** Tamamlandı işaretle (currentIdx sıfırlanır, sonraki açılışta baştan başlar) */
  markCompleted: (lessonSlug: string) => void;

  /** Belirli lesson'ı sıfırla (baştan başla) */
  resetProgress: (lessonSlug: string) => void;

  /** Tüm lesson progress'lerini sıfırla (logout, hesap silme) */
  resetAll: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

const DEFAULT_PROGRESS: LessonProgress = {
  currentIdx: 0,
  correctCount: 0,
  startedAt: 0,
};

export const useLessonProgressStore = create<LessonProgressState>()(
  persist(
    (set, get) => ({
      byLessonSlug: {},

      getProgress: (lessonSlug) => {
        return get().byLessonSlug[lessonSlug] ?? DEFAULT_PROGRESS;
      },

      saveProgress: (lessonSlug, partial) => {
        set((state) => {
          const existing = state.byLessonSlug[lessonSlug] ?? {
            ...DEFAULT_PROGRESS,
            startedAt: Date.now(),
          };
          return {
            byLessonSlug: {
              ...state.byLessonSlug,
              [lessonSlug]: { ...existing, ...partial },
            },
          };
        });
      },

      markCompleted: (lessonSlug) => {
        set((state) => {
          const existing = state.byLessonSlug[lessonSlug] ?? {
            ...DEFAULT_PROGRESS,
            startedAt: Date.now(),
          };
          return {
            byLessonSlug: {
              ...state.byLessonSlug,
              [lessonSlug]: {
                ...existing,
                completedAt: Date.now(),
                currentIdx: 0, // Yeniden açılırsa baştan
              },
            },
          };
        });
      },

      resetProgress: (lessonSlug) => {
        set((state) => {
          const next = { ...state.byLessonSlug };
          delete next[lessonSlug];
          return { byLessonSlug: next };
        });
      },

      resetAll: () => {
        set({ byLessonSlug: {} });
      },
    }),
    {
      name: 'airspeak-lesson-progress',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
