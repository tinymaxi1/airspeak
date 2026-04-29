/**
 * Lesson history — günlük aktivite takibi (heatmap için).
 *
 * Profile'daki heatmap (12 hafta × 7 gün) bu store'dan beslenir.
 * Her ders/SRS/conversation tamamlandığında `recordActivity()` çağrılır,
 * günlük sayaç artar. 84 günlük rolling window tutar.
 *
 * Storage: MMKV persist. Ileride Supabase'e senkronize edilir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

const HEATMAP_DAYS = 84; // 12 hafta × 7 gün

export type ActivityKind = 'lesson' | 'srs' | 'conversation' | 'exam' | 'mock';

interface DailyEntry {
  /** YYYY-MM-DD (UTC) */
  date: string;
  count: number;
  /** Hangi türlerden geldi (debug + ileride filtreleme için) */
  kinds: Partial<Record<ActivityKind, number>>;
}

interface LessonHistoryState {
  /** En yeniden eskiye sıralı, en fazla 84 gün */
  history: DailyEntry[];

  recordActivity: (kind: ActivityKind, count?: number) => void;
  /** Heatmap için 84 günlük dizi (eski → yeni). Boş günler `count: 0`. */
  getHeatmapBuckets: () => { date: string; count: number }[];
  /** Heatmap'te en az bir aktivite olan gün sayısı */
  getActiveDayCount: () => number;
  /** Bir günde kaç aktivite var (yoksa 0) */
  getCountForDate: (date: string) => number;
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useLessonHistoryStore = create<LessonHistoryState>()(
  persist(
    (set, get) => ({
      history: [],

      recordActivity: (kind, count = 1) => {
        const today = todayKey();
        const list = get().history;
        const existingIdx = list.findIndex((e) => e.date === today);
        let next: DailyEntry[];
        if (existingIdx >= 0) {
          const existing = list[existingIdx]!;
          const updated: DailyEntry = {
            date: existing.date,
            count: existing.count + count,
            kinds: { ...existing.kinds, [kind]: (existing.kinds[kind] ?? 0) + count },
          };
          next = [...list];
          next[existingIdx] = updated;
        } else {
          next = [...list, { date: today, count, kinds: { [kind]: count } }];
        }
        // 84 günden eski kayıtları temizle
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - HEATMAP_DAYS);
        const cutoffKey = dateKey(cutoff);
        next = next.filter((e) => e.date >= cutoffKey).sort((a, b) => a.date.localeCompare(b.date));
        set({ history: next });
      },

      getHeatmapBuckets: () => {
        const map = new Map(get().history.map((e) => [e.date, e.count]));
        const out: { date: string; count: number }[] = [];
        const today = new Date();
        for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const k = dateKey(d);
          out.push({ date: k, count: map.get(k) ?? 0 });
        }
        return out;
      },

      getActiveDayCount: () => get().history.filter((e) => e.count > 0).length,

      getCountForDate: (date) => get().history.find((e) => e.date === date)?.count ?? 0,

      reset: () => set({ history: [] }),
    }),
    {
      name: 'airspeak-lesson-history',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
