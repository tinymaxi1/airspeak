/**
 * Daily Limits Store — kullanıcının bugünkü aktivite sayaçları (lokal MMKV).
 *
 * Free kullanıcı için günlük limitler kontrol edilir; aşılınca paywall açılır.
 * Premium kullanıcı için sayaç tutulur ama limit uygulanmaz.
 *
 * Server-side (daily_usage tablosu) ile sync edilir, ama lokal cache UI için yeterlidir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

interface DailyCounters {
  /** Yyyy-mm-dd */
  day: string;
  lessons_completed: number;
  ai_conversations: number;
  vocab_lookups: number;
  pronunciation_attempts: number;
  oral_attempts: number;
  ads_watched: number;
  hearts_refilled_via_ad: number;
}

interface DailyLimitsState {
  counters: DailyCounters;
  bump: (field: keyof Omit<DailyCounters, 'day'>, amount?: number) => void;
  reset: () => void;
  /** Bugün değiştiyse sayaçları sıfırla */
  rolloverIfNeeded: () => void;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const empty = (): DailyCounters => ({
  day: todayKey(),
  lessons_completed: 0,
  ai_conversations: 0,
  vocab_lookups: 0,
  pronunciation_attempts: 0,
  oral_attempts: 0,
  ads_watched: 0,
  hearts_refilled_via_ad: 0,
});

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useDailyLimitsStore = create<DailyLimitsState>()(
  persist(
    (set, get) => ({
      counters: empty(),

      bump: (field, amount = 1) => {
        get().rolloverIfNeeded();
        set((s) => ({
          counters: { ...s.counters, [field]: s.counters[field] + amount },
        }));
      },

      reset: () => set({ counters: empty() }),

      rolloverIfNeeded: () => {
        const today = todayKey();
        if (get().counters.day !== today) {
          set({ counters: empty() });
        }
      },
    }),
    {
      name: 'airspeak-daily-limits',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
