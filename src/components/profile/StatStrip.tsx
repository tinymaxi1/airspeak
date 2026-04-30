/**
 * StatStrip — 3 hücre: XP / Streak / Rozet sayısı.
 *
 * Reanimated FadeInUp (stagger) + count-up animation.
 */
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FONTS, Mono } from '@/components/airspeak';

interface CellProps {
  label: string;
  value: number | string;
  accent: string;
  delay: number;
  countUp?: boolean;
}

function StatCell({ label, value, accent, delay, countUp }: CellProps) {
  const isNumeric = typeof value === 'number';
  const target = isNumeric ? (value as number) : 0;
  const [display, setDisplay] = useState(countUp && isNumeric ? 0 : value);

  useEffect(() => {
    if (!countUp || !isNumeric) {
      setDisplay(value);
      return;
    }
    if (target === 0) {
      setDisplay(0);
      return;
    }
    const duration = 600;
    const steps = 30;
    const stepMs = duration / steps;
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      const v = Math.round((target * current) / steps);
      setDisplay(v);
      if (current >= steps) {
        clearInterval(id);
        setDisplay(target);
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [target, countUp, isNumeric, value]);

  const shown = typeof display === 'number' ? display.toLocaleString() : String(display);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(450)}
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#EDEFF3',
        shadowColor: '#0A1430',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 1.4 }}>
        {label.toUpperCase()}
      </Mono>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          fontWeight: '700',
          color: accent,
          letterSpacing: -0.44,
          marginTop: 4,
        }}
      >
        {shown}
      </Text>
    </Animated.View>
  );
}

export function StatStrip({
  totalXp,
  currentStreak,
  badgeCount,
}: {
  totalXp: number;
  currentStreak: number;
  badgeCount: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <StatCell label="XP" value={totalXp} accent="#E63946" delay={0} countUp />
      <StatCell label="Streak" value={`${currentStreak}d`} accent="#FF7847" delay={80} />
      <StatCell label="Rozet" value={badgeCount} accent="#2DBE6C" delay={160} countUp />
    </View>
  );
}
