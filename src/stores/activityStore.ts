/**
 * Activity store — son 10 ders/senaryo/sınav.
 *
 * Home'da "Kaldığın yer" widget için. Kullanıcı bir aktivite tamamlayınca
 * `recordActivity()` ile MRU listenin en başına eklenir, max 10 tutar.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type ActivityType = 'lesson' | 'conversation' | 'pronunciation' | 'srs' | 'exam' | 'readback';

export interface ActivityEntry {
  id: string; // benzersiz: `${type}:${refId}:${timestamp}`
  type: ActivityType;
  /** lesson_id, scenario_id, sentence_id, exam_id... — re-entry için */
  refId: string;
  /** UI'da gösterilecek başlık (TR) */
  titleTr: string;
  /** Opsiyonel ikincil bilgi (skor, kategori) */
  subtitleTr?: string;
  /** 0-100 arası skor (varsa) */
  score?: number;
  /** ISO timestamp */
  at: string;
}

interface ActivityState {
  recent: ActivityEntry[];
  recordActivity: (entry: Omit<ActivityEntry, 'id' | 'at'>) => void;
  clear: () => void;
}

const MAX_RECENT = 10;

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      recent: [],

      recordActivity: (entry) => {
        const now = new Date().toISOString();
        const id = `${entry.type}:${entry.refId}:${now}`;
        // Aynı (type, refId) varsa eskisini düşür, en başa ekle (MRU)
        const filtered = get().recent.filter(
          (e) => !(e.type === entry.type && e.refId === entry.refId),
        );
        const next: ActivityEntry[] = [{ ...entry, id, at: now }, ...filtered].slice(0, MAX_RECENT);
        set({ recent: next });
      },

      clear: () => set({ recent: [] }),
    }),
    {
      name: 'airspeak-activity',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
