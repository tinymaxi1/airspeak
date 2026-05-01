/**
 * Paywall global state — trigger ID + visible flag.
 *
 * App root'unda bir kez <PaywallTriggerSheet /> render edilir,
 * her yerden usePaywallStore.getState().show('trigger_id') ile açılır.
 */
import { create } from 'zustand';
import { TRIGGERS, canShowTrigger, markTriggerShown, type PaywallTriggerId, type TriggerMeta } from '@/features/paywall/triggers';
import { useAuthStore } from './authStore';
import { track } from '@/lib/posthog';

interface PaywallStore {
  activeTrigger: TriggerMeta | null;
  show: (triggerId: PaywallTriggerId) => boolean;
  close: () => void;
}

export const usePaywallStore = create<PaywallStore>((set, get) => ({
  activeTrigger: null,
  show: (triggerId) => {
    const isPremium = useAuthStore.getState().isPremium;
    if (!canShowTrigger(triggerId, isPremium)) return false;
    const meta = TRIGGERS[triggerId];
    if (!meta) return false;
    markTriggerShown(triggerId);
    track('paywall_shown', { trigger_id: triggerId, intensity: meta.intensity });
    set({ activeTrigger: meta });
    return true;
  },
  close: () => {
    const t = get().activeTrigger;
    if (t) track('paywall_dismissed', { trigger_id: t.id });
    set({ activeTrigger: null });
  },
}));

/** Kısa yardımcı — store'a erişmeden global tetikle */
export function showPaywall(triggerId: PaywallTriggerId): boolean {
  return usePaywallStore.getState().show(triggerId);
}
