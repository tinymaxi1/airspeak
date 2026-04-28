import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);
  const hasSeenTour = useAuthStore((s) => s.hasSeenTour);

  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;
  if (!hasSeenTour) return <Redirect href="/onboarding-tour" />;
  return <Redirect href="/(tabs)/home" />;
}
