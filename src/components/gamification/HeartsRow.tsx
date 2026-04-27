import { useEffect } from 'react';
import { XStack, Text } from 'tamagui';
import { useGamificationStore } from '@/stores/gamificationStore';

export function HeartsRow() {
  const hearts = useGamificationStore((s) => s.hearts);
  const max = useGamificationStore((s) => s.maxHearts);
  const refillHearts = useGamificationStore((s) => s.refillHearts);

  useEffect(() => {
    refillHearts();
    const interval = setInterval(refillHearts, 60_000);
    return () => clearInterval(interval);
  }, [refillHearts]);

  return (
    <XStack gap="$1" alignItems="center">
      {Array.from({ length: max }).map((_, i) => (
        <Text key={i} fontSize="$5">
          {i < hearts ? '❤️' : '🤍'}
        </Text>
      ))}
    </XStack>
  );
}
