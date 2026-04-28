/**
 * League Screen — Captain tier leaderboard
 *
 * Tasarım birebir (screens-other.jsx LeagueScreen):
 * - Gold tier header (navy ink) + Crown icon + "Captain TIER 4 OF 7"
 * - 7-tier track bar (Cadet → Star Capt)
 * - Top 3 podium (gold/silver/bronze)
 * - Leaderboard rows with country flags + you highlight
 * - Safe zone divider
 */
import { ScrollView, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
} from '@/components/airspeak';

interface Player {
  rank: number;
  name: string;
  xp: number;
  country?: string;
  you?: boolean;
}

const PLAYERS: Player[] = [
  { rank: 1, name: 'Captain Sky', xp: 4820, country: '🇩🇪' },
  { rank: 2, name: 'M. Aydın', xp: 4205, country: '🇹🇷' },
  { rank: 3, name: 'José L.', xp: 3940, country: '🇪🇸' },
  { rank: 4, name: 'EK', xp: 3812, country: '🇹🇷', you: true },
  { rank: 5, name: 'flight_a01', xp: 3502, country: '🇮🇳' },
  { rank: 6, name: 'Nina V.', xp: 3210, country: '🇳🇱' },
  { rank: 7, name: 'Ahmed F.', xp: 2980, country: '🇪🇬' },
];

const TIERS = [
  { name: 'Cadet', short: 'CADET' },
  { name: 'First Officer', short: 'FO' },
  { name: 'Senior FO', short: 'SR FO' },
  { name: 'Captain', short: 'CAPT', current: true },
  { name: 'Senior Capt', short: 'SR CP' },
  { name: 'Check Capt', short: 'CHK' },
  { name: 'Star Capt', short: 'STAR' },
];

export default function LeagueScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <View style={{ backgroundColor: '#F2C14E' }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: '#0A1430',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 4,
                  borderBottomColor: '#000',
                }}
              >
                <Text style={{ fontSize: 36 }}>👑</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(10,20,48,0.7)' }}>
                  {t('screens.league.tier')}
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#0A1430',
                    letterSpacing: -0.56,
                    lineHeight: 28,
                  }}
                >
                  {t('screens.league.tierName')}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: '#0A1430',
                    marginTop: 2,
                  }}
                >
                  {t('screens.league.tierSubtitle')}
                </Text>
              </View>
            </View>

            {/* Tier track */}
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 14 }}>
              {TIERS.map((tier, i) => (
                <View key={tier.name} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      height: 8,
                      width: '100%',
                      backgroundColor: i <= 3 ? '#0A1430' : 'rgba(0,0,0,0.18)',
                      borderRadius: 4,
                    }}
                  />
                  <Mono
                    style={{
                      fontSize: 8,
                      color: tier.current ? '#0A1430' : 'rgba(0,0,0,0.4)',
                      marginTop: 4,
                      letterSpacing: 0.32,
                    }}
                  >
                    {tier.short}
                  </Mono>
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 16,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#DCE0E8',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', gap: 8 }}>
            <Podium rank={2} name="M. Aydın" xp="4,205" color="#B8BFCC" h={64} />
            <Podium rank={1} name="Captain Sky" xp="4,820" color="#F2C14E" h={88} crown />
            <Podium rank={3} name="José L." xp="3,940" color="#FF7847" h={48} />
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {PLAYERS.map((p) => (
            <View
              key={p.rank}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                marginBottom: 6,
                backgroundColor: p.you ? '#FFE4E7' : '#FFFFFF',
                borderRadius: 14,
                borderWidth: p.you ? 2 : 1.5,
                borderColor: p.you ? '#E63946' : '#DCE0E8',
              }}
            >
              <Mono
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: p.you ? '#E63946' : '#5A6478',
                  width: 24,
                }}
              >
                {p.rank}
              </Mono>
              <Avatar
                initials={p.name.split(' ')[0]?.[0] ?? '?'}
                color={p.you ? '#E63946' : '#0F1E47'}
                size={36}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                  {p.you ? `${t('screens.league.you')} · ${p.name}` : p.name}
                </Text>
                <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
                  {p.country} · {p.xp.toLocaleString()} XP
                </Mono>
              </View>
              {p.rank <= 3 && (
                <Text style={{ fontSize: 18 }}>{p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'}</Text>
              )}
            </View>
          ))}

          <View
            style={{
              marginTop: 12,
              padding: 8,
              borderTopWidth: 2,
              borderTopColor: '#2DBE6C',
              borderStyle: 'dashed',
              alignItems: 'center',
            }}
          >
            <Mono style={{ fontSize: 11, color: '#2DBE6C', letterSpacing: 1.1 }}>
              {t('screens.league.safeZone')}
            </Mono>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Podium({
  rank,
  name,
  xp,
  color,
  h,
  crown,
}: {
  rank: number;
  name: string;
  xp: string;
  color: string;
  h: number;
  crown?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      {crown && <Text style={{ fontSize: 24 }}>👑</Text>}
      <Avatar initials={name.split(' ')[0]?.[0] ?? '?'} color={color} size={48} />
      <Text
        style={{
          fontFamily: FONTS.body700,
          fontSize: 12,
          color: '#0E1116',
          textAlign: 'center',
        }}
      >
        {name}
      </Text>
      <Mono style={{ fontSize: 10, color: '#8A93A6' }}>{xp}</Mono>
      <View
        style={{
          width: '100%',
          height: h,
          backgroundColor: color,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Text style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: '700', color: '#0A1430' }}>
          {rank}
        </Text>
      </View>
    </View>
  );
}
