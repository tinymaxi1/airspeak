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
  /** Premium üyelik. Trial/abonelik aktifse true. Default false. */
  isPremium: boolean;
  /**
   * Sprint 14.C — server hydration in progress.
   * useUserDataSync userId aldığında TRUE, fetch'ler bitince FALSE.
   * Router buna bakar: hydrating → splash göster, yoksa route'la.
   * Race condition fix: logout → login → onboarding'e gönderiyor bug'ı.
   * Not persisted — her app açılışta false başlar, login hook tetikler.
   */
  hydrating: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setHasSeenTour: (seen: boolean) => void;
  setPremium: (premium: boolean) => void;
  setHydrating: (hydrating: boolean) => void;
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
      isPremium: false,
      hydrating: false,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setProfile: (profile) => set({ profile }),
      setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),
      setHasSeenTour: (seen) => set({ hasSeenTour: seen }),
      setPremium: (premium) => set({ isPremium: premium }),
      setHydrating: (hydrating) => set({ hydrating }),
      // Sprint 14.C HOTFIX — hasCompletedOnboarding + hasSeenTour KORUNUR.
      // Sebep: logout → false set ederdik → re-login render'da false okunur
      // → router onboarding'e gönderir → useUserDataSync server fetch yetişmez
      // (race condition). Çözüm: flag persisted kalır, server fetch sonrası
      // useUserDataSync gerçek değeri set eder (true ya da false).
      // isPremium GÜVENLİK için reset edilir (logout'ta premium gözükmesin).
      reset: () =>
        set((state) => ({
          session: null,
          user: null,
          profile: null,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          hasSeenTour: state.hasSeenTour,
          isPremium: false,
          hydrating: false,
        })),
    }),
    {
      name: 'airspeak-auth',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        hasSeenTour: state.hasSeenTour,
        isPremium: state.isPremium,
      }),
    },
  ),
);
