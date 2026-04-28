import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { storage } from '@/lib/storage';
import type { Profile } from '@/types/profile';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  hasCompletedOnboarding: boolean;
  hasSeenTour: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setHasSeenTour: (seen: boolean) => void;
  reset: () => void;
}

const zustandStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      profile: null,
      hasCompletedOnboarding: false,
      hasSeenTour: false,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      setHasSeenTour: (seen) => set({ hasSeenTour: seen }),
      reset: () =>
        set({ session: null, user: null, profile: null, hasCompletedOnboarding: false, hasSeenTour: false }),
    }),
    {
      name: 'airspeak-auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasSeenTour: state.hasSeenTour,
      }),
    },
  ),
);
