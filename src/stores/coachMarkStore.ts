/**
 * Coach mark store — bir kerelik tooltip/onboarding ipuçları için.
 *
 * Her ekran ya da feature için unique key. `markSeen()` çağrılırsa
 * bir daha gösterilmez. Persisted MMKV'de.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type CoachKey =
  | 'lesson_first_open'
  | 'conversation_first_open'
  | 'league_first_open'
  | 'home_search_button'
  | 'profile_heatmap'
  | 'vocab_bookmark';

interface CoachMarkState {
  seen: CoachKey[];
  isSeen: (key: CoachKey) => boolean;
  markSeen: (key: CoachKey) => void;
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useCoachMarkStore = create<CoachMarkState>()(
  persist(
    (set, get) => ({
      seen: [],
      isSeen: (key) => get().seen.includes(key),
      markSeen: (key) => {
        if (get().seen.includes(key)) return;
        set({ seen: [...get().seen, key] });
      },
      reset: () => set({ seen: [] }),
    }),
    {
      name: 'airspeak-coach-marks',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
