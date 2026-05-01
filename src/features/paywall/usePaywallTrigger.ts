/**
 * usePaywallTrigger — paywall'u trigger ID ile aç + cooldown + analytics.
 *
 * Kullanım:
 *   const { showPaywall, canShow, PaywallSlot } = usePaywallTrigger();
 *   showPaywall('icao_oral_first_task_done');
 *   <PaywallSlot />  // App'e ekle (Sheet'i render eder)
 */
import { useCallback, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { track } from '@/lib/posthog';
import {
  TRIGGERS,
  canShowTrigger,
  markTriggerShown,
  type PaywallTriggerId,
  type TriggerMeta,
} from './triggers';

export function usePaywallTrigger() {
  const isPremium = useAuthStore((s) => s.isPremium);
  const [activeTrigger, setActiveTrigger] = useState<TriggerMeta | null>(null);

  const showPaywall = useCallback(
    (triggerId: PaywallTriggerId): boolean => {
      if (!canShowTrigger(triggerId, isPremium)) return false;
      const meta = TRIGGERS[triggerId];
      if (!meta) return false;
      markTriggerShown(triggerId);
      track('paywall_shown', { trigger_id: triggerId, intensity: meta.intensity });
      setActiveTrigger(meta);
      return true;
    },
    [isPremium],
  );

  const canShow = useCallback(
    (triggerId: PaywallTriggerId): boolean => canShowTrigger(triggerId, isPremium),
    [isPremium],
  );

  const closePaywall = useCallback(() => {
    if (activeTrigger) {
      track('paywall_dismissed', { trigger_id: activeTrigger.id });
    }
    setActiveTrigger(null);
  }, [activeTrigger]);

  return {
    showPaywall,
    canShow,
    closePaywall,
    activeTrigger,
    isPremium,
  };
}
