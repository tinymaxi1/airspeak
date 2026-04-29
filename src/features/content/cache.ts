/**
 * Content cache helpers — MMKV ile DB içeriğini lokal olarak persist eder.
 *
 * Mantık:
 * - Her DB query başarılı olduğunda sonucu MMKV'ye yazılır.
 * - Offline mod'da React Query cache + MMKV birleşir, son bilinen durum gösterilir.
 * - Realtime invalidation ile DB güncellendiğinde cache otomatik yenilenir.
 */
import { storage } from '@/lib/storage';

const CACHE_PREFIX = 'content_cache_';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

interface CachedEntry<T> {
  data: T;
  cachedAt: number;
}

export function setCache<T>(key: string, data: T): void {
  try {
    const entry: CachedEntry<T> = { data, cachedAt: Date.now() };
    storage.set(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    console.warn('[content cache] set failed', key, e);
  }
}

export function getCache<T>(key: string, maxAge: number = TTL_MS): T | null {
  try {
    const raw = storage.getString(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedEntry<T>;
    if (Date.now() - entry.cachedAt > maxAge) return null;
    return entry.data;
  } catch (e) {
    console.warn('[content cache] get failed', key, e);
    return null;
  }
}

export function deleteCache(key: string): void {
  try {
    storage.delete(CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Tüm content cache'ini temizle (kullanıcı çıkış yaptığında veya hesap silindiğinde).
 *
 * Not: storage backend `getAllKeys` desteklemediği için bilinen prefix'lerle
 * tek tek silmek gerekir. Şimdilik her key'i ayrı silmek yerine cache anahtarlarını
 * bir manifest'te tutmuyoruz — bu fonksiyon Sprint sonu rafine edilecek.
 */
export function clearAllContentCache(): void {
  // TODO: MMKV'da anahtar listesi tutmak için manifest pattern eklenmeli
  // Örn: storage.set('content_cache_manifest', JSON.stringify([...keys]))
  // ve clearAll burada manifest'i okuyup hepsini siler.
  // Şimdilik no-op — kullanıcı çıkışında full storage.clearAll çağırılır.
}
