/**
 * Theme store — kullanıcı tema tercihi (light/dark/system).
 * MMKV persist + DB sync (user_settings.theme).
 *
 * Mock-first: DB sync başarısız olursa local persist yine çalışır.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemePreference;
  hydratedFromDb: boolean;
  setTheme: (theme: ThemePreference) => void;
  hydrateFromDb: (userId: string) => Promise<void>;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      hydratedFromDb: false,

      setTheme: (theme) => {
        set({ theme });
        // Best-effort DB sync; başarısız olursa local persist yeter
        const session = supabase.auth.getSession();
        void session.then(({ data }) => {
          const uid = data.session?.user?.id;
          if (!uid) return;
          void supabase
            .from('user_settings')
            .update({ theme })
            .eq('user_id', uid);
        });
      },

      hydrateFromDb: async (userId) => {
        if (get().hydratedFromDb) return;
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', userId)
          .maybeSingle();
        if (!error && data?.theme) {
          set({ theme: data.theme as ThemePreference, hydratedFromDb: true });
        } else {
          set({ hydratedFromDb: true });
        }
      },
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);
