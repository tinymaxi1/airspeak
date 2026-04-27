/**
 * Daily quest store — günde 3 görev üretir, kullanıcı ilerlemesini takip eder.
 *
 * Her gün ilk açılışta yeni görevler üretilir.
 * Tamamlanan görev claim edilince XP + coin verir.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type QuestType =
  | 'complete_lessons'
  | 'earn_xp'
  | 'practice_pronunciation'
  | 'srs_review'
  | 'streak_check';

export interface Quest {
  id: string;
  type: QuestType;
  titleTr: string;
  emoji: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  coinReward: number;
  claimed: boolean;
}

interface QuestsState {
  date: string | null; // YYYY-MM-DD
  quests: Quest[];

  generateForToday: () => void;
  incrementProgress: (type: QuestType, amount?: number) => void;
  claim: (id: string) => Quest | null;
  reset: () => void;
}

const QUEST_TEMPLATES: Omit<Quest, 'currentValue' | 'claimed' | 'id'>[] = [
  {
    type: 'complete_lessons',
    titleTr: '3 ders tamamla',
    emoji: '📚',
    targetValue: 3,
    xpReward: 30,
    coinReward: 5,
  },
  {
    type: 'complete_lessons',
    titleTr: '5 ders tamamla',
    emoji: '📚',
    targetValue: 5,
    xpReward: 50,
    coinReward: 10,
  },
  {
    type: 'earn_xp',
    titleTr: '100 XP topla',
    emoji: '⭐',
    targetValue: 100,
    xpReward: 30,
    coinReward: 5,
  },
  {
    type: 'earn_xp',
    titleTr: '200 XP topla',
    emoji: '⭐',
    targetValue: 200,
    xpReward: 50,
    coinReward: 10,
  },
  {
    type: 'practice_pronunciation',
    titleTr: 'Telaffuz drill 1 cümle',
    emoji: '🎙️',
    targetValue: 1,
    xpReward: 30,
    coinReward: 5,
  },
  {
    type: 'practice_pronunciation',
    titleTr: 'Telaffuz drill 3 cümle',
    emoji: '🎙️',
    targetValue: 3,
    xpReward: 60,
    coinReward: 12,
  },
  {
    type: 'srs_review',
    titleTr: 'SRS ile 5 terim tekrar et',
    emoji: '🧠',
    targetValue: 5,
    xpReward: 30,
    coinReward: 5,
  },
  {
    type: 'srs_review',
    titleTr: 'SRS ile 10 terim tekrar et',
    emoji: '🧠',
    targetValue: 10,
    xpReward: 60,
    coinReward: 12,
  },
  {
    type: 'streak_check',
    titleTr: 'Bugün giriş yap (streak)',
    emoji: '🔥',
    targetValue: 1,
    xpReward: 20,
    coinReward: 5,
  },
];

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickThree(): Quest[] {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  // En az 1 farklı tip olacak şekilde seç
  const selected: typeof QUEST_TEMPLATES = [];
  const usedTypes = new Set<QuestType>();
  for (const q of shuffled) {
    if (selected.length >= 3) break;
    if (!usedTypes.has(q.type) || selected.length >= 2) {
      selected.push(q);
      usedTypes.add(q.type);
    }
  }
  return selected.map<Quest>((q, idx) => ({
    ...q,
    id: `quest_${todayString()}_${idx}`,
    currentValue: 0,
    claimed: false,
  }));
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useQuestsStore = create<QuestsState>()(
  persist(
    (set, get) => ({
      date: null,
      quests: [],

      generateForToday: () => {
        const today = todayString();
        if (get().date === today && get().quests.length === 3) return;
        set({ date: today, quests: pickThree() });
      },

      incrementProgress: (type, amount = 1) => {
        const today = todayString();
        if (get().date !== today) get().generateForToday();
        const updated = get().quests.map((q) => {
          if (q.type !== type || q.claimed) return q;
          return {
            ...q,
            currentValue: Math.min(q.targetValue, q.currentValue + amount),
          };
        });
        set({ quests: updated });
      },

      claim: (id) => {
        const quest = get().quests.find((q) => q.id === id);
        if (!quest || quest.claimed) return null;
        if (quest.currentValue < quest.targetValue) return null;
        const updated = get().quests.map((q) =>
          q.id === id ? { ...q, claimed: true } : q,
        );
        set({ quests: updated });
        return quest;
      },

      reset: () => set({ date: null, quests: [] }),
    }),
    {
      name: 'airspeak-quests',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
