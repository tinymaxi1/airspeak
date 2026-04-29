/**
 * Bookmark store — vocab terimi + senaryo + clearance kaydet.
 *
 * Kullanıcı ⭐ ikonuna basınca buraya eklenir, /bookmarks sayfasında listelenir.
 * Tek bir typed Set yerine kategori bazında Set'ler tutuyoruz ki
 * "kayıtlı vocab", "kayıtlı senaryo" gibi ayrı listeler kolayca render edilebilsin.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type BookmarkKind = 'vocab' | 'scenario' | 'clearance' | 'airline';

interface BookmarkEntry {
  id: string;
  kind: BookmarkKind;
  /** ISO timestamp */
  addedAt: string;
}

interface BookmarkState {
  entries: BookmarkEntry[];

  toggle: (kind: BookmarkKind, id: string) => boolean; // returns new isBookmarked state
  isBookmarked: (kind: BookmarkKind, id: string) => boolean;
  getByKind: (kind: BookmarkKind) => BookmarkEntry[];
  count: (kind?: BookmarkKind) => number;
  clear: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      entries: [],

      toggle: (kind, id) => {
        const list = get().entries;
        const existing = list.find((e) => e.kind === kind && e.id === id);
        if (existing) {
          set({ entries: list.filter((e) => !(e.kind === kind && e.id === id)) });
          return false;
        }
        set({
          entries: [...list, { id, kind, addedAt: new Date().toISOString() }],
        });
        return true;
      },

      isBookmarked: (kind, id) =>
        get().entries.some((e) => e.kind === kind && e.id === id),

      getByKind: (kind) =>
        get()
          .entries.filter((e) => e.kind === kind)
          .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),

      count: (kind) =>
        kind ? get().entries.filter((e) => e.kind === kind).length : get().entries.length,

      clear: () => set({ entries: [] }),
    }),
    {
      name: 'airspeak-bookmarks',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
