/**
 * In-app notification banner state.
 * Sprint 5.C
 */
import { create } from 'zustand';

export interface BannerPayload {
  id: string;
  title: string;
  body: string;
  route?: string;
  emoji?: string;
}

interface BannerState {
  current: BannerPayload | null;
  show: (b: BannerPayload) => void;
  dismiss: () => void;
}

export const useBannerStore = create<BannerState>((set) => ({
  current: null,
  show: (b) => set({ current: b }),
  dismiss: () => set({ current: null }),
}));
