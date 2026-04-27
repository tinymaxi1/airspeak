/**
 * Placement Result — 4 boyut detaylı sonuç ekranı.
 *
 * Gösterir:
 * - 4 boyut için ayrı renk-kodlu kart (label + skor + 1 cümle yorum)
 * - Roadmap (4 hafta plan)
 * - Senin için tavsiye (rol bazlı)
 * - "Hadi başla" CTA → goals.tsx
 */
import { ScrollView } from 'react-native';
import {
  YStack,
  XStack,
  H2,
  H3,
  Paragraph,
  Card,
  Button,
  Text,
  Progress,
} from 'tamagui';
import { router } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { DimensionResult } from '@/types/profile';

interface DimensionMeta {
  key: 'generalEnglish' | 'aviationEnglish' | 'aviationKnowledge' | 'communication';
  titleTr: string;
  emoji: string;
  color: string;
  description: string;
}

const DIMENSION_META: DimensionMeta[] = [
  {
    key: 'generalEnglish',
    titleTr: 'Genel İngilizce',
    emoji: '📚',
    color: '$blue9',
    description: 'CEFR — havacılık dışı temel İngilizce',
  },
  {
    key: 'aviationEnglish',
    titleTr: 'Havacılık İngilizcesi',
    emoji: '✈️',
    color: '$primary',
    description: 'Rolüne özel havacılık dil yeterliliğin',
  },
  {
    key: 'aviationKnowledge',
    titleTr: 'Havacılık Bilgisi',
    emoji: '🛩️',
    color: '$accent',
    description: 'Operasyonel ve prosedürel bilgin',
  },
  {
    key: 'communication',
    titleTr: 'İletişim & Mülakat',
    emoji: '💼',
    color: '$success',
    description: 'Sözlü iletişim ve senaryo yönetimi',
  },
];

function getInterpretation(result: DimensionResult, key: string): string {
  if (result.score >= 80) {
    return 'Mükemmel seviye — bu alanda oldukça güçlüsün.';
  }
  if (result.score >= 55) {
    return 'İyi seviye — küçük geliştirmelerle uzman olabilirsin.';
  }
  if (result.score >= 30) {
    return 'Orta seviye — temel sağlam, ileri konularla geliştir.';
  }
  return 'Başlangıç seviyesi — bu alanda odaklı pratik gerekiyor.';
}

function tierColor(score: number): string {
  if (score >= 80) return '$success';
  if (score >= 55) return '$primary';
  if (score >= 30) return '$accent';
  return '$danger';
}

