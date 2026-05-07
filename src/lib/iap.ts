/**
 * RevenueCat IAP service — Sprint 13.A + 13.A.9
 *
 * Mock-first: API key boşsa tüm fonksiyonlar no-op döner.
 * Key kaynak öncelik: ENV → app_config DB → boş (mock).
 *
 * Akış:
 * - Module load: initIap() — supabase'den entitlement/product_ids çeker, key env'den
 * - Login: initRevenueCat(userId) — Purchases.configure + appUserID
 *   (önceden initIap + linkIapUser ayrı idi; tek API'ye birleştirildi)
 * - Logout: logOutIap()
 * - Paywall: purchasePackage(pkg) veya purchaseStoreProduct(product) → DB sync
 * - App focus: syncPremiumFromIap() — getCustomerInfo + DB premium_until update
 */
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
  type PurchasesStoreProduct,
} from 'react-native-purchases';
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
 * Platform'a göre RevenueCat API key seçer.
 * Önce ENV (Sprint 13.A.9 — kullanıcı env-driven istedi),
 * sonra Supabase app_config (admin'den runtime override).
 */
function pickApiKey(cfg: Record<string, unknown>): string | null {
  if (Platform.OS === 'ios') {
    const env = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    if (env && env.length > 0) return env;
    const dbKey = cfg['revenuecat.ios_api_key'] as string | undefined;
    return dbKey && dbKey.length > 0 ? dbKey : null;
  }
  const env = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (env && env.length > 0) return env;
  const dbKey = cfg['revenuecat.android_api_key'] as string | undefined;
  return dbKey && dbKey.length > 0 ? dbKey : null;
}

/**
 * Module-load init — entitlement/product_ids'i Supabase'den çeker.
 * Configure işlemi initRevenueCat(userId) ile login sonrası yapılır.
 */
export async function initIap(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { data: rows } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['iap.entitlement_id', 'iap.product_ids']);

    const cfg = Object.fromEntries((rows ?? []).map((r: any) => [r.key, r.value]));
    entitlementId = (cfg['iap.entitlement_id'] as string | undefined) ?? 'pro';
    productIds = (cfg['iap.product_ids'] as string[] | undefined) ?? [];
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'initConfig' } });
  }
}

/**
 * Sprint 13.A.9 — Login sonrası tek seferlik RevenueCat init.
 * Purchases.configure + appUserID birlikte; mock-first guard.
 *
 * Önceden: initIap() (configure'lu) + linkIapUser() (logIn'li) ayrıydı.
 * Yeni: tek fonksiyon, Platform.OS'a göre env key alır.
 */
export async function initRevenueCat(userId: string): Promise<void> {
  if (configured) {
    // Zaten configure edilmiş — sadece user değiştir
    try {
      await Purchases.logIn(userId);
      await persistAppUserId(userId);
    } catch (e) {
      Sentry.captureException(e, { tags: { module: 'iap', op: 'logIn' } });
    }
    return;
  }

  // entitlement/product_ids hâlâ DB'den (admin runtime override)
  let cfg: Record<string, unknown> = {};
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
    cfg = Object.fromEntries((rows ?? []).map((r: any) => [r.key, r.value]));
    entitlementId = (cfg['iap.entitlement_id'] as string | undefined) ?? 'pro';
    productIds = (cfg['iap.product_ids'] as string[] | undefined) ?? [];
  } catch {
    // sessizce mock'a düş
  }

  const key = pickApiKey(cfg);
  if (!key) {
    if (__DEV__) console.log('[iap] RevenueCat key yok — mock mode');
    configured = false;
    return;
  }

  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey: key, appUserID: userId });
    configured = true;
    await persistAppUserId(userId);
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'configure' } });
    configured = false;
  }
}

async function persistAppUserId(userId: string): Promise<void> {
  // Webhook lookup için DB'ye yaz
  await supabase
    .from('profiles')
    .update({ revenuecat_app_user_id: userId } as never)
    .eq('id', userId);
}

/**
 * @deprecated initRevenueCat(userId) kullan — Sprint 13.A.9'dan sonra.
 * Geriye dönük uyumluluk için tutuluyor; logIn + persist sarmalı.
 */
export async function linkIapUser(userId: string): Promise<void> {
  await initRevenueCat(userId);
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
 * Sprint 13.A.9 — Direct product satın alma (offering olmasa da).
 * Bir StoreProduct nesnesini purchase eder.
 */
export async function purchaseStoreProduct(product: PurchasesStoreProduct): Promise<{
  ok: boolean;
  mock?: boolean;
  cancelled?: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
}> {
  if (!configured) return { ok: false, mock: true };
  try {
    const { customerInfo } = await Purchases.purchaseStoreProduct(product);
    await syncPremiumFromCustomerInfo(customerInfo);
    return { ok: true, customerInfo };
  } catch (e: any) {
    if (e?.userCancelled) return { ok: false, cancelled: true };
    Sentry.captureException(e, { tags: { module: 'iap', op: 'purchaseStoreProduct' } });
    return { ok: false, error: e?.message ?? 'unknown' };
  }
}

/**
 * Product ID listesinden StoreProduct'ları fetch et (offering setup'sız).
 */
export async function getStoreProducts(ids?: string[]): Promise<PurchasesStoreProduct[]> {
  if (!configured) return [];
  try {
    return await Purchases.getProducts(ids ?? productIds);
  } catch (e) {
    Sentry.captureException(e, { tags: { module: 'iap', op: 'getProducts' } });
    return [];
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
