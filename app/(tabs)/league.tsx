/**
 * League Screen — DB-driven (Sprint 4B.3)
 *
 * Source of truth: league_seasons + league_groups + league_memberships.
 * NPC simulator silindi.
 *
 * - Üst: kullanıcının class rozeti (bronze..diamond)
 * - Süre sayacı: aktif weekly season.end_date'ten
 * - Leaderboard:
 *   · Top 10 — green (promotion zone, Diamond hariç)
 *   · Mid — normal
 *   · Bottom 10 — red (demotion zone, Bronze hariç)
 * - Boş state: lig'e atanmamış → "ilk dersini bitir"
 */
import { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Body, Eyebrow, Mono, FONTS, Avatar, Button3D } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import { showPaywall } from '@/stores/paywallStore';
import {
  useLeagueMembership,
  useLeagueGroup,
  type LeagueClass,
  type LeagueLeaderboardEntry,
} from '@/features/league/api';
import { supabase } from '@/lib/supabase';
import { ChevronRight } from 'lucide-react-native';

const CLASS_META: Record<
  LeagueClass,
  { label: string; emoji: string; color: string; ringColor: string }
> = {
  bronze: { label: 'Bronz', emoji: '🥉', color: '#A87654', ringColor: '#C68B5C' },
  silver: { label: 'Gümüş', emoji: '🥈', color: '#9AA0AB', ringColor: '#B7BCC6' },
  gold: { label: 'Altın', emoji: '🥇', color: '#E0A82E', ringColor: '#F2C14E' },
  sapphire: { label: 'Safir', emoji: '💙', color: '#1F4FB6', ringColor: '#3D6FD9' },
  ruby: { label: 'Yakut', emoji: '❤️', color: '#B81F3D', ringColor: '#D63A57' },
  emerald: { label: 'Zümrüt', emoji: '💚', color: '#1F8B4D', ringColor: '#3DAA68' },
  diamond: { label: 'Elmas', emoji: '💎', color: '#1F8AB6', ringColor: '#3DAFD6' },
};

const CLASS_ORDER: LeagueClass[] = [
  'bronze',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'emerald',
  'diamond',
];

function hoursUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 3_600_000));
}

