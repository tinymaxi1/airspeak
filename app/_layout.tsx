import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { initSentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

initSentry();
initAnalytics();
initI18n();

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
            {/* Custom-chrome ekranlar — hepsi kendi SafeArea + top bar'ını yönetiyor */}
            <Stack.Screen name="lesson/[id]" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="conversation/[scenario]" options={{ headerShown: false }} />
            <Stack.Screen name="pronunciation/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="settings/index" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="offline" options={{ headerShown: false }} />
            <Stack.Screen name="mic-denied" options={{ headerShown: false }} />
            <Stack.Screen name="squadron-pairing" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-briefing" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="exam/icao4-live" options={{ headerShown: false }} />
            <Stack.Screen name="exam/icao4-result" options={{ headerShown: false }} />
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
            <Stack.Screen name="shop" options={{ headerShown: true, headerTitle: 'Mağaza' }} />
            <Stack.Screen name="srs/index" options={{ headerShown: true, headerTitle: 'SRS Tekrar' }} />
            <Stack.Screen name="exam/index" options={{ headerShown: true, headerTitle: 'Sınav Hazırlık' }} />
            <Stack.Screen name="exam/airlines" options={{ headerShown: true, headerTitle: 'Havayolları' }} />
            <Stack.Screen name="exam/airline/[id]" options={{ headerShown: true, headerTitle: 'Havayolu Detay' }} />
            <Stack.Screen name="exam/icao4" options={{ headerShown: true, headerTitle: 'ICAO 4 Sözlü' }} />
            <Stack.Screen name="settings/language" options={{ headerShown: true, headerTitle: 'Dil Seç' }} />
            <Stack.Screen name="quiz/[id]" options={{ headerShown: true, headerTitle: 'Quiz' }} />
          </Stack>
        </QueryClientProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
