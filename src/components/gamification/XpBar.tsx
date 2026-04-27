import { YStack, XStack, Text, Progress } from 'tamagui';
import { useGamificationStore } from '@/stores/gamificationStore';

export function XpBar() {
  const level = useGamificationStore((s) => s.currentLevel);
  const xpInLevel = useGamificationStore((s) => s.xpInLevel);
  const xpToNext = useGamificationStore((s) => s.xpToNext);
  const totalXp = useGamificationStore((s) => s.totalXp);

  const percent = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack gap="$2" alignItems="center">
          <Text fontSize="$3" color="$textSecondary">
            Level
          </Text>
          <Text fontSize="$5" fontWeight="700" color="$primary">
            {level}
          </Text>
        </XStack>
        <Text fontSize="$3" color="$textSecondary">
          {xpInLevel} / {xpToNext} XP
        </Text>
      </XStack>
      <Progress value={percent} max={100} backgroundColor="$border" height="$1">
        <Progress.Indicator animation="lazy" backgroundColor="$accent" />
      </Progress>
      <Text fontSize="$1" color="$textSecondary">
        Toplam {totalXp} XP
      </Text>
    </YStack>
  );
}