export default function LeagueScreen() {
  const c = usePalette();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { membership, group, loading: lMem, refresh: refreshMem } = useLeagueMembership(user?.id);
  const { rows, loading: lGroup, refresh: refreshGroup } = useLeagueGroup(
    group?.id,
    user?.id,
  );

  const [seasonEnd, setSeasonEnd] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Aktif weekly season.end_date — süre sayacı için
  useEffect(() => {
    if (!group?.season_id) return;
    let mounted = true;
    void supabase
      .from('league_seasons')
      .select('end_date')
      .eq('id', group.season_id)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data) setSeasonEnd((data as any).end_date);
      });
    return () => {
      mounted = false;
    };
  }, [group?.season_id]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refreshMem(), refreshGroup()]);
    setRefreshing(false);
  }

  const classMeta = group?.class_tier ? CLASS_META[group.class_tier] : null;
  const totalMembers = rows.length;
  const userRow = rows.find((r) => r.is_self) ?? null;
  const myRank = userRow?.rank ?? null;

  // Lig top 3'te → "ödülünü 2× al" paywall (cooldown 7 gün, sadece 1× görünür)
  useEffect(() => {
    if (myRank != null && myRank <= 3) {
      const t = setTimeout(() => showPaywall('league_top3_celebration'), 1500);
      return () => clearTimeout(t);
    }
  }, [myRank]);

  // Empty state — kullanıcı henüz lige atanmamış
  if (!lMem && !membership) {
    return <EmptyLeague />;
  }

  if (lMem || !group || !classMeta) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  const hoursLeft = seasonEnd ? hoursUntil(`${seasonEnd}T23:59:59Z`) : null;
  const promoCutoff = group.class_tier === 'diamond' ? 0 : 10;
  const demoCutoff = group.class_tier === 'bronze' ? 0 : 10;
  const demoStartRank = totalMembers - demoCutoff + 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* ═════ HEADER ═════ */}
      <View style={{ backgroundColor: classMeta.color }}>
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0,0,0,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomWidth: 4,
                  borderBottomColor: 'rgba(0,0,0,0.35)',
                }}
              >
                <Text style={{ fontSize: 34 }}>{classMeta.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Mono style={{ fontSize: 10, letterSpacing: 1.8, color: 'rgba(255,255,255,0.85)' }}>
                  {classMeta.label.toUpperCase()} SINIFI
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 26,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: -0.5,
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {myRank != null ? `#${myRank}` : '—'} · {totalMembers} kişi
                </Text>
                {hoursLeft != null && (
                  <Text
                    style={{
                      fontFamily: FONTS.body700,
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.92)',
                      marginTop: 2,
                    }}
                  >
                    {hoursLeft > 24
                      ? `${Math.floor(hoursLeft / 24)} gün ${hoursLeft % 24} sa kaldı`
                      : `${hoursLeft} sa kaldı`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ═════ PERIOD NAV (Haftalık aktif, Aylık → /league/monthly) ═════ */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF3',
        }}
      >
        <View
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 3,
            borderBottomColor: '#E63946',
          }}
        >
          <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#E63946' }}>
            Haftalık
          </Text>
        </View>
        <PeriodTabLink label="Aylık" route="/league/monthly" />
        <PeriodTabLink label="Yıllık" route="/league/yearly" />
        <PeriodTabLink label="Yarışmalar" route="/competitions" />
      </View>

      {/* ═════ CLASS LADDER ═════ */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDEFF3' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {CLASS_ORDER.map((c) => {
            const isCurrent = c === group.class_tier;
            const meta = CLASS_META[c];
            return (
              <View key={c} style={{ alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: isCurrent ? meta.color : '#F4F2EC',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isCurrent ? 1 : 0.6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                </View>
                <Mono
                  style={{
                    fontSize: 8,
                    color: isCurrent ? meta.color : '#8A93A6',
                    letterSpacing: 0.6,
                    marginTop: 4,
                    fontFamily: FONTS.mono700,
                  }}
                >
                  {meta.label.toUpperCase().slice(0, 5)}
                </Mono>
              </View>
            );
          })}
        </View>
      </View>

      {/* ═════ LEADERBOARD ═════ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Eyebrow>Sıralama</Eyebrow>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>
            {totalMembers} kişi
          </Mono>
        </View>

        {lGroup && rows.length === 0 ? (
          <ActivityIndicator color="#E63946" style={{ marginTop: 24 }} />
        ) : (
          rows.map((r, idx) => (
            <LeaderboardRow
              key={r.membership_id}
              entry={r}
              isPromotionZone={promoCutoff > 0 && (r.rank ?? idx + 1) <= promoCutoff}
              isDemotionZone={demoCutoff > 0 && (r.rank ?? idx + 1) >= demoStartRank}
              animDelay={idx * 30}
            />
          ))
        )}

        {/* Promotion / demotion zone divider'ları görsel olarak satırlarda — alt notu */}
        <View style={{ marginTop: 16, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#EDEFF3' }}>
          <Body color="#5A6478" style={{ fontSize: 12, lineHeight: 18 }}>
            Hafta sonunda <Text style={{ fontFamily: FONTS.body700, color: '#118040' }}>top 10 yükselir</Text>
            {group.class_tier !== 'bronze' && (
              <>
                ,{' '}
                <Text style={{ fontFamily: FONTS.body700, color: '#E63946' }}>son 10 düşer</Text>
              </>
            )}
            . Top 3'e coin + birinciye haftalık şampiyon rozeti.
          </Body>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Period tab link ──────────────────────────────────────────────────────
function PeriodTabLink({
  label,
  route,
  disabled,
}: {
  label: string;
  route: string;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && router.push(route as any)}
      activeOpacity={0.85}
      disabled={disabled}
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#5A6478' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────
function EmptyLeague() {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: 32 }}>
      <View style={{ alignItems: 'center', gap: 14 }}>
        <Text style={{ fontSize: 64 }}>🏁</Text>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: '700',
            color: '#0F1E47',
            textAlign: 'center',
          }}
        >
          Lige hoş geldin
        </Text>
        <Body color="#5A6478" style={{ fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
          İlk dersini tamamla — sistem seni rolüne ve seviyene uygun bir Bronz grubuna
          yerleştirir. Haftalık yarış başlar.
        </Body>
        <View style={{ marginTop: 12, width: 220 }}>
          <Button3D
            variant="primary"
            fullWidth
            onPress={() => router.push('/(tabs)/learn')}
          >
            İlk dersine başla
          </Button3D>
        </View>
      </View>
    </View>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────
function LeaderboardRow({
  entry,
  isPromotionZone,
  isDemotionZone,
  animDelay,
}: {
  entry: LeagueLeaderboardEntry;
  isPromotionZone: boolean;
  isDemotionZone: boolean;
  animDelay: number;
}) {
  const initials = (entry.full_name ?? entry.username ?? 'PI').slice(0, 2).toUpperCase();
  const displayName = entry.full_name ?? entry.username ?? 'Pilot';

  const bg = entry.is_self
    ? '#FFF1F2'
    : isPromotionZone
      ? '#F0FBF3'
      : isDemotionZone
        ? '#FFF5F5'
        : '#FFFFFF';

  const borderColor = entry.is_self
    ? '#E63946'
    : isPromotionZone
      ? '#9CE0B0'
      : isDemotionZone
        ? '#F4B4B4'
        : '#EDEFF3';

  const rankColor = isPromotionZone
    ? '#118040'
    : isDemotionZone
      ? '#B81F3D'
      : '#5A6478';

  return (
    <Animated.View
      entering={FadeInUp.delay(animDelay).duration(280)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        marginBottom: 8,
        backgroundColor: bg,
        borderRadius: 12,
        borderWidth: entry.is_self ? 2 : 1,
        borderColor,
      }}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 16,
            fontWeight: '700',
            color: rankColor,
          }}
        >
          {entry.rank ?? '—'}
        </Text>
      </View>
      <Avatar initials={initials} imageUrl={entry.avatar_url} size={36} color="#0F1E47" />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 14,
            color: entry.is_self ? '#E63946' : '#0E1116',
          }}
          numberOfLines={1}
        >
          {entry.is_self ? `${displayName} (sen)` : displayName}
        </Text>
        <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 1 }}>
          {entry.week_xp.toLocaleString('tr-TR')} XP
        </Mono>
      </View>
      {(isPromotionZone || isDemotionZone) && (
        <Mono
          style={{
            fontSize: 9,
            color: rankColor,
            letterSpacing: 1,
            fontFamily: FONTS.mono700,
          }}
        >
          {isPromotionZone ? '↑ TERFİ' : '↓ DÜŞÜŞ'}
        </Mono>
      )}
    </Animated.View>
  );
}
