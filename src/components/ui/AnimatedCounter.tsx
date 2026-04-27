/**
 * Animated number counter — XP/coin değişiminde count-up animasyonu.
 */
import { useEffect, useRef, useState } from 'react';
import { Text } from 'tamagui';

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: any;
  fontWeight?: any;
  color?: string;
}

export function AnimatedCounter({
  value,
  durationMs = 800,
  prefix = '',
  suffix = '',
  fontSize = '$5',
  fontWeight = '700',
  color = '$text',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (display === value) return;

    startRef.current = display;
    startTimeRef.current = Date.now();
    const target = value;
    const start = startRef.current;
    const totalChange = target - start;

    let raf: number;
    const tick = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + totalChange * eased);
      setDisplay(current);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <Text fontSize={fontSize} fontWeight={fontWeight} color={color as any}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}
