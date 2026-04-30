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

  // Mağaza envanter
  streakFreezes: number;
  hints: number;
  /** XP çarpanı (örn 2.0 = 2× boost). Default 1.0 */
  xpMultiplier: number;
  /** xpMultiplier'ın bittiği epoch ms. 0 = aktif değil */
  xpMultiplierExpiresAt: number;

  // Aksiyonlar
  addXp: (amount: number, source: string) => void;
  recordDailyActivity: () => void;
  loseHeart: () => void;
  refillHearts: () => void;
  addCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, reason: string) => boolean;
  /** Tek can ekle (max kapasiteye kadar). Mağaza ürünleri için. */
  addHeart: (count?: number) => void;
  /** Tüm canları full doldur. */
  fillHearts: () => void;
  /** Streak freeze envantere ekle. */
  addStreakFreeze: (count?: number) => void;
  /** Hint ekle. */
  addHint: (count?: number) => void;
  /** XP çarpanı aktive et (örn boost x2 1 saat). */
  activateXpMultiplier: (multiplier: number, durationMinutes: number) => void;
  reset: () => void;
}

/**
 * Level eşiği: kümülatif XP = 100 * N^1.5
 * L1: 100 / L5: 1118 / L10: 3162 / L25: 12500 / L50: 35355
 */
function xpToReachLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function calculateLevelFromXp(totalXp: number): {
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
  streakFreezes: 0,
  hints: 0,
  xpMultiplier: 1.0,
  xpMultiplierExpiresAt: 0,
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
        // XP boost aktif mi kontrol et
        const now = Date.now();
        const multiplier = get().xpMultiplierExpiresAt > now ? get().xpMultiplier : 1.0;
        const finalAmount = Math.round(amount * multiplier);

        const newTotal = get().totalXp + finalAmount;
        const oldLevel = get().currentLevel;
        const calc = calculateLevelFromXp(newTotal);
        set({
          totalXp: newTotal,
          currentLevel: calc.level,
          xpInLevel: calc.xpInLevel,
          xpToNext: calc.xpToNext,
        });
        // Süresi dolan multiplier'ı 1.0'a düşür
        if (multiplier > 1.0 && get().xpMultiplierExpiresAt <= now) {
          set({ xpMultiplier: 1.0, xpMultiplierExpiresAt: 0 });
        }
        track('xp_earned', { amount: finalAmount, base: amount, multiplier, source });
        useQuestsStore.getState().incrementProgress('earn_xp', finalAmount);
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

      addHeart: (count = 1) => {
        const current = get().hearts;
        const max = get().maxHearts;
        const next = Math.min(current + count, max);
        if (next === current) return; // Zaten dolu
        set({ hearts: next, lastHeartRefill: Date.now() });
        track('heart_added', { count, source: 'shop' });
      },

      fillHearts: () => {
        const max = get().maxHearts;
        if (get().hearts === max) return;
        set({ hearts: max, lastHeartRefill: Date.now() });
        track('hearts_filled', { source: 'shop' });
      },

      addStreakFreeze: (count = 1) => {
        set({ streakFreezes: get().streakFreezes + count });
        track('streak_freeze_added', { count });
      },

      addHint: (count = 3) => {
        set({ hints: get().hints + count });
        track('hint_added', { count });
      },

      activateXpMultiplier: (multiplier, durationMinutes) => {
        const expiresAt = Date.now() + durationMinutes * 60_000;
        set({ xpMultiplier: multiplier, xpMultiplierExpiresAt: expiresAt });
        track('xp_multiplier_activated', { multiplier, durationMinutes });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'airspeak-gamification',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
