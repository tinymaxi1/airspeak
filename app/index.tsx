import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { SplashHydrating } from '@/components/SplashHydrating';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const hasSeenTour = useAuthStore((s) => s.hasSeenTour);
  const hydrating = useAuthStore((s) => s.hydrating);

  if (!session) return <Redirect href="/(auth)/welcome" />;

  // Sprint 14.C — login sonrası useUserDataSync server'dan profile çekene
  // kadar splash göster. Yoksa local hasCompletedOnboarding=false (logout
  // sırasında reset edilen) okuyup user'ı yanlışlıkla onboarding'e
  // yönlendirirdik (race condition bug).
  if (hydrating) return <SplashHydrating />;

  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;
  if (!hasSeenTour) return <Redirect href="/onboarding-tour" />;
  return <Redirect href="/(tabs)/home" />;
}
