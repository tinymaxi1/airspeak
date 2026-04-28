import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { session, hasCompletedOnboarding, hasSeenTour } = useAuthStore();

  // İlk açılış (oturum yok) → Welcome cinematic
  if (!session) return <Redirect href="/(auth)/welcome" />;

  // Onboarding tamamlanmamış → role select
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;

  // Onboarding tamam ama tour görmemiş → tour
  if (!hasSeenTour) return <Redirect href="/onboarding-tour" />;

  // Hepsi tamam → home
  return <Redirect href="/(tabs)/home" />;
}
