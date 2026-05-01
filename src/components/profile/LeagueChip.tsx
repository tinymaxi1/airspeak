/**
 * Lig rozeti chip — Hero altında, profil sayfasında.
 * Tap → /league
 */
import { TouchableOpacity, View, Text } from 'react-native';
import { router } from 'expo-router';
import { FONTS, Mono } from '@/components/airspeak';
import type { LeagueClass } from '@/features/league/api';

const CLASS_META: Record<LeagueClass, { label: string; emoji: string; color: string }> = {
  bronze: { label: 'Bronz', emoji: '🥉', color: '#A87654' },
  silver: { label: 'Gümüş', emoji: '🥈', color: '#9AA0AB' },
  gold: { label: 'Altın', emoji: '🥇', color: '#E0A82E' },
  sapphire: { label: 'Safir', emoji: '💙', color: '#1F4FB6' },
  ruby: { label: 'Yakut', emoji: '❤️', color: '#B81F3D' },
  emerald: { label: 'Zümrüt', emoji: '💚', color: '#1F8B4D' },
  diamond: { label: 'Elmas', emoji: '💎', color: '#1F8AB6' },
};

export function LeagueChip({
  classTier,
  rank,
}: {
  classTier: LeagueClass;
  rank: number | null;
}) {
  const meta = CLASS_META[classTier];
  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/league')}
      activeOpacity={0.85}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: meta.color,
      }}
    >
      <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
      <Mono
        style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: 1, fontFamily: FONTS.mono700 }}
      >
        {meta.label.toUpperCase()}
      </Mono>
      {rank != null && (
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 1,
            borderRadius: 4,
            backgroundColor: meta.color,
          }}
        >
          <Mono style={{ fontSize: 10, color: '#FFFFFF', fontFamily: FONTS.mono700 }}>
            #{rank}
          </Mono>
        </View>
      )}
    </TouchableOpacity>
  );
}
