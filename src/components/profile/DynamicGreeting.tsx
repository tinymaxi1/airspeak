/**
 * DynamicGreeting — saatlik karşılama + streak chip.
 *
 * 06-12  → Günaydın
 * 12-18  → İyi günler
 * 18-22  → İyi akşamlar
 * 22-06  → İyi geceler
 *
 * currentStreak >= 3 ise streak chip eklenir.
 */
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Mono, FONTS } from '@/components/airspeak';

function partOfDay(hour: number): { label: string; emoji: string } {
  if (hour >= 6 && hour < 12) return { label: 'Günaydın', emoji: '☀️' };
  if (hour >= 12 && hour < 18) return { label: 'İyi günler', emoji: '🌤' };
  if (hour >= 18 && hour < 22) return { label: 'İyi akşamlar', emoji: '🌅' };
  return { label: 'İyi geceler', emoji: '🌙' };
}

export function DynamicGreeting({
  name,
  streak,
}: {
  name: string;
  streak: number;
}) {
  const now = new Date();
  const { label, emoji } = partOfDay(now.getHours());

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      <Mono style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.4 }}>
        {emoji} {label.toUpperCase()}
      </Mono>
      {streak >= 3 && (
        <View
          style={{
            backgroundColor: 'rgba(255,120,71,0.18)',
            borderColor: 'rgba(255,120,71,0.6)',
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <Text style={{ fontFamily: FONTS.mono700, fontSize: 10, color: '#FF7847' }}>
            🔥 {streak} GÜN
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
