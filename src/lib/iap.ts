/**
 * RevenueCat IAP service — Sprint 13.A.2
 *
 * Mock-first: app_config'te API key boşsa tüm fonksiyonlar no-op döner.
 * Admin /admin/iap'tan key girilince otomatik aktif olur.
 *
 * Akış:
 * - Module load: initIap() — config çeker + Purchases.configure
 * - Login: linkIapUser(userId) — RevenueCat'e Supabase user.id'yi App User ID olarak bağlar
 * - Logout: logOutIap()
 * - Paywall: purchaseProduct(productId) → entitlement aktive olunca DB sync
 * - App focus: syncPremiumFromIap() — getCustomerInfo + DB premium_until update
 */
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import * as Sentry from '@sentry/react-native';

let initialized = false;
let configured = false; // gerçek SDK init yapıldı mı (key vardı mı)
let entitlementId = 'pro';
let productIds: string[] = [];

export function isIapConfigured(): boolean {
  return configured;
}

/**
 * Module-load init — Supabase'den RevenueCat key + entitlement çeker.
 * Key boşsa SDK init etmez (mock-first).
 */
export async function initIap(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { data: rows } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', [
        'revenuecat.ios_api_key',
        'revenuecat.android_api_key',
        'iap.entitlement_id',
        'iap.product_ids',
      ]);

    const cfg = Object.fromEntries((rows ?? []).map((r: any) => [r.key, r.value]));
    const key =
      Platform.OS === 'ios'
        ? (cfg['revenuecat.ios_api_key'] as string | undefined)
        : (cfg['revenuecat.android_api_key'] as string | undefined);

    entitlementId = (cfg['iap.entitlement_id'] as string | undefined) ?? 'pro';
    productIds = (cfg['iap.product_ids'] as string[] | undefined) ?? [];

    if (!key || typeof key !== 'string' || key.length === 0) {
      // Mock-first: key yoksa SDK init etme
      configured = false;
      return;
    }

    Purchases.configure({ apiKey: key });
    configured = true;
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap' } });
    configured = false;
  }
}

/**
 * Login sonrası RevenueCat'e Supabase user.id'yi App User ID olarak bağla.
 * Webhook bu ID ile gelir → DB lookup için profiles.revenuecat_app_user_id'ye yazılır.
 */
export async function linkIapUser(userId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(userId);
    // DB'ye yaz (webhook lookup'ı için)
    await supabase
      .from('profiles')
      .update({ revenuecat_app_user_id: userId } as never)
      .eq('id', userId);
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'linkUser' } });
  }
}

export async function logOutIap(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'logOut' } });
  }
}

/**
 * Mevcut offerings'i çeker (App Store'dan).
 * Mock mode'da null döner → paywall hardcoded fiyat gösterir.
 */
export async function getOfferings(): Promise<{
  packages: PurchasesPackage[];
} | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    return { packages: current.availablePackages };
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'offerings' } });
    return null;
  }
}

/**
 * Bir paketi satın al. Entitlement aktive olursa DB sync edilir.
 * Mock mode'da { mock: true } döner — paywall kullanıcıya "yakında aktif" gösterir.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  ok: boolean;
  mock?: boolean;
  cancelled?: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
}> {
  if (!configured) return { ok: false, mock: true };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    await syncPremiumFromCustomerInfo(customerInfo);
    return { ok: true, customerInfo };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, cancelled: true };
    Sentry.captureException(e, { tags: { module: 'iap', op: 'purchase' } });
    return { ok: false, error: e?.message ?? 'unknown' };
  }
}

/**
 * Geçmiş satın almaları geri yükle (cihaz değişikliği vb.).
 */
export async function restorePurchases(): Promise<{
  ok: boolean;
  mock?: boolean;
  hasEntitlement?: boolean;
  error?: string;
}> {
  if (!configured) return { ok: false, mock: true };
  try {
    const customerInfo = await Purchases.restorePurchases();
    await syncPremiumFromCustomerInfo(customerInfo);
    const hasEntitlement = !!customerInfo.entitlements.active[entitlementId];
    return { ok: true, hasEntitlement };
  } catch (e: any) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'restore' } });
    return { ok: false, error: e?.message ?? 'unknown' };
  }
}

/**
 * App foreground / login sonrası — getCustomerInfo + DB sync.
 * Webhook ground truth ama bu hızlı UI sync için.
 */
export async function syncPremiumFromIap(): Promise<void> {
  if (!configured) return;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    await syncPremiumFromCustomerInfo(customerInfo);
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'sync' } });
  }
}

async function syncPremiumFromCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
  const entitlement = customerInfo.entitlements.active[entitlementId];
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  const isActive = !!entitlement;
  const expiresAt = entitlement?.expirationDate ?? null;

  // Local store hızlı update
  useAuthStore.getState().setPremium(isActive);

  // DB sync — premium_until ground truth
  await supabase
    .from('profiles')
    .update({
      premium_until: isActive ? expiresAt : null,
      subscription_status: isActive ? 'active' : 'free',
    } as never)
    .eq('id', userId);
}

export function getProductIds(): string[] {
  return productIds;
}

export function getEntitlementId(): string {
  return entitlementId;
}
