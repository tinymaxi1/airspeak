/**
 * Squadron / Cohort state.
 *
 * Kullanıcı squadron-pairing ekranında doğru bir kod girerse
 * cohortCode persist edilir. Profile + ICAO ekranlarında "TK Academy 47" gibi
 * eğitmen bilgisi gösterilir.
 *
 * Gerçek backend gelmediğinde tamamen client tarafında çalışır.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { findCohortByCode, type Cohort } from '@/features/squadron/cohorts';

interface SquadronState {
  /** Kullanıcının join ettiği cohort kod (8 karakter). Yoksa null = solo flight. */
  cohortCode: string | null;
  /** Join tarihi (epoch ms) */
  joinedAt: number | null;

  joinCohort: (code: string) => boolean;
  leaveCohort: () => void;
  getCurrentCohort: () => Cohort | null;
  /** Sprint 14.C — user-switch flash önleme: logout'ta squadron reset. */
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useSquadronStore = create<SquadronState>()(
  persist(
    (set, get) => ({
      cohortCode: null,
      joinedAt: null,

      joinCohort: (code) => {
        const cohort = findCohortByCode(code);
        if (!cohort) return false;
        set({ cohortCode: cohort.code, joinedAt: Date.now() });
        return true;
      },

      leaveCohort: () => set({ cohortCode: null, joinedAt: null }),

      getCurrentCohort: () => {
        const code = get().cohortCode;
        return code ? findCohortByCode(code) ?? null : null;
      },

      reset: () => set({ cohortCode: null, joinedAt: null }),
    }),
    {
      name: 'airspeak-squadron',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
