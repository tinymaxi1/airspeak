import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';

export default function Index() {
  const { session, hasCompletedOnboarding } = useAuthStore();
  const isOnline = useOfflineStore((s) => s.isOnline);

  // Offline + oturum yoksa: welcome'a git (welcome cinematic offline çalışır)
  // Offline + oturum var: home'a git, home offline UI'sini gösterir
  // Bu app fully offline-capable olduğu için /offline ekranına otomatik yönlendirmiyoruz —
  // bu ekran sadece kullanıcı manuel offline mode'a geçtiğinde gösterilir.

  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!hasCompletedOnboarding) return <Redirect href="/(auth)/onboarding/role-select" />;
  return <Redirect href="/(tabs)/home" />;
}
