import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const { session, hasCompletedOnboarding } = useAuthStore();

  // İlk açılış (oturum yok) → Welcome cinematic ekranına git
  // Oradan kullanıcı "Start free trial" → Register, ya da "I have an account" → Login seçer
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;
  return <Redirect href="/(tabs)/home" />;
}
