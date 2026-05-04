/**
 * AirSpeak — RevenueCat Webhook Edge Function
 * Sprint 13.A.6
 *
 * RevenueCat'ten gelen subscription event'lerini ground truth olarak
 * profiles.premium_until + subscription_status'e işler ve revenue_events'e
 * audit trail bırakır.
 *
 * Doğrulama:
 *   Authorization: Bearer <revenuecat.webhook_secret>
 *   Header app_config.revenuecat.webhook_secret ile karşılaştırılır.
 *
 * RevenueCat dashboard webhook config:
 *   URL:  https://<project>.supabase.co/functions/v1/revenuecat-webhook
 *   Auth: Bearer <secret>
 *
 * Event mapping (RC → revenue_events.event_type):
 *   INITIAL_PURCHASE     → subscription_start
 *   RENEWAL              → subscription_renew
 *   CANCELLATION         → subscription_cancel
 *   EXPIRATION           → subscription_expire
 *   TRIAL_STARTED        → trial_start
 *   TRIAL_CONVERTED      → subscription_start
 *   TRIAL_CANCELLED      → trial_end
 *   PRODUCT_CHANGE       → subscription_renew (tier değişikliği)
 *   NON_RENEWING_PURCHASE → purchase_lifetime
 *   REFUND, REFUND_PURCHASE → refund
 *   TRANSFER, BILLING_ISSUE → no insert (sadece log)
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  product_id?: string;
  period_type?: 'TRIAL' | 'NORMAL' | 'INTRO';
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  price?: number;
  price_in_purchased_currency?: number;
  currency?: string;
  store?: 'APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
  environment?: 'PRODUCTION' | 'SANDBOX';
  entitlement_id?: string | null;
  entitlement_ids?: string[] | null;
}

const EVENT_MAP: Record<string, string | null> = {
  INITIAL_PURCHASE: 'subscription_start',
  RENEWAL: 'subscription_renew',
  CANCELLATION: 'subscription_cancel',
  EXPIRATION: 'subscription_expire',
  TRIAL_STARTED: 'trial_start',
  TRIAL_CONVERTED: 'subscription_start',
  TRIAL_CANCELLED: 'trial_end',
  PRODUCT_CHANGE: 'subscription_renew',
  NON_RENEWING_PURCHASE: 'purchase_lifetime',
  REFUND: 'refund',
  REFUND_PURCHASE: 'refund',
  TRANSFER: null, // log only
  BILLING_ISSUE: null, // log only
};

const STORE_MAP: Record<string, string> = {
  APP_STORE: 'apple',
  PLAY_STORE: 'google',
  STRIPE: 'stripe',
  PROMOTIONAL: 'promo',
};

function tierFromProductId(productId?: string): string | null {
  if (!productId) return null;
  if (productId.includes('annual') || productId.includes('yearly')) return 'yearly';
  if (productId.includes('monthly')) return 'monthly';
  if (productId.includes('lifetime')) return 'lifetime';
  return null;
}

function isPremiumActive(eventType: string, expiresMs?: number): boolean {
  if (
    eventType === 'CANCELLATION' ||
    eventType === 'EXPIRATION' ||
    eventType === 'REFUND' ||
    eventType === 'REFUND_PURCHASE' ||
    eventType === 'TRIAL_CANCELLED'
  ) {
    return false;
  }
  if (expiresMs && expiresMs > Date.now()) return true;
  if (eventType === 'NON_RENEWING_PURCHASE') return true; // lifetime
  return false;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Authorization doğrulama (revenuecat.webhook_secret)
  const auth = req.headers.get('authorization') ?? '';
  const expected = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'revenuecat.webhook_secret')
    .single();
  const secret = (expected.data?.value as string | undefined) ?? '';

  if (!secret) {
    // Mock-first: secret config'te boşsa webhook'u disable kabul et
    return new Response(JSON.stringify({ ok: false, reason: 'webhook_disabled' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const expectedHeader = `Bearer ${secret}`;
  if (auth !== expectedHeader) {
    return new Response(JSON.stringify({ ok: false, reason: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Body parse
  const body = await req.json().catch(() => null);
  const event = body?.event as RevenueCatEvent | undefined;
  if (!event || !event.type || !event.app_user_id) {
    return new Response(JSON.stringify({ ok: false, reason: 'invalid_payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Profil lookup — app_user_id Supabase user.id'ye eşit olmalı
  const userId = event.app_user_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, premium_until')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    // Lookup fail — yine de log; daha sonra ele alınır
    return new Response(
      JSON.stringify({ ok: false, reason: 'user_not_found', user_id: userId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 4. premium_until + subscription_status hesapla
  const active = isPremiumActive(event.type, event.expiration_at_ms);
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  await supabase
    .from('profiles')
    .update({
      premium_until: active ? expiresAt : null,
      subscription_status: active
        ? event.period_type === 'TRIAL'
          ? 'trial'
          : 'active'
        : event.type === 'CANCELLATION'
          ? 'cancelled'
          : 'free',
    })
    .eq('id', userId);

  // 5. revenue_events insert (event whitelist'inde varsa)
  const mappedType = EVENT_MAP[event.type] ?? null;
  if (mappedType) {
    await supabase.from('revenue_events').insert({
      user_id: userId,
      event_type: mappedType,
      tier: tierFromProductId(event.product_id),
      amount_try: event.price_in_purchased_currency ?? event.price ?? null,
      source: STORE_MAP[event.store ?? ''] ?? 'apple',
      metadata: {
        rc_event_type: event.type,
        rc_environment: event.environment,
        product_id: event.product_id,
        currency: event.currency,
        period_type: event.period_type,
        expiration_at_ms: event.expiration_at_ms,
        entitlement_ids: event.entitlement_ids,
      },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, mapped: mappedType, premium_active: active }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
