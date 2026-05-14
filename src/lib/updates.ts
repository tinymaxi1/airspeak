/**
 * Updates lib — OTA güncelleme kontrolü ve uygulama (Faz 4)
 *
 * Expo'nun default sessiz arka plan indirme davranışını override eder:
 * - App açılışta UpdateGate checkForUpdate çağırır
 * - Available varsa kullanıcıya prompt göster
 * - Kullanıcı onaylayınca applyUpdate (fetch + reload)
 *
 * Mock-first: Updates modülü embedded launch'ta veya dev'de noop döner.
 */
import * as Updates from 'expo-updates';
import { track } from '@/lib/posthog';

export interface UpdateStatus {
  available: boolean;
  currentRuntimeVersion: string | null;
  newUpdateId: string | null;
  isEmbedded: boolean;
}

/**
 * Yeni OTA güncelleme var mı kontrol et.
 * - Dev / Expo Go: her zaman { available: false } (Updates dev'de no-op)
 * - Embedded launch ama update yok: { available: false }
 * - Update var: { available: true, newUpdateId }
 */
export async function checkForUpdate(): Promise<UpdateStatus> {
  const baseStatus: UpdateStatus = {
    available: false,
    currentRuntimeVersion: Updates.runtimeVersion ?? null,
    newUpdateId: null,
    isEmbedded: Updates.isEmbeddedLaunch ?? false,
  };

  // Dev veya Expo Go: Updates aktif değil
  if (!Updates.isEnabled || __DEV__) {
    return baseStatus;
  }

  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      track('ota_update_available', {
        update_id: (result.manifest as any)?.id ?? null,
        current_version: Updates.runtimeVersion ?? null,
      });
      return {
        ...baseStatus,
        available: true,
        newUpdateId: (result.manifest as any)?.id ?? null,
      };
    }
    return baseStatus;
  } catch (e) {
    if (__DEV__) console.warn('[updates] checkForUpdate failed:', e);
    return baseStatus;
  }
}

/**
 * Güncellemeyi indir + uygula (reloadAsync app'i restart eder).
 *
 * onProgress: 0-100 arası ilerleme — fetchUpdateAsync native progress
 * event vermez, tahmini değer veririz (start 5%, end 95%, reload 100%).
 *
 * 15 saniye timeout: indirme çok uzarsa caller throw alır.
 */
export async function applyUpdate(
  onProgress: (pct: number) => void,
  options: { timeoutMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 15_000;

  let currentPct = 5;
  onProgress(currentPct);

  // Tahmini progress — gerçek event yok, sahte tick'ler
  const tickInterval = setInterval(() => {
    currentPct = Math.min(currentPct + 5, 90);
    onProgress(currentPct);
  }, 500);

  try {
    const fetchPromise = Updates.fetchUpdateAsync();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('update_download_timeout')), timeoutMs),
    );
    await Promise.race([fetchPromise, timeoutPromise]);

    clearInterval(tickInterval);
    onProgress(95);
    track('ota_update_downloaded');

    // 200ms küçük gecikme — kullanıcı "%100" görsün
    await new Promise((r) => setTimeout(r, 200));
    onProgress(100);

    // App'i yeniden başlat (yeni bundle ile)
    await Updates.reloadAsync();
  } catch (e) {
    clearInterval(tickInterval);
    track('ota_update_failed', { error: (e as Error).message });
    throw e;
  }
}
