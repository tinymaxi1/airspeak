/**
 * Profile Şampiyonluklar bölümü.
 * Vitrin: en son 3 şampiyonluk + "Tümünü gör" link.
 * Kullanıcının championship'i yoksa bölüm gizli.
 */
import { TouchableOpacity, View, Text } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Trophy, Crown, Star, ArrowRight } from 'lucide-react-native';
import { Body, Eyebrow, FONTS, Mono } from '@/components/airspeak';
import type {
  ChampionshipRow,
  ChampionshipType,
} from '@/features/league/championships';

const TYPE_META: Record<
  ChampionshipType,
  { icon: any; color: string; label: string }
> = {
  weekly: { icon: Trophy, color: '#F2C14E', label: 'Haftalık' },
  monthly: { icon: Crown, color: '#7C5CFF', label: 'Aylık' },
  yearly: { icon: Star, color: '#E0A82E', label: 'Yıllık' },
};

const MONTHS_TR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

function fmtPeriod(c: ChampionshipRow): string {
  if (c.championship_type === 'weekly') {
    return `${c.year} W${c.period_number}`;
  }
  if (c.championship_type === 'monthly') {
    return `${MONTHS_TR[c.period_number - 1] ?? c.period_number} ${c.year}`;
  }
  return String(c.year);
}

export function ChampionshipsSection({ rows }: { rows: ChampionshipRow[] }) {
  if (rows.length === 0) return null;
  const preview = rows.slice(0, 3);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Eyebrow>Şampiyonluklar</Eyebrow>
        {rows.length > 3 && (
          <TouchableOpacity
            onPress={() => router.push('/profile/championships')}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1.2, fontFamily: FONTS.mono700 }}>
              TÜMÜNÜ GÖR ({rows.length})
            </Mono>
            <ArrowRight size={12} color="#E63946" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {preview.map((c, i) => {
          const meta = TYPE_META[c.championship_type];
          const Icon = meta.icon;
          return (
            <Animated.View
              key={c.id}
              entering={FadeInUp.delay(i * 60).duration(280)}
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 2,
                borderColor: meta.color,
                padding: 12,
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon size={24} color={meta.color} />
              <Mono
                style={{
                  fontSize: 9,
                  color: meta.color,
                  letterSpacing: 1.1,
                  fontFamily: FONTS.mono700,
                  marginTop: 2,
                }}
              >
                {meta.label.toUpperCase()}
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 12,
                  color: '#0E1116',
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {fmtPeriod(c)}
              </Text>
              {(c.role || c.level_tier) && (
                <Body color="#5A6478" style={{ fontSize: 10, textAlign: 'center' }}>
                  {[c.role, c.level_tier].filter(Boolean).join(' · ')}
                </Body>
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
