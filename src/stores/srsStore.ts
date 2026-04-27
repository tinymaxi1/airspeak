/**
 * SRS state — kullanıcının tüm flashcard durumları.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import {
  initialCardState,
  reviewCard,
  getDueCards as filterDueCards,
  type SrsCardState,
} from '@/features/srs/algorithm';

interface SrsState {
  cards: Record<string, SrsCardState>;

  ensureCard: (termId: string) => SrsCardState;
  reviewTerm: (termId: string, quality: number) => void;
  getDueTerms: () => SrsCardState[];
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useSrsStore = create<SrsState>()(
  persist(
    (set, get) => ({
      cards: {},

      ensureCard: (termId) => {
        const existing = get().cards[termId];
        if (existing) return existing;
        const fresh = initialCardState(termId);
        set({ cards: { ...get().cards, [termId]: fresh } });
        return fresh;
      },

      reviewTerm: (termId, quality) => {
        const cards = get().cards;
        const card = cards[termId] ?? initialCardState(termId);
        const updated = reviewCard(card, quality);
        set({ cards: { ...cards, [termId]: updated } });
      },

      getDueTerms: () => {
        const cards = Object.values(get().cards);
        return filterDueCards(cards);
      },

      reset: () => set({ cards: {} }),
    }),
    {
      name: 'airspeak-srs',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
