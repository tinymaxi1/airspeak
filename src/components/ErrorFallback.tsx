/**
 * ErrorFallback — Sprint 13.A.8
 *
 * Sentry.ErrorBoundary fallback'i: React tree'de yakalanmamış hata olduğunda
 * white screen yerine kullanıcıya açıklayıcı UI + "Anasayfaya dön" butonu.
 */
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button3D, FONTS } from '@/components/airspeak';

interface Props {
  error: unknown;
  componentStack?: string | null;
  resetError: () => void;
  eventId?: string;
}

export function ErrorFallback({ error, resetError, eventId }: Props) {
  const err = error instanceof Error ? error : null;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1E47' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 64 }}>✈️💥</Text>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 26,
            fontWeight: '700',
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: -0.52,
          }}
        >
          Pisten çıktık
        </Text>
        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 20,
          }}
        >
          Beklenmeyen bir hata oluştu. Hata raporu otomatik olarak gönderildi, ekibimiz inceleyecek.
        </Text>

        {__DEV__ && (
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 8,
              padding: 12,
              maxWidth: 360,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: 'rgba(255,180,180,0.95)',
              }}
            >
              {err?.name ?? 'Error'}: {err?.message ?? String(error)}
            </Text>
          </View>
        )}

        {eventId && (
          <Text
            style={{
              fontFamily: FONTS.mono,
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            ID: {eventId.slice(0, 12)}
          </Text>
        )}

        <View style={{ width: '100%', maxWidth: 320, gap: 8, marginTop: 8 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => {
              resetError();
              router.replace('/(tabs)/home');
            }}
          >
            Anasayfaya dön
          </Button3D>
          <Button3D variant="ghost" fullWidth onPress={resetError}>
            Tekrar dene
          </Button3D>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
