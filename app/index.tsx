import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { session, hasCompletedOnboarding } = useAuthStore();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;
  return <Redirect href="/(tabs)/home" />;
}
