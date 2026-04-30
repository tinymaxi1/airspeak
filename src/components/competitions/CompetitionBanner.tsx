/**
 * Ana ekrana eklenebilir küçük yarışma banner'ı.
 *
 * Aktif yarışma varsa en yenisini gösterir, tap → /competitions.
 */
import { TouchableOpacity, View, Text } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { FONTS, Mono, Body } from '@/components/airspeak';
import { useActiveCompetitions } from '@/features/competitions/api';

const THEME_COLORS: Record<string, string> = {
  icao_focus: '#1F4FB6',
  phraseology: '#7C5CFF',
  vocabulary_blast: '#E63946',
  maintenance: '#5A6478',
  cabin_safety: '#1F8B4D',
  seasonal: '#F2C14E',
  company_event: '#0F1E47',
  other: '#8A93A6',
};

function timeLeft(endIso: string): string {
  const ms = new Date(endIso).getTime() - Date.now();
  if (ms <= 0) return 'Sona erdi';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} gün kaldı`;
  const hours = Math.floor(ms / 3_600_000);
  return `${hours} saat kaldı`;
}

export function CompetitionBanner() {
  const { rows } = useActiveCompetitions();
  if (rows.length === 0) return null;
  // Aktif olan + en yakın bitenler önce
  const active = rows.find((r) => r.status === 'active') ?? rows[0]!;
  const accent = THEME_COLORS[active.theme] ?? '#0F1E47';

  return (
    <Animated.View entering={FadeIn.duration(360)}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/competitions/${active.slug}`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: accent,
          borderRadius: 14,
          padding: 14,
          shadowColor: accent,
          shadowOpacity: 0.25,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ fontSize: 28 }}>{active.icon_emoji}</Text>
        <View style={{ flex: 1 }}>
          <Mono style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.4, fontFamily: FONTS.mono700 }}>
            {active.status === 'active' ? '🟢 AKTİF YARIŞMA' : 'YAKINDA'}
          </Mono>
          <Text
            style={{
              fontFamily: FONTS.body700,
              fontSize: 14,
              color: '#FFFFFF',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {active.name_tr ?? active.name}
          </Text>
          <Body color="rgba(255,255,255,0.85)" style={{ fontSize: 11, marginTop: 1 }}>
            {timeLeft(active.end_date)}
          </Body>
        </View>
        <ChevronRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}
