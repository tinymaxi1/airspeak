import { useEffect } from 'react';
import { YStack, XStack, Card, Text, Progress, Button } from 'tamagui';
import { useQuestsStore } from '@/stores/questsStore';
import { useGamificationStore } from '@/stores/gamificationStore';

export function DailyQuests() {
  const generateForToday = useQuestsStore((s) => s.generateForToday);
  const quests = useQuestsStore((s) => s.quests);
  const claim = useQuestsStore((s) => s.claim);
  const addCoins = useGamificationStore((s) => s.addCoins);
  const addXp = useGamificationStore((s) => s.addXp);

  useEffect(() => {
    generateForToday();
  }, [generateForToday]);

  const handleClaim = (questId: string) => {
    const claimed = claim(questId);
    if (!claimed) return;
    addXp(claimed.xpReward, `quest_${claimed.id}`);
    addCoins(claimed.coinReward, `quest_${claimed.id}`);
  };

  if (quests.length === 0) return null;

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="700" color="$text">
          Bugünün görevleri
        </Text>
        <Text fontSize="$2" color="$textSecondary">
          {quests.filter((q) => q.claimed).length} / {quests.length}
        </Text>
      </XStack>
      {quests.map((q) => {
        const percent = Math.min(100, Math.round((q.currentValue / q.targetValue) * 100));
        const isReady = q.currentValue >= q.targetValue && !q.claimed;
        const isDone = q.claimed;

        return (
          <Card
            key={q.id}
            padding="$3"
            backgroundColor={isDone ? '$successSubtle' : '$surface'}
            bordered
            borderColor={isDone ? '$success' : isReady ? '$warning' : '$border'}
            opacity={isDone ? 0.7 : 1}
          >
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Text fontSize="$5">{q.emoji}</Text>
                <YStack flex={1}>
                  <Text
                    fontSize="$4"
                    fontWeight="500"
                    color={isDone ? '$success' : '$text'}
                    textDecorationLine={isDone ? 'line-through' : 'none'}
                  >
                    {q.titleTr}
                  </Text>
                  <Text fontSize="$2" color="$textSecondary">
                    +{q.xpReward} XP · +{q.coinReward} 🪙
                  </Text>
                </YStack>
                {isReady && (
                  <Button
                    size="$2"
                    backgroundColor="$warning"
                    color="$primaryText"
                    onPress={() => handleClaim(q.id)}
                  >
                    Al!
                  </Button>
                )}
              </XStack>
              <Progress value={percent} max={100} backgroundColor="$border" height="$0.5">
                <Progress.Indicator
                  animation="lazy"
                  backgroundColor={isDone ? '$success' : '$primary'}
                />
              </Progress>
              <Text fontSize="$1" color="$textSecondary">
                {q.currentValue} / {q.targetValue}
              </Text>
            </YStack>
          </Card>
        );
      })}
    </YStack>
  );
}
