/**
 * Unit intro store — Sprint 12.
 * Her ünitenin intro modal'ı sadece ilk tıklamada açılır. Kullanıcı
 * isterse lesson tree header'daki "i" ikonu ile manuel tekrar açabilir.
 *
 * Persistence: MMKV.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

interface UnitIntroState {
  seenUnitIds: string[];
  isSeen: (unitId: string) => boolean;
  markSeen: (unitId: string) => void;
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useUnitIntroStore = create<UnitIntroState>()(
  persist(
    (set, get) => ({
      seenUnitIds: [],
      isSeen: (unitId) => get().seenUnitIds.includes(unitId),
      markSeen: (unitId) => {
        if (get().seenUnitIds.includes(unitId)) return;
        set({ seenUnitIds: [...get().seenUnitIds, unitId] });
      },
      reset: () => set({ seenUnitIds: [] }),
    }),
    {
      name: 'airspeak-unit-intros',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
