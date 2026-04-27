/**
 * Storage wrapper — MMKV (native build) veya in-memory (Expo Go) fallback.
 *
 * Production'da MMKV kullanılır (sync, hızlı, kalıcı).
 * Expo Go'da MMKV çalışmadığı için in-memory fallback (test için yeterli, kalıcı değil).
 *
 * NOT: Expo Go'da app'i kapatıp açarsan progress kaybolur.
 * Gerçek persist için: `npx expo prebuild` + `npx expo run:ios` (dev build).
 */

interface StorageAPI {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  clearAll(): void;
}

let storageImpl: StorageAPI;

try {
  // MMKV native build'de (dev client / production)
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const mmkv = new MMKV({ id: 'airspeak-storage' });
  storageImpl = {
    getString: (k) => mmkv.getString(k),
    set: (k, v) => mmkv.set(k, v),
    delete: (k) => mmkv.delete(k),
    clearAll: () => mmkv.clearAll(),
  };
  console.log('[storage] Using MMKV (native)');
} catch (error) {
  // Expo Go fallback — in-memory (uygulama kapanınca data kaybolur)
  console.warn('[storage] MMKV unavailable (Expo Go?) — using in-memory fallback');
  const memoryStore = new Map<string, string>();
  storageImpl = {
    getString: (k) => memoryStore.get(k),
    set: (k, v) => {
      memoryStore.set(k, v);
    },
    delete: (k) => {
      memoryStore.delete(k);
    },
    clearAll: () => memoryStore.clear(),
  };
}

export const storage = storageImpl;

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function getItem<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function removeItem(key: string): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}
