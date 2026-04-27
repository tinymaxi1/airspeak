import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Text, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSrsStore } from '@/stores/srsStore';
import { PRONUNCIATION_SENTENCES } from '@/features/pronunciation/sentences';

export default function PracticeScreen() {
  const { t } = useTranslation();
  const dueCount = useSrsStore((s) => s.getDueTerms().length);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack padding="$4" gap="$4" backgroundColor="$background" minHeight="100%">
        <YStack gap="$1">
          <H2 color="$text">{t('practice.title', 'Pratik')}</H2>
          <Paragraph color="$textSecondary">{t('practice.subtitle')}</Paragraph>
        </YStack>

        {/* SRS Review */}
        <Card
          padding="$4"
          backgroundColor="$primary"
          onPress={() => router.push('/srs')}
          pressStyle={{ scale: 0.98 }}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🧠</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$primaryText">
                SRS Tekrar
              </Text>
              <Text fontSize="$3" color="$primaryText">
                Akıllı hafıza sistemi (SuperMemo)
              </Text>
              <Text fontSize="$2" color="$primaryText">
                {dueCount > 0 ? `${dueCount} kart hazır` : 'Tüm tekrar tamam'}
              </Text>
            </YStack>
            <Text fontSize="$5" color="$primaryText">
              →
            </Text>
          </XStack>
        </Card>

        {/* Pronunciation */}
        <Card
          padding="$4"
          backgroundColor="$accent"
          onPress={() => {
            const first = PRONUNCIATION_SENTENCES[0];
            if (first) {
              router.push({
                pathname: '/pronunciation/[id]',
                params: { id: first.id },
              });
            }
          }}
          pressStyle={{ scale: 0.98 }}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🎙️</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$accentText">
                Telaffuz Drill
              </Text>
              <Text fontSize="$3" color="$accentText">
                ICAO 4 telaffuz analizi
              </Text>
              <Text fontSize="$2" color="$accentText">
                {PRONUNCIATION_SENTENCES.length} cümle hazır
              </Text>
            </YStack>
            <Text fontSize="$5" color="$accentText">
              →
            </Text>
          </XStack>
        </Card>

        {/* AI Conversation - Premium */}
        <Card
          padding="$4"
          backgroundColor="$surface"
          bordered
          opacity={0.7}
          onPress={() => router.push('/paywall')}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🤖</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$text">
                AI Konuşma
              </Text>
              <Text fontSize="$3" color="$textSecondary">
                ATC, kaptan, mülakatçı rol oyna
              </Text>
              <Text fontSize="$2" color="$warning">
                🔒 PREMIUM
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Sınav Hazırlık Hub — rol bazlı */}
        <Card
          padding="$4"
          backgroundColor="$primary"
          onPress={() => router.push('/exam')}
          pressStyle={{ scale: 0.98 }}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🎯</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$primaryText">
                Sınav Hazırlık
              </Text>
              <Text fontSize="$3" color="$primaryText">
                ICAO 4 · SHGM · YDS · Mülakat — rolüne özel
              </Text>
              <Text fontSize="$2" color="$primaryText">
                Pilot 5 sınav · Kabin 4 · Teknisyen 3 · Yer 3 · Öğrenci 3
              </Text>
            </YStack>
            <Text fontSize="$5" color="$primaryText">
              →
            </Text>
          </XStack>
        </Card>

        {/* ICAO 4 Simulator (hızlı erişim) */}
        <Card
          padding="$4"
          backgroundColor="$surface"
          bordered
          onPress={() => router.push('/exam/icao4')}
          pressStyle={{ scale: 0.98 }}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🎙️</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$text">
                ICAO 4 Sözlü Simülatör (Hızlı)
              </Text>
              <Text fontSize="$3" color="$textSecondary">
                4 görev tipi, 6-alan rubric — AI examiner
              </Text>
              <Text fontSize="$2" color="$warning">
                İlk görev ücretsiz
              </Text>
            </YStack>
            <Text fontSize="$5" color="$text">
              →
            </Text>
          </XStack>
        </Card>

        {/* Quiz Practice */}
        <Card
          padding="$4"
          backgroundColor="$surface"
          bordered
          onPress={() => router.push('/(tabs)/learn')}
        >
          <XStack gap="$3" alignItems="center">
            <Text fontSize={36}>🎯</Text>
            <YStack flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$text">
                Quiz Pratiği
              </Text>
              <Text fontSize="$3" color="$textSecondary">
                Ders ağacındaki quiz'leri çöz
              </Text>
            </YStack>
            <Text fontSize="$5" color="$text">
              →
            </Text>
          </XStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
