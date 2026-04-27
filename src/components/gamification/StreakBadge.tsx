import { XStack, Text } from 'tamagui';
import { useGamificationStore } from '@/stores/gamificationStore';

export function StreakBadge({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const streak = useGamificationStore((s) => s.currentStreak);

  const fontSize = size === 'sm' ? '$3' : size === 'md' ? '$5' : '$7';
  const emoji = streak >= 30 ? '🔥' : streak >= 7 ? '🔥' : streak >= 1 ? '✨' : '💤';

  return (
    <XStack alignItems="center" gap="$1">
      <Text fontSize={fontSize}>{emoji}</Text>
      <Text fontSize={fontSize} fontWeight="700" color="$warning">
        {streak}
      </Text>
    </XStack>
  );
}
