/**
 * Celebration overlay — büyük başarımlarda gösterilir.
 * Reanimated ile scale + opacity animasyonu.
 *
 * Sprint 3'te lottie-react-native eklenince konfeti animasyonu eklenecek.
 */
import { useEffect } from 'react';
import { YStack, Text } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface CelebrationOverlayProps {
  emoji: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  onComplete?: () => void;
}

export function CelebrationOverlay({
  emoji,
  title,
  subtitle,
  visible,
  onComplete,
}: CelebrationOverlayProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 8, stiffness: 120 });
      emojiScale.value = withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 6 }),
      );
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        if (onComplete) {
          setTimeout(onComplete, 350);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      emojiScale.value = 0;
    }
    return undefined;
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
        },
        containerStyle,
      ]}
    >
      <YStack alignItems="center" gap="$3" padding="$5">
        <Animated.View style={emojiStyle}>
          <Text fontSize={120}>{emoji}</Text>
        </Animated.View>
        <Text fontSize="$8" fontWeight="700" color="white" textAlign="center">
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="$5" color="white" textAlign="center" opacity={0.9}>
            {subtitle}
          </Text>
        )}
      </YStack>
    </Animated.View>
  );
}
