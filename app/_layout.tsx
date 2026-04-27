import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import config from '../tamagui.config';
import { queryClient } from '@/lib/queryClient';
import { initI18n } from '@/lib/i18n';
import { initAnalytics } from '@/lib/posthog';
import { initSentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics();
initI18n();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // TODO Sprint 1: Inter + JetBrains Mono fontlarını expo-font ile yükle
  // Şimdilik sistem fontuna düşüyoruz (San Francisco / Roboto)
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'light'}>
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
            <Stack.Screen name="lesson/[id]" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Ders' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Premium' }} />
            <Stack.Screen name="shop" options={{ headerShown: true, headerTitle: 'Mağaza' }} />
            <Stack.Screen name="srs/index" options={{ headerShown: true, headerTitle: 'SRS Tekrar' }} />
            <Stack.Screen name="exam/index" options={{ headerShown: true, headerTitle: 'Sınav Hazırlık' }} />
            <Stack.Screen name="exam/airlines" options={{ headerShown: true, headerTitle: 'Havayolları' }} />
            <Stack.Screen name="exam/airline/[id]" options={{ headerShown: true, headerTitle: 'Havayolu Detay' }} />
            <Stack.Screen name="exam/icao4" options={{ headerShown: true, headerTitle: 'ICAO 4 Sözlü' }} />
            <Stack.Screen name="settings/language" options={{ headerShown: true, headerTitle: 'Dil Seç' }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: true, headerTitle: 'Quiz' }} />
            <Stack.Screen name="conversation/[scenario]" options={{ headerShown: true, headerTitle: 'AI Konuşma' }} />
            <Stack.Screen name="pronunciation/[id]" options={{ headerShown: true, headerTitle: 'Telaffuz' }} />
          </Stack>
        </QueryClientProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
