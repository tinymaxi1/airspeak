import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'airspeak-storage',
});

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
