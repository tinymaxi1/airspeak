import { XStack, Text } from 'tamagui';
import { useGamificationStore } from '@/stores/gamificationStore';

export function CoinsBadge() {
  const coins = useGamificationStore((s) => s.coins);

  return (
    <XStack gap="$1" alignItems="center">
      <Text fontSize="$5">🪙</Text>
      <Text fontSize="$5" fontWeight="700" color="$warning">
        {coins}
      </Text>
    </XStack>
  );
}
