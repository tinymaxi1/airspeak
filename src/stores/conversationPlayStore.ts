/**
 * conversationPlayStore — play.tsx → result.tsx state passing.
 *
 * Play ekranı her turn sonunda turn skor ve must_include eşleşmesini
 * buraya yazar. Result ekranı okuyup skor gösterir.
 */
import { create } from 'zustand';

export interface TurnResult {
  turnId: string;
  transcript: string;
  matchScore: number; // 0-100 keyPhrases skor (mevcut matchTranscript)
  mustIncludeHit: string[];
  mustIncludeMiss: string[];
  expectedResponse: string;
}

interface State {
  scenarioSlug: string | null;
  scenarioTitle: string | null;
  turnResults: TurnResult[];
  startedAt: number | null;
  finishedAt: number | null;

  start: (slug: string, title: string) => void;
  recordTurn: (r: TurnResult) => void;
  finish: () => void;
  reset: () => void;
}

export const useConversationPlayStore = create<State>((set) => ({
  scenarioSlug: null,
  scenarioTitle: null,
  turnResults: [],
  startedAt: null,
  finishedAt: null,

  start: (slug, title) =>
    set({ scenarioSlug: slug, scenarioTitle: title, turnResults: [], startedAt: Date.now(), finishedAt: null }),
  recordTurn: (r) => set((s) => ({ turnResults: [...s.turnResults, r] })),
  finish: () => set({ finishedAt: Date.now() }),
  reset: () => set({ scenarioSlug: null, scenarioTitle: null, turnResults: [], startedAt: null, finishedAt: null }),
}));
