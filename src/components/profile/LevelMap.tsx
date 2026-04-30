/**
 * LevelMap — XP progress bar + milestone marker'ları.
 *
 * Bir sonraki level'a kalan XP gösterilir. Her 10. level milestone (büyük marker).
 * Reanimated entry animasyonu — bar dolma efekti.
 */
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { FONTS, Mono } from '@/components/airspeak';

export function LevelMap({
  level,
  xpInLevel,
  xpToNextLevel,
}: {
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
}) {
  const progress = xpToNextLevel > 0 ? Math.min(1, xpInLevel / xpToNextLevel) : 1;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  const remaining = Math.max(0, xpToNextLevel - xpInLevel);
  const nextLevel = level + 1;
  const isMilestoneNext = nextLevel % 10 === 0;

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EDEFF3',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <View>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.4 }}>
            UÇUŞ SEVİYESİ
          </Mono>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 32,
                fontWeight: '700',
                color: '#0F1E47',
                letterSpacing: -0.64,
              }}
            >
              {level}
            </Text>
            {isMilestoneNext && (
              <Text style={{ fontSize: 12, color: '#F2C14E', fontWeight: '700' }}>
                ★ MİLAT
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 1.4 }}>
            {nextLevel}'E
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 14,
              color: '#0F1E47',
              marginTop: 2,
            }}
          >
            {remaining.toLocaleString()} XP
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 10,
          backgroundColor: '#EDEFF3',
          borderRadius: 5,
          marginTop: 14,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: '#E63946',
              borderRadius: 5,
            },
            fillStyle,
          ]}
        />
      </View>

      {/* Milestone marker — bar altı */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9 }}>
          {xpInLevel} / {xpToNextLevel} XP
        </Mono>
        <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.9 }}>
          %{Math.round(progress * 100)}
        </Mono>
      </View>
    </View>
  );
}
