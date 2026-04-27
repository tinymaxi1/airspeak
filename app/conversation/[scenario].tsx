import { ScrollView } from 'react-native';
import { YStack, XStack, H2, Paragraph, Card, Button, Text } from 'tamagui';
import { router } from 'expo-router';

/**
 * AI Konuşma — şu an pasif placeholder.
 * Sprint 5'te Anthropic API key gelince aktif olacak.
 */
export default function ConversationScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$5" backgroundColor="$background" justifyContent="center">
        <Card padding="$5" backgroundColor="$accent" alignItems="center">
          <YStack gap="$3" alignItems="center">
            <Text fontSize={64}>🤖</Text>
            <H2 color="$accentText" textAlign="center">
              AI Konuşma
            </H2>
            <Paragraph color="$accentText" textAlign="center">
              Yakında! Claude AI ile gerçek pilot dilinde rol oyunu.
            </Paragraph>
          </YStack>
        </Card>

        <Card padding="$4" backgroundColor="$surface" bordered>
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="600" color="$text">
              Bu özellik geliştirme aşamasında
            </Text>
            <Paragraph color="$textSecondary">
              AI konuşma motoru Sprint 5'te aktive olacak. Premium üyeler:
            </Paragraph>
            <YStack gap="$1">
              <Text color="$text">🎙️ Voice-to-voice rol oyunu</Text>
              <Text color="$text">✈️ Pilot, ATC, mülakatçı senaryoları</Text>
              <Text color="$text">📊 6-alan ICAO rubric değerlendirmesi</Text>
              <Text color="$text">🎯 Spesifik hata feedback'i</Text>
            </YStack>
          </YStack>
        </Card>

        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={() => router.back()}
        >
          Geri dön
        </Button>
      </YStack>
    </ScrollView>
  );
}
