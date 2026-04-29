/**
 * Welcome Screen — AirSpeak Cinematic Hero
 *
 * Tasarım: navy-900 bg + topo gradient + globe arcs + hero "Speak the language of flight."
 * - Logo lockup üst sol
 * - "ICAO L4 ✦ EN" kod rozeti üst sağ (mono uppercase)
 * - Eyebrow: "Cleared for takeoff" (red)
 * - Hero: Space Grotesk 56px "Speak the\nlanguage of\nflight." (last line red)
 * - Body: 5 rolün ortak topluluğu (pilot, kabin, teknisyen, yer hizmetleri, öğrenci) +
 *   ICAO L4 + AI co-pilot vurgusu — havacılık İngilizcesi her rol için
 * - CTA: "START FREE TRIAL" red 3D + ghost "I have an account"
 * - Footer: 7 DAY TRIAL • CANCEL ANYTIME
 */
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Hero,
  Eyebrow,
  Body,
  Button3D,
  LogoLockup,
  TopoBackground,
  FONTS,
} from '@/components/airspeak';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: '#0F1E47' }}>
      {/* Topo Background — globe arcs + red glow */}
      <View style={{ position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0 }}>
        <TopoBackground />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8 }}>
          {/* TOP — Logo + ICAO badge */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginTop: 8,
            }}
          >
            <LogoLockup inverse />
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.18)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 10,
                  letterSpacing: 1.8,
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                }}
              >
                ICAO L4 ✦ EN
              </Text>
            </View>
          </View>

          {/* SPACER */}
          <View style={{ flex: 1 }} />

          {/* HERO BLOCK */}
          <View style={{ marginBottom: 24 }}>
            <Eyebrow accent>{t('screens.welcome.heroAccent')}</Eyebrow>
            <Hero color="#FFFFFF" style={{ marginTop: 12, marginBottom: 16 }}>
              {t('screens.welcome.hero1')}{'\n'}{t('screens.welcome.hero2')}{'\n'}
              <Text style={{ color: '#FF5A66' }}>{t('screens.welcome.hero3')}</Text>
            </Hero>
            <Body color="rgba(255,255,255,0.75)" style={{ fontSize: 17, lineHeight: 25, maxWidth: 320 }}>
              {t('screens.welcome.subtitle')}
            </Body>
          </View>

          {/* CTAS */}
          <View style={{ gap: 10, marginBottom: 8 }}>
            <Button3D
              variant="primary"
              fullWidth
              onPress={() => router.push('/(auth)/register')}
            >
              {t('screens.welcome.ctaTrial')}
            </Button3D>
            <Button3D
              variant="ghost"
              fullWidth
              onPress={() => router.push('/(auth)/login')}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.2)',
                borderBottomWidth: 0,
              }}
              textStyle={{ color: '#FFFFFF', textTransform: 'none', fontWeight: '600' }}
            >
              {t('screens.welcome.ctaLogin')}
            </Button3D>
          </View>

          {/* FOOTER */}
          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: 1.1,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {t('screens.welcome.footer')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
