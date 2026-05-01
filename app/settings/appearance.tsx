/**
 * Settings → Appearance — tema seçim (light/dark/system).
 * useThemeStore üzerinden anlık değişir, user_settings.theme'e DB sync.
 */
import { ScrollView, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore, type ThemePreference } from '@/stores/themeStore';
import { Eyebrow, Mono, Body, FONTS, BackButton } from '@/components/airspeak';

interface ThemeOption {
  value: ThemePreference;
  icon: string;
  labelKey: string;
  labelDefault: string;
  descKey: string;
  descDefault: string;
}

const OPTIONS: ThemeOption[] = [
  {
    value: 'system',
    icon: '✦',
    labelKey: 'settings.appearance.system',
    labelDefault: 'Otomatik',
    descKey: 'settings.appearance.systemDesc',
    descDefault: 'Cihaz ayarına göre değişir',
  },
  {
    value: 'light',
    icon: '☀',
    labelKey: 'settings.appearance.light',
    labelDefault: 'Aydınlık',
    descKey: 'settings.appearance.lightDesc',
    descDefault: 'Beyaz arka plan, gündüz okuması için ideal',
  },
  {
    value: 'dark',
    icon: '☾',
    labelKey: 'settings.appearance.dark',
    labelDefault: 'Karanlık',
    descKey: 'settings.appearance.darkDesc',
    descDefault: 'Koyu arka plan, göz yorgunluğunu azaltır',
  },
];

export default function AppearanceSettingsScreen() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const systemScheme = useColorScheme();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <BackButton onPress={() => router.back()} label={t('common.back', 'Geri')} />
          <Text
            accessibilityRole="header"
            style={{ flex: 1, fontFamily: FONTS.body800, fontSize: 22, color: '#0E1116' }}
          >
            {t('settings.appearance.title', 'Görünüm')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Body color="#5A6478" style={{ fontSize: 14, marginBottom: 20, lineHeight: 21 }}>
          {t(
            'settings.appearance.intro',
            'AirSpeak\'in renk temasını seç. Otomatik mod cihazının ayarına göre gece/gündüz değişir.',
          )}
        </Body>

        <Eyebrow>{t('settings.appearance.modesEyebrow', 'TEMA')}</Eyebrow>
        <View
          style={{
            marginTop: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            paddingHorizontal: 14,
          }}
        >
          {OPTIONS.map((opt, i) => {
            const selected = theme === opt.value;
            const last = i === OPTIONS.length - 1;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.85}
                onPress={() => setTheme(opt.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 4,
                  borderBottomWidth: last ? 0 : 1,
                  borderBottomColor: '#EDEFF3',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: selected ? '#0F1E47' : '#EDEFF3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 18, color: selected ? '#FFD56B' : '#0F1E47' }}>
                    {opt.icon}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 15,
                      color: '#0E1116',
                      lineHeight: 18,
                    }}
                  >
                    {t(opt.labelKey, opt.labelDefault)}
                  </Text>
                  <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }}>
                    {t(opt.descKey, opt.descDefault)}
                    {opt.value === 'system' && systemScheme && (
                      <>
                        {' · '}
                        <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
                          {systemScheme === 'dark'
                            ? t('settings.appearance.currentlyDark', 'şu an karanlık')
                            : t('settings.appearance.currentlyLight', 'şu an aydınlık')}
                        </Mono>
                      </>
                    )}
                  </Body>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: selected ? '#0F1E47' : '#DCE0E8',
                    backgroundColor: selected ? '#0F1E47' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <Text style={{ fontSize: 12, color: '#FFD56B', fontWeight: '700' }}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Mono
          style={{
            fontSize: 11,
            color: '#8A93A6',
            textAlign: 'center',
            marginTop: 24,
            lineHeight: 16,
          }}
        >
          {t(
            'settings.appearance.note',
            'Tercih cihaza ve hesabına kaydedilir. Diğer cihazlarında otomatik senkronlanır.',
          )}
        </Mono>
      </ScrollView>
    </View>
  );
}