export default function PlacementResultScreen() {
  const result = useOnboardingStore((s) => s.placementResult);
  const role = useOnboardingStore((s) => s.role);

  if (!result || !result.generalEnglish) {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Text fontSize={64} textAlign="center">❓</Text>
        <H2 color="$text" textAlign="center">Henüz test alınmamış</H2>
        <Paragraph color="$textSecondary" textAlign="center">
          Önce seviye testini tamamla.
        </Paragraph>
        <Button onPress={() => router.replace('/(auth)/onboarding/level-test')}>
          Teste başla
        </Button>
      </YStack>
    );
  }

  const dimensionResults = {
    generalEnglish: result.generalEnglish,
    aviationEnglish: result.aviationEnglish,
    aviationKnowledge: result.aviationKnowledge,
    communication: result.communication,
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        {/* Header */}
        <YStack gap="$2" alignItems="center">
          <Text fontSize={56}>🎯</Text>
          <H2 color="$text" textAlign="center">Seviyen Belirlendi</H2>
          <Paragraph color="$textSecondary" textAlign="center">
            4 farklı alanda durumun aşağıda. Test sonucu bu yolculuğunu şekillendirecek.
          </Paragraph>
        </YStack>

        {/* 4 boyut kartları */}
        <YStack gap="$3">
          <H3 color="$text">📊 Seviyen — 4 Alan</H3>
          {DIMENSION_META.map((meta) => {
            const dim = dimensionResults[meta.key];
            return (
              <Card key={meta.key} padding="$4" backgroundColor="$surface" bordered>
                <YStack gap="$2">
                  <XStack gap="$3" alignItems="center">
                    <Text fontSize={36}>{meta.emoji}</Text>
                    <YStack flex={1}>
                      <Text fontSize="$3" color="$textSecondary" textTransform="uppercase">
                        {meta.titleTr}
                      </Text>
                      <Text fontSize="$2" color="$textSecondary">
                        {meta.description}
                      </Text>
                    </YStack>
                    <YStack alignItems="flex-end">
                      <Text fontSize="$8" fontWeight="700" color={tierColor(dim.score)}>
                        {dim.label.toUpperCase()}
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        %{dim.score}
                      </Text>
                    </YStack>
                  </XStack>

                  <Progress value={dim.score} max={100} backgroundColor="$border">
                    <Progress.Indicator animation="lazy" backgroundColor={tierColor(dim.score)} />
                  </Progress>

                  <Text fontSize="$3" color="$text">
                    {getInterpretation(dim, meta.key)}
                  </Text>

                  <Text fontSize="$1" color="$textSecondary">
                    {dim.questionsAnswered} soru cevaplandı · Güven:{' '}
                    {dim.confidence === 'high' ? 'Yüksek' : dim.confidence === 'medium' ? 'Orta' : 'Düşük'}
                  </Text>
                </YStack>
              </Card>
            );
          })}
        </YStack>

        {/* Primary focus */}
        {result.recommendations && (
          <Card padding="$4" backgroundColor="$accent">
            <YStack gap="$2">
              <Text fontSize="$3" color="$accentText" textTransform="uppercase">
                🎯 Önce neye odaklanmalı?
              </Text>
              <Paragraph color="$accentText" fontWeight="600">
                {result.recommendations.primaryFocus}
              </Paragraph>
            </YStack>
          </Card>
        )}

        {/* Rol bazlı tavsiye */}
        {result.recommendations?.roleAdvice && result.recommendations.roleAdvice.length > 0 && (
          <Card padding="$4" backgroundColor="$primarySubtle">
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="700" color="$primary">
                💡 {role === 'pilot'
                  ? 'Pilot için'
                  : role === 'cabin'
                    ? 'Kabin Memuru için'
                    : role === 'technician'
                      ? 'Teknisyen için'
                      : role === 'ground'
                        ? 'Yer Hizmetleri için'
                        : role === 'student'
                          ? 'Öğrenci için'
                          : 'Sana özel'}{' '}
                tavsiye
              </Text>
              {result.recommendations.roleAdvice.map((advice, i) => (
                <XStack key={i} gap="$2" alignItems="flex-start">
                  <Text fontSize="$4" color="$primary">
                    ✓
                  </Text>
                  <Text fontSize="$3" color="$text" flex={1}>
                    {advice}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Card>
        )}

        {/* Roadmap */}
        {result.recommendations?.roadmap && result.recommendations.roadmap.length > 0 && (
          <Card padding="$4" backgroundColor="$surface" bordered>
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="700" color="$text">
                📅 4 Haftalık Yol Haritası
              </Text>
              {result.recommendations.roadmap.map((step, i) => (
                <XStack key={i} gap="$3" alignItems="flex-start">
                  <Card paddingHorizontal="$2" paddingVertical="$1" backgroundColor="$primary">
                    <Text fontSize="$2" color="$primaryText" fontWeight="700">
                      {i + 1}
                    </Text>
                  </Card>
                  <Text fontSize="$3" color="$text" flex={1}>
                    {step}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Card>
        )}

        {/* CTA */}
        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={() => router.replace('/(auth)/onboarding/goals')}
        >
          🚀 Hadi başla
        </Button>

        <Text fontSize="$1" color="$textSecondary" textAlign="center">
          Her zaman Profile sayfasından testi yeniden alabilirsin.
        </Text>
      </YStack>
    </ScrollView>
  );
}
