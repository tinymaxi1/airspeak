/**
 * Dil Seçici — 20 dil arasından seçim.
 *
 * Pazar bilgisi gösterir (hangi havayolları, TAM büyüklüğü).
 * Çeviri kapsamı %0 olan dillerde uyarı gösterir.
 */
import { ScrollView } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button } from 'tamagui';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { changeLanguage, getCurrentLanguage, LOCALE_COVERAGE } from '@/lib/i18n';
import { LOCALE_META, SUPPORTED_LOCALES, type Locale } from '@/lib/i18nTypes';

export default function LanguagePickerScreen() {
  const c = usePalette();
  const [current, setCurrent] = useState<Locale>('en');

  useEffect(() => {
    setCurrent(getCurrentLanguage());
  }, []);

  const handleSelect = async (lang: Locale) => {
    await changeLanguage(lang);
    setCurrent(lang);
    // RTL diller için tam reload gerekir — production'da RNRestart
  };

  // Grup: ana → bölgesel → kapsamadan dolu olanlar üstte
  const grouped = [
    { title: 'Ana diller', tr: 'Ana diller', langs: ['en', 'tr'] as Locale[] },
    { title: 'Orta Doğu', tr: 'Orta Doğu', langs: ['ar', 'fa'] as Locale[] },
    { title: 'Avrupa', tr: 'Avrupa', langs: ['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'el', 'ru'] as Locale[] },
    { title: 'Asya', tr: 'Asya', langs: ['zh', 'ja', 'ko', 'hi', 'id', 'th', 'ms'] as Locale[] },
  ];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">Dil seç · Choose language</H2>
          <Paragraph color="$textSecondary">
            20 dil destekleniyor. Şu an sadece İngilizce ve Türkçe %100 — diğerleri lokalizasyon bekliyor.
          </Paragraph>
        </YStack>

        <Card padding="$3" backgroundColor="$warning">
          <Text fontSize="$3" color="$primaryText">
            ⚠️ EN ve TR dışındaki diller henüz placeholder. Diğer diller yakında geliyor.
            Şimdi seçersen UI çoğu metin İngilizce kalır.
          </Text>
        </Card>

        {grouped.map((group) => (
          <YStack key={group.title} gap="$2">
            <H3 color="$text">{group.tr}</H3>
            {group.langs.map((lang) => {
              const meta = LOCALE_META[lang];
              const coverage = LOCALE_COVERAGE[lang];
              const isActive = current === lang;
              const isReady = coverage >= 80;

              return (
                <Card
                  key={lang}
                  padding="$3"
                  backgroundColor={isActive ? '$primary' : '$surface'}
                  borderColor={isActive ? '$primary' : '$border'}
                  bordered
                  onPress={() => handleSelect(lang)}
                  pressStyle={{ scale: 0.98 }}
                >
                  <XStack gap="$3" alignItems="center">
                    <Text fontSize={32}>{meta.flag}</Text>
                    <YStack flex={1}>
                      <XStack gap="$2" alignItems="center">
                        <Text
                          fontSize="$5"
                          fontWeight="700"
                          color={isActive ? '$primaryText' : '$text'}
                        >
                          {meta.nativeName}
                        </Text>
                        {meta.rtl && (
                          <Card backgroundColor="$accent" paddingHorizontal="$2" paddingVertical="$1">
                            <Text fontSize="$1" color="$accentText" fontWeight="700">RTL</Text>
                          </Card>
                        )}
                      </XStack>
                      <Text fontSize="$2" color={isActive ? '$primaryText' : '$textSecondary'}>
                        {meta.englishName} · {meta.turkishName}
                      </Text>
                      <Text fontSize="$1" color={isActive ? '$primaryText' : '$textSecondary'}>
                        {meta.targetMarkets.join(' · ')}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end" gap="$1">
                      {isActive && <Text fontSize="$5">✓</Text>}
                      <Card
                        backgroundColor={isReady ? '$success' : '$backgroundHover'}
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                      >
                        <Text fontSize="$1" color={isReady ? '$primaryText' : '$textSecondary'}>
                          %{coverage}
                        </Text>
                      </Card>
                    </YStack>
                  </XStack>
                </Card>
              );
            })}
          </YStack>
        ))}

        <Button onPress={() => router.back()}>← Geri</Button>
      </YStack>
    </ScrollView>
  );
}
