/**
 * SplashHydrating — Login sonrası server fetch beklerken gösterilen geçici ekran.
 *
 * Sprint 14.C: useUserDataSync userId aldığında authStore.hydrating=true.
 * app/index.tsx bunu okur, hydrating ise routing kararını alana kadar bu
 * ekranı gösterir. ~1-2 sn'lik fetch sırasında "boş ekran" / "yanlış ekran"
 * geçişini engeller. Race condition fix.
 */
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SplashHydrating() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F1E47' }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: -0.5,
          }}
        >
          AirSpeak
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: '#E11D2E',
            fontWeight: '700',
            letterSpacing: 2,
            marginTop: -8,
          }}
        >
          AVIATION ENGLISH
        </Text>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={{ marginTop: 24 }} />
      </SafeAreaView>
    </View>
  );
}
