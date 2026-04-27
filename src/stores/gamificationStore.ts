/**
 * Gamification state — XP, level, streak, hearts, coins.
 *
 * Mock-first: tüm hesap istemci tarafında, MMKV'de saklanır.
 * Sprint 3'te Supabase'e senkronize edilir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { track } from '@/lib/posthog';
import { useQuestsStore } from './questsStore';

interface GamificationState {
  totalXp: number;
  currentLevel: number;
  xpInLevel: number;
  xpToNext: number;

  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD

  hearts: number;
  maxHearts: number;
  lastHeartRefill: number; // timestamp

  coins: number;

  // Aksiyonlar
  addXp: (amount: number, source: string) => void;
  recordDailyActivity: () => void;
  loseHeart: () => void;
  refillHearts: () => void;
  addCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, reason: string) => boolean;
  reset: () => void;
}

/**
 * Level eşiği: kümülatif XP = 100 * N^1.5
 * L1: 100 / L5: 1118 / L10: 3162 / L25: 12500 / L50: 35355
 */
function xpToReachLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function calculateLevelFromXp(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpToNext: number;
} {
  let level = 1;
  while (xpToReachLevel(level + 1) <= totalXp) {
    level += 1;
  }
  const xpAtCurrentLevel = xpToReachLevel(level);
  const xpAtNextLevel = xpToReachLevel(level + 1);
  return {
    level,
    xpInLevel: totalXp - xpAtCurrentLevel,
    xpToNext: xpAtNextLevel - xpAtCurrentLevel,
  };
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10);
}

const initialState = {
  totalXp: 0,
  currentLevel: 1,
  xpInLevel: 0,
  xpToNext: xpToReachLevel(2),
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  hearts: 5,
  maxHearts: 5,
  lastHeartRefill: Date.now(),
  coins: 0,
};

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXp: (amount, source) => {
        const newTotal = get().totalXp + amount;
        const oldLevel = get().currentLevel;
        const calc = calculateLevelFromXp(newTotal);
        set({
          totalXp: newTotal,
          currentLevel: calc.level,
          xpInLevel: calc.xpInLevel,
          xpToNext: calc.xpToNext,
        });
        track('xp_earned', { amount, source });
        useQuestsStore.getState().incrementProgress('earn_xp', amount);
        if (calc.level > oldLevel) {
          track('level_up', { new_level: calc.level, total_xp: newTotal });
        }
      },

      recordDailyActivity: () => {
        const today = todayString();
        const last = get().lastActivityDate;

        if (last === today) {
          // Bugün zaten kayıtlı, streak değişmez
          return;
        }

        let newStreak = get().currentStreak;
        if (last === null) {
          newStreak = 1;
        } else if (isYesterday(last)) {
          newStreak += 1;
        } else {
          // Bir gün atladı → streak kırıldı
          track('streak_lost', { previous_streak: newStreak });
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, get().longestStreak);
        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: today,
        });
        track('streak_increased', { current_streak: newStreak });
      },

      loseHeart: () => {
        const current = get().hearts;
        if (current <= 0) return;
        set({ hearts: current - 1, lastHeartRefill: Date.now() });
        if (current - 1 === 0) {
          track('hearts_depleted');
        }
      },

      refillHearts: () => {
        const now = Date.now();
        const last = get().lastHeartRefill;
        const diffMinutes = Math.floor((now - last) / 60000);
        const refillIntervalMin = 30;
        const refillCount = Math.floor(diffMinutes / refillIntervalMin);
        if (refillCount === 0) return;
        const current = get().hearts;
        const max = get().maxHearts;
        const newHearts = Math.min(current + refillCount, max);
        set({ hearts: newHearts, lastHeartRefill: now });
      },

      addCoins: (amount, reason) => {
        set({ coins: get().coins + amount });
        track('coins_earned', { amount, reason });
      },

      spendCoins: (amount, reason) => {
        const current = get().coins;
        if (current < amount) return false;
        set({ coins: current - amount });
        track('coins_spent', { amount, reason });
        return true;
      },

      reset: () => set(initialState),
    }),
    {
      name: 'airspeak-gamification',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
