import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text as RNText, TextInput as RNTextInput, AppState } from 'react-native';
// Sprint 6.D — Dynamic Type cap (1.8) global default. Erişilebilirlik dengesi.
(RNText as any).defaultProps = (RNText as any).defaultProps || {};
(RNText as any).defaultProps.maxFontSizeMultiplier = 1.8;
(RNTextInput as any).defaultProps = (RNTextInput as any).defaultProps || {};
(RNTextInput as any).defaultProps.maxFontSizeMultiplier = 1.8;
import { TamaguiProvider } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as usePlusJakartaSans,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import config from '../tamagui.config';
import { queryClient } from '@/lib/queryClient';
import { initI18n } from '@/lib/i18n';
import { initAnalytics } from '@/lib/posthog';
import { initSentry, identifyUser, clearUser } from '@/lib/sentry';
import { initIap, linkIapUser, logOutIap, syncPremiumFromIap } from '@/lib/iap';
import { useTranslation } from 'react-i18next';
import {
  requestPermission as requestNotifPermission,
  scheduleDailyReminders,
  updateStreakDangerNotification,
  syncPushTokenToSupabase,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { subscribeContentRealtime } from '@/features/content/realtime';
import { useBadgeWatcher } from '@/features/badges/useBadgeWatcher';
import { PaywallTriggerSheet } from '@/components/paywall/PaywallTriggerSheet';
import { useWalletMigration } from '@/features/wallet/useWalletMigration';
import { useLastActiveHeartbeat } from '@/features/social/presence';
import { useTrialEndingPaywall } from '@/features/trial/api';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { NotificationBannerHost } from '@/components/notifications/NotificationBanner';
import {
  usePushResponseHandler,
  useForegroundPushBanner,
  useNotificationLogBanner,
} from '@/features/notifications/listeners';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics();
initI18n();
void initIap();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const themePref = useThemeStore((s) => s.theme);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromDb);
  const userId = useAuthStore((s) => s.user?.id);

  // Tema seçimi: 'system' → cihaz scheme; aksi halde kullanıcı seçimi
  const colorScheme: 'light' | 'dark' =
    themePref === 'system' ? (systemColorScheme ?? 'light') : themePref;

  // Login sonrası DB'den theme hydrate et
  useEffect(() => {
    if (userId) void hydrateTheme(userId);
  }, [userId, hydrateTheme]);

  // AirSpeak design system: Plus Jakarta Sans (gövde) + Space Grotesk (display) + JetBrains Mono (eyebrow/data)
  const [fontsLoaded] = usePlusJakartaSans({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const { t } = useTranslation();

  // Badge watcher — store değişimlerinde eligible rozetleri server'a yazar
  useBadgeWatcher();

  // Wallet migration — first launch'ta MMKV → DB one-way
  useWalletMigration();

  // Last-active heartbeat — sosyal kanıt (son 24h aktif sayısı) için DB bump
  useLastActiveHeartbeat();

  // Trial 1 gün/0 gün kala client-side paywall (push trigger'a ek olarak)
  const trialUserId = useAuthStore((s) => s.user?.id);
  useTrialEndingPaywall(trialUserId);

  // In-app notification banner: 3 listener — push tap, foreground push, realtime
  usePushResponseHandler();
  useForegroundPushBanner();
  useNotificationLogBanner(trialUserId);

  // Network monitoring — getState() ile al, subscribe etme (döngü önler)
  useEffect(() => {
    const unsub = useOfflineStore.getState().startNetInfoMonitoring();
    return unsub;
  }, []);

  // Content realtime — admin değişiklikleri canlı yansır
  useEffect(() => {
    const unsub = subscribeContentRealtime(queryClient);
    return unsub;
  }, []);

  // Notifications: izin iste + günlük + streak danger
  useEffect(() => {
    if (!fontsLoaded) return;
    const lastActivityDate = useGamificationStore.getState().lastActivityDate;
    (async () => {
      const granted = await requestNotifPermission().catch(() => false);
      if (!granted) return;
      await Promise.all([
        scheduleDailyReminders(undefined, {
          morningTitle: t('notif.morningTitle', 'Günaydın ✈'),
          morningBody: t('notif.morningBody', 'Bugünkü uçuş planın hazır. 15 dk yeter.'),
          eveningTitle: t('notif.eveningTitle', '🔥 Streak\'in tehlikede'),
          eveningBody: t('notif.eveningBody', 'Bugün hâlâ pratik yapmadın. 1 ders streak\'i kurtarır.'),
        }).catch((e) => console.warn('Notif schedule failed', e)),
        updateStreakDangerNotification(lastActivityDate, {
          title: t('notif.dangerTitle', '⚠ Son 90 dk!'),
          body: t('notif.dangerBody', 'Streak kırılmasın diye 1 hızlı pratik yeter.'),
        }).catch(() => undefined),
      ]);
    })();
    // t intentionally NOT in deps — i18n change listener subscribe'ı ek render tetikler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);

  // Push token + Sentry user identify: Supabase'e sync (login sonrası)
  useEffect(() => {
    if (!fontsLoaded) return;
    const sync = () => {
      syncPushTokenToSupabase().catch((e) => console.warn('Push token sync failed', e));
    };
    // Initial: zaten oturum açıksa Sentry'ye user'ı bildir
    const initialUser = useAuthStore.getState().user;
    const initialProfile = useAuthStore.getState().profile;
    if (initialUser) {
      identifyUser({ id: initialUser.id, role: initialProfile?.role ?? null });
      // Sprint 13.A.2 — IAP user link + premium sync (mock-first: key yoksa no-op)
      void linkIapUser(initialUser.id).then(() => syncPremiumFromIap());
    }
    sync();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        sync();
        if (session?.user) {
          const role = useAuthStore.getState().profile?.role ?? null;
          identifyUser({ id: session.user.id, role });
          void linkIapUser(session.user.id).then(() => syncPremiumFromIap());
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        void logOutIap();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [fontsLoaded]);

  // Sprint 13.A.4 — App foreground'a gelince premium durumunu IAP'tan sync et.
  // Kullanıcı dışarıda satın alım yaptıysa veya cihazlar arası senkron için.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && useAuthStore.getState().user) {
        void syncPremiumFromIap();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <TamaguiProvider config={config} defaultTheme={colorScheme}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              headerBackTitle: 'Geri',
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Custom-chrome ekranlar — hepsi kendi SafeArea + top bar'ını yönetiyor */}
            <Stack.Screen name="lesson/[id]" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="conversation/index" options={{ headerShown: false }} />
            <Stack.Screen name="conversation/[scenario]" options={{ headerShown: false }} />
            <Stack.Screen name="readback" options={{ headerShown: false }} />
            <Stack.Screen name="vocab" options={{ headerShown: false }} />
            <Stack.Screen name="career" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding-tour" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="bookmarks" options={{ headerShown: false }} />
            <Stack.Screen name="pronunciation/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="settings/index" options={{ headerShown: false }} />
            <Stack.Screen name="settings/profile" options={{ headerShown: false }} />
            <Stack.Screen name="settings/privacy" options={{ headerShown: false }} />
            <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
            <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
            <Stack.Screen name="legal/kvkk" options={{ headerShown: false }} />
            <Stack.Screen name="settings/help" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="offline" options={{ headerShown: false }} />
            <Stack.Screen name="mic-denied" options={{ headerShown: false }} />
            <Stack.Screen name="squadron-pairing" options={{ headerShown: false }} />
            <Stack.Screen name="community/index" options={{ headerShown: false }} />
            <Stack.Screen name="community/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="community/new-group" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="community/post/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="community/hashtag/[tag]" options={{ headerShown: false }} />
            <Stack.Screen name="community/search" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="community/bookmarks" options={{ headerShown: false }} />
            <Stack.Screen name="community/notifications" options={{ headerShown: false }} />
            <Stack.Screen name="community/u/[username]" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-sets" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-briefing" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="exam/icao4-live" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-result" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-history" options={{ headerShown: false }} />
            <Stack.Screen name="exam/mock-studio" options={{ headerShown: false }} />
            {/* Modals — transparent overlay */}
            <Stack.Screen
              name="streak-freeze"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="heart-refill"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade',
              }}
            />
            {/* Eski header'lı ekranlar */}
            <Stack.Screen name="shop" options={{ headerShown: false }} />
            <Stack.Screen name="srs/index" options={{ headerShown: false }} />
            <Stack.Screen name="exam/index" options={{ headerShown: true, headerTitle: 'Sınav Hazırlık' }} />
            <Stack.Screen name="exam/airlines" options={{ headerShown: false }} />
            <Stack.Screen name="exam/airline/[id]" options={{ headerShown: true, headerTitle: 'Havayolu Detay' }} />
            <Stack.Screen name="exam/icao4" options={{ headerShown: true, headerTitle: 'ICAO 4 Sözlü' }} />
            <Stack.Screen name="settings/language" options={{ headerShown: true, headerTitle: 'Dil Seç' }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: true, headerTitle: 'Quiz' }} />
          </Stack>
          <PaywallTriggerSheet />
          <NotificationBannerHost />
        </QueryClientProvider>
      </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
