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
import { ScrollView, View, Text, RefreshControl } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Body,
  Eyebrow,
  Mono,
  FONTS,
  Avatar,
  CoachMark,
  EmptyState,
} from '@/components/airspeak';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { useCoachMarkStore } from '@/stores/coachMarkStore';
import {
  buildLeaderboard,
  getTierForXp,
  getTierName,
  getHoursUntilWeekEnd,
  getWeekStartTimestamp,
  type LeaguePlayer,
} from '@/features/league/simulator';

const TIER_SHORTS = ['CADET', 'FO', 'SR FO', 'CAPT', 'SR CP', 'CHK', 'STAR'];

export default function LeagueScreen() {
  const { t } = useTranslation();
  const totalXp = useGamificationStore((s) => s.totalXp);
  const user = useAuthStore((s) => s.user);
  const coachSeen = useCoachMarkStore((s) => s.isSeen('league_first_open'));
  const markCoachSeen = useCoachMarkStore((s) => s.markSeen);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const userTier = getTierForXp(totalXp);
  const tierNameLocal = getTierName(userTier);
  const hoursLeft = getHoursUntilWeekEnd();

  // Bu hafta kazanılan XP — basitleştirme: totalXp'in 1/4'ü (yaklaşık 1 hafta).
  // Daha doğrusu için weekStart'tan beri kazanılan XP'i tutacak ayrı state gerekir.
  const userWeekXp = Math.round(totalXp * 0.25);
  const userName = user?.email?.split('@')[0]?.toUpperCase() ?? 'YOU';

  const leaderboard = useMemo<LeaguePlayer[]>(
    () =>
      buildLeaderboard(
        userWeekXp,
        userName,
        '🇹🇷',
        userTier,
      ),
    // userWeekXp değiştikçe leaderboard yeniden hesaplanır
    [userWeekXp, userName, userTier],
  );

  // Top 7 leaderboard'da göster
  const PLAYERS = leaderboard.slice(0, 7);
  const TIERS = TIER_SHORTS.map((short, i) => ({
    name: getTierName(i),
    short,
    current: i === userTier,
  }));
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
                  {t('screens.league.tierDynamic', 'TIER {{n}} / 7', { n: userTier + 1 })}
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
                  {tierNameLocal}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: '#0A1430',
                    marginTop: 2,
                  }}
                >
                  {t('screens.league.tierSubtitleDynamic', 'İlk 10 ilerleyecek · {{h}}sa kaldı', { h: hoursLeft })}
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

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F2C14E"
            colors={['#F2C14E']}
          />
        }
      >
        {totalXp === 0 && (
          <View style={{ padding: 16 }}>
            <EmptyState
              icon="🏁"
              message={t(
                'screens.league.zeroXpEmpty',
                'XP kazanmak için ilk dersi tamamla. Lig haftada bir sıfırlanır.',
              )}
            />
          </View>
        )}
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

        {/* NPC simulator disclaimer — gerçek kullanıcılarla yarış değil */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: 'rgba(255,213,107,0.18)',
            borderWidth: 1,
            borderColor: 'rgba(242,193,78,0.6)',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            gap: 8,
          }}
          accessibilityRole="alert"
        >
          <Text style={{ fontSize: 16 }}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: '#7A5400', letterSpacing: 0.9 }}>
              {t('screens.league.demoEyebrow', 'DEMO LİG')}
            </Mono>
            <Body color="#5A4500" style={{ fontSize: 12, marginTop: 2, lineHeight: 17 }}>
              {t(
                'screens.league.demoBody',
                'Rakipler simulator NPC. Gerçek kullanıcılarla yarış Yıl 1 sonu açılır.',
              )}
            </Body>
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

      {!coachSeen && (
        <CoachMark
          text="Ligde her hafta XP topla, 7 tier yüksel. Yıl 1 sonu gerçek kullanıcılarla yarışacaksın."
          onDismiss={() => markCoachSeen('league_first_open')}
          ctaLabel="Anladım ✈"
        />
      )}
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
