import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Paragraph, Card, Button, Text, Progress } from 'tamagui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import type { VocabularyTerm } from '@/features/lessons/seed/pilotVocab';
import { getVocabForRole } from '@/features/lessons/seed';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useSrsStore } from '@/stores/srsStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useQuestsStore } from '@/stores/questsStore';
import { isNewCard } from '@/features/srs/algorithm';
import { track } from '@/lib/posthog';

const QUALITY_OPTIONS = [
  { value: 1, label: 'Yeniden', emoji: '😵', color: '$danger' as const },
  { value: 3, label: 'Zor', emoji: '😬', color: '$warning' as const },
  { value: 4, label: 'İyi', emoji: '🙂', color: '$accent' as const },
  { value: 5, label: 'Kolay', emoji: '😎', color: '$success' as const },
];

export default function SrsReviewScreen() {
  const ensureCard = useSrsStore((s) => s.ensureCard);
  const reviewTerm = useSrsStore((s) => s.reviewTerm);
  const cards = useSrsStore((s) => s.cards);
  const addXp = useGamificationStore((s) => s.addXp);
  const recordDailyActivity = useGamificationStore((s) => s.recordDailyActivity);
  const incrementQuest = useQuestsStore((s) => s.incrementProgress);
  const role = useOnboardingStore((s) => s.role);

  const vocabSet = getVocabForRole(role);

  const [queue, setQueue] = useState<VocabularyTerm[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // İlk yüklemede SRS due + yeni kartları topla
  useEffect(() => {
    const due: VocabularyTerm[] = [];
    const newCards: VocabularyTerm[] = [];

    for (const term of vocabSet) {
      const card = cards[term.id];
      if (!card) {
        ensureCard(term.id);
        newCards.push(term);
      } else if (card.nextReviewAt <= Date.now()) {
        due.push(term);
      }
    }

    // Önce due (zaten gördüğü), sonra max 5 yeni (öğrenmek üzere)
    const session = [...due, ...newCards.slice(0, 5)];
    // Karıştır
    setQueue(session.sort(() => Math.random() - 0.5));
  }, []);

  const total = queue.length;
  const term = queue[currentIdx];

  if (total === 0) {
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Card padding="$5" backgroundColor="$accent" alignItems="center">
          <YStack gap="$3" alignItems="center">
            <Text fontSize={64}>🎉</Text>
            <H2 color="$accentText" textAlign="center">
              Tüm tekrar tamam!
            </H2>
            <Paragraph color="$accentText" textAlign="center">
              Bugün için kart kalmadı. Yarın yeni terimler hazır olacak.
            </Paragraph>
          </YStack>
        </Card>
        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={() => router.replace('/(tabs)/home')}
        >
          Ana sayfa
        </Button>
      </YStack>
    );
  }

  if (!term) {
    // Session bitti
    return (
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background" justifyContent="center">
        <Card padding="$5" backgroundColor="$success" alignItems="center">
          <YStack gap="$3" alignItems="center">
            <Text fontSize={64}>✅</Text>
            <H2 color="$primaryText" textAlign="center">
              Süper iş!
            </H2>
            <Text fontSize="$5" color="$primaryText">
              {reviewedCount} terim tekrar edildi
            </Text>
            <Text fontSize="$3" color="$primaryText">
              +{reviewedCount * 4} XP kazandın
            </Text>
          </YStack>
        </Card>
        <Button
          size="$5"
          backgroundColor="$primary"
          color="$primaryText"
          onPress={() => router.replace('/(tabs)/home')}
        >
          Bitir
        </Button>
      </YStack>
    );
  }

  const card = cards[term.id];
  const isNew = !card || isNewCard(card);

  function handleQuality(quality: number) {
    reviewTerm(term!.id, quality);
    addXp(quality >= 4 ? 5 : 3, 'srs_review');
    incrementQuest('srs_review', 1);
    if (reviewedCount === 0) {
      recordDailyActivity();
      incrementQuest('streak_check', 1);
    }
    setReviewedCount((c) => c + 1);
    track('srs_review_completed', {
      term_id: term!.id,
      quality,
    });
    setShowAnswer(false);
    setCurrentIdx(currentIdx + 1);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <YStack flex={1} padding="$4" gap="$4" backgroundColor="$background">
        <Progress value={(currentIdx / total) * 100} max={100} backgroundColor="$border">
          <Progress.Indicator animation="lazy" backgroundColor="$primary" />
        </Progress>
        <XStack justifyContent="space-between">
          <Paragraph size="$2" color="$textSecondary">
            Kart {currentIdx + 1} / {total}
          </Paragraph>
          {isNew ? (
            <Card backgroundColor="$accent" paddingHorizontal="$2" paddingVertical="$1">
              <Text fontSize="$1" color="$accentText" fontWeight="700">
                🌱 YENİ
              </Text>
            </Card>
          ) : (
            <Card backgroundColor="$warning" paddingHorizontal="$2" paddingVertical="$1">
              <Text fontSize="$1" color="$primaryText" fontWeight="700">
                🔄 TEKRAR
              </Text>
            </Card>
          )}
        </XStack>

        {/* Card */}
        <Card padding="$5" backgroundColor="$surface" bordered minHeight={300}>
          <YStack gap="$4" alignItems="center" justifyContent="center" flex={1}>
            <Text fontSize="$2" color="$textSecondary" textTransform="uppercase">
              {term.category} · {term.pronunciation}
            </Text>
            <H2 color="$text" textAlign="center">
              {term.term}
            </H2>

            {showAnswer && (
              <YStack gap="$3" alignItems="center" width="100%">
                <Text fontSize="$5" fontWeight="600" color="$primary" textAlign="center">
                  {term.termTr}
                </Text>
                <Paragraph color="$textSecondary" textAlign="center">
                  {term.definitionTr}
                </Paragraph>
                {term.examples[0] && (
                  <Card padding="$3" backgroundColor="$backgroundHover" width="100%">
                    <YStack gap="$1">
                      <Text fontStyle="italic" color="$text">
                        {term.examples[0].en}
                      </Text>
                      <Text fontSize="$3" color="$textSecondary">
                        {term.examples[0].tr}
                      </Text>
                    </YStack>
                  </Card>
                )}
              </YStack>
            )}
          </YStack>
        </Card>

        {!showAnswer ? (
          <Button
            size="$5"
            backgroundColor="$primary"
            color="$primaryText"
            onPress={() => setShowAnswer(true)}
          >
            Cevabı göster 👀
          </Button>
        ) : (
          <YStack gap="$2">
            <Text fontSize="$3" color="$textSecondary" textAlign="center">
              Bu terim ne kadar zordu?
            </Text>
            <XStack gap="$2">
              {QUALITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  flex={1}
                  size="$4"
                  backgroundColor={opt.color}
                  color="$primaryText"
                  onPress={() => handleQuality(opt.value)}
                >
                  <YStack alignItems="center" gap="$1">
                    <Text fontSize={20}>{opt.emoji}</Text>
                    <Text fontSize="$2" color="$primaryText">
                      {opt.label}
                    </Text>
                  </YStack>
                </Button>
              ))}
            </XStack>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
