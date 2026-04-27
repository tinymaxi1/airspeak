/**
 * Onboarding state — kullanıcının onboarding boyunca verdiği yanıtlar.
 * Tamamlanınca profile'a yazılır (Sprint 1 sonu).
 *
 * 4-boyutlu placement sistemi:
 * - generalEnglish (CEFR)
 * - aviationEnglish (rol bazlı havacılık dili)
 * - aviationKnowledge (rol bazlı operasyonel bilgi)
 * - communication (sözlü/mülakat/senaryo)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import type {
  UserRole,
  Level,
  DimensionResult,
  Recommendations,
} from '@/types/profile';

export type UserStatus = 'student' | 'graduate' | 'working' | 'switching';
export type Goal =
  | 'icao_4'
  | 'shgm_renewal'
  | 'airline_interview'
  | 'general_aviation_english'
  | 'work_abroad'
  | 'career_advancement'
  | 'university_exam'
  | 'fun';

/**
 * 4-boyutlu placement sonucu.
 *
 * Geriye uyumlu alanlar (level, totalScore, byCategory) korunur — eski
 * tüketici dosyalar (home.tsx, profile.tsx) ufak refactor'a kadar çalışır.
 */
export interface PlacementResult {
  // === 4 boyut (yeni) ===
  generalEnglish: DimensionResult;
  aviationEnglish: DimensionResult;
  aviationKnowledge: DimensionResult;
  communication: DimensionResult;
  recommendations: Recommendations;
  /** ISO date string */
  completedAt: string;

  // === Geriye uyumlu (deprecated alias) ===
  /** = generalEnglish.label (CEFR) */
  level: Level;
  /** 4 boyut ortalaması (%) */
  totalScore: number;
  /** Tüm kategori toplamı (eski 6-kategori şeması) */
  byCategory: {
    vocabulary: number;
    listening: number;
    phraseology: number;
    grammar: number;
    reading: number;
    critical: number;
  };
}

export interface OnboardingState {
  role: UserRole | null;
  status: UserStatus | null;
  goals: Goal[];
  examType: string | null;
  examDate: string | null; // ISO date
  selfReportedLevel: Level | 'unknown' | null;
  dailyGoalMinutes: 5 | 10 | 15 | 30 | 60 | null;
  activeHours: number[];
  notificationPrefs: {
    streak: boolean;
    dailyQuest: boolean;
    league: boolean;
    marketing: boolean;
  };
  placementResult: PlacementResult | null;

  // Setters
  setRole: (role: UserRole) => void;
  setStatus: (status: UserStatus) => void;
  toggleGoal: (goal: Goal) => void;
  setExam: (examType: string | null, examDate: string | null) => void;
  setSelfLevel: (level: Level | 'unknown') => void;
  setDailyGoal: (minutes: 5 | 10 | 15 | 30 | 60) => void;
  setActiveHours: (hours: number[]) => void;
  setNotificationPref: (
    key: keyof OnboardingState['notificationPrefs'],
    value: boolean,
  ) => void;
  setPlacementResult: (result: PlacementResult) => void;
  reset: () => void;
}

const initialState = {
  role: null,
  status: null,
  goals: [],
  examType: null,
  examDate: null,
  selfReportedLevel: null,
  dailyGoalMinutes: null,
  activeHours: [18, 19, 20, 21],
  notificationPrefs: {
    streak: true,
    dailyQuest: true,
    league: true,
    marketing: false,
  },
  placementResult: null,
};

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setRole: (role) => set({ role }),
      setStatus: (status) => set({ status }),
      toggleGoal: (goal) => {
        const goals = get().goals;
        if (goals.includes(goal)) {
          set({ goals: goals.filter((g) => g !== goal) });
        } else if (goals.length < 3) {
          set({ goals: [...goals, goal] });
        }
      },
      setExam: (examType, examDate) => set({ examType, examDate }),
      setSelfLevel: (level) => set({ selfReportedLevel: level }),
      setDailyGoal: (minutes) => set({ dailyGoalMinutes: minutes }),
      setActiveHours: (hours) => set({ activeHours: hours }),
      setNotificationPref: (key, value) =>
        set({ notificationPrefs: { ...get().notificationPrefs, [key]: value } }),
      setPlacementResult: (result) => set({ placementResult: result }),
      reset: () => set(initialState),
    }),
    {
      name: 'airspeak-onboarding',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
