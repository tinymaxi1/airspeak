/**
 * Limited offers — DB authoritative.
 *
 * - useActiveOffers(): RPC poll (5dk cache) + audience filter server-side
 * - useTopOffer(): en yüksek priority aktif offer
 * - claimOffer(code): revenue_events log
 * - getEffectivePricing(code): tier × offer → effective fiyat
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface OfferRow {
  id: string;
  code: string;
  title_tr: string;
  title_en: string | null;
  body_tr: string;
  body_en: string | null;
  monthly_price_try: number | null;
  yearly_price_try: number | null;
  lifetime_price_try: number | null;
  discount_percent: number | null;
  starts_at: string;
  ends_at: string;
  banner_color: string | null;
  audience: string;
  priority: number;
}

export interface EffectivePricing {
  monthly: number;
  yearly: number;
  lifetime: number;
  monthly_default: number;
  yearly_default: number;
  lifetime_default: number;
}

const TTL_MS = 5 * 60 * 1000;

let offersCache: { rows: OfferRow[]; loadedAt: number; userId: string | null } | null = null;
const offersSubs = new Set<(rows: OfferRow[]) => void>();
let inFlight: Promise<OfferRow[]> | null = null;

async function fetchActiveOffers(): Promise<OfferRow[]> {
  const { data, error } = await (supabase as any).rpc('get_active_offers');
  if (error || !data) return [];
  return (data as OfferRow[]) ?? [];
}

async function ensureOffers(userId: string | null): Promise<OfferRow[]> {
  if (
    offersCache &&
    offersCache.userId === userId &&
    Date.now() - offersCache.loadedAt < TTL_MS
  ) {
    return offersCache.rows;
  }
  if (inFlight) return inFlight;
  inFlight = fetchActiveOffers().then((rows) => {
    inFlight = null;
    offersCache = { rows, loadedAt: Date.now(), userId };
    offersSubs.forEach((cb) => cb(rows));
    return rows;
  });
  return inFlight;
}

export function useActiveOffers(): { rows: OfferRow[]; loading: boolean } {
  const userId = useAuthStore((s) => s.user?.id);
  const [rows, setRows] = useState<OfferRow[]>(
    offersCache && offersCache.userId === (userId ?? null) ? offersCache.rows : [],
  );
  const [loading, setLoading] = useState(!offersCache || offersCache.userId !== (userId ?? null));

  useEffect(() => {
    let mounted = true;
    const cb = (next: OfferRow[]) => {
      if (mounted) {
        setRows(next);
        setLoading(false);
      }
    };
    offersSubs.add(cb);

    void ensureOffers(userId ?? null).then((r) => {
      if (!mounted) return;
      setRows(r);
      setLoading(false);
    });

    return () => {
      mounted = false;
      offersSubs.delete(cb);
    };
  }, [userId]);

  return { rows, loading };
}

export function useTopOffer(): OfferRow | null {
  const { rows } = useActiveOffers();
  return rows.length > 0 ? rows[0]! : null;
}

// Cache invalidation — claim sonrası veya manuel refresh
export function invalidateOffersCache(): void {
  offersCache = null;
}

// ─── RPC wrappers ─────────────────────────────────────────────────────────
export async function claimOffer(code: string): Promise<{
  ok: boolean;
  already_claimed?: boolean;
  offer_id?: string;
  error?: string;
}> {
  const { data, error } = await (supabase as any).rpc('claim_offer', { p_code: code });
  if (error) return { ok: false, error: error.message };
  return data;
}

const pricingCache = new Map<string, { value: EffectivePricing; loadedAt: number }>();

export async function getEffectivePricing(
  offerCode?: string | null,
): Promise<EffectivePricing | null> {
  const key = offerCode ?? '__default__';
  const entry = pricingCache.get(key);
  if (entry && Date.now() - entry.loadedAt < TTL_MS) return entry.value;

  const { data, error } = await (supabase as any).rpc('get_effective_pricing', {
    p_offer_code: offerCode ?? null,
  });
  if (error || !data) return null;
  const value: EffectivePricing = {
    monthly: Number(data.monthly ?? 0),
    yearly: Number(data.yearly ?? 0),
    lifetime: Number(data.lifetime ?? 0),
    monthly_default: Number(data.monthly_default ?? 0),
    yearly_default: Number(data.yearly_default ?? 0),
    lifetime_default: Number(data.lifetime_default ?? 0),
  };
  pricingCache.set(key, { value, loadedAt: Date.now() });
  return value;
}

export function useEffectivePricing(offerCode?: string | null): {
  pricing: EffectivePricing | null;
  loading: boolean;
} {
  const [pricing, setPricing] = useState<EffectivePricing | null>(
    pricingCache.get(offerCode ?? '__default__')?.value ?? null,
  );
  const [loading, setLoading] = useState(!pricingCache.get(offerCode ?? '__default__'));

  useEffect(() => {
    let mounted = true;
    void getEffectivePricing(offerCode).then((p) => {
      if (!mounted) return;
      setPricing(p);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [offerCode]);

  return { pricing, loading };
}
