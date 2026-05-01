/**
 * Aylık Lig — Bu Ay / Geçen Ay / Tüm Zamanlar.
 *
 * Sprint 4C ekranı.
 */
import { useMemo, useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Crown } from 'lucide-react-native';
import { Body, Mono, FONTS, Avatar } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import {
  useMonthlyChampions,
  type ChampionWithProfile,
} from '@/features/league/championships';

type TabKey = 'current' | 'previous' | 'allTime';

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

interface CurrentRow {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  month_xp: number;
  rank: number;
}

async function fetchCurrentMonthLeaderboard(): Promise<CurrentRow[]> {
  const { data, error } = await supabase
    .from('user_xp_summary')
    .select('user_id, month_xp, profiles!inner(username, full_name, avatar_url)')
    .gt('month_xp', 0)
    .order('month_xp', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as any[]).map((r, idx) => ({
    user_id: r.user_id,
    username: r.profiles?.username ?? null,
    full_name: r.profiles?.full_name ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
    month_xp: r.month_xp,
    rank: idx + 1,
  }));
}

function daysUntilMonthEnd(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export default function MonthlyLeagueScreen() {
  const c = usePalette();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabKey>('current');

  const today = new Date();
  const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#7C5CFF' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#7C5CFF',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Crown size={26} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.4 }}>
              AYLIK LİG
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
            >
              Şampiyonlar
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Tab */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDEFF3' }}>
        {(
          [
            { key: 'current' as TabKey, label: 'Bu Ay' },
            { key: 'previous' as TabKey, label: 'Geçen Ay' },
            { key: 'allTime' as TabKey, label: 'Tüm Zamanlar' },
          ]
        ).map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.85}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderBottomWidth: 3,
                borderBottomColor: active ? '#7C5CFF' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: active ? '#7C5CFF' : '#5A6478',
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === 'current' && <CurrentMonthTab selfUserId={user?.id ?? null} />}
      {tab === 'previous' && (
        <PreviousMonthTab year={prevDate.getFullYear()} month={prevDate.getMonth() + 1} />
      )}
      {tab === 'allTime' && <AllTimeTab />}
    </View>
  );
}

// ─── Bu Ay ─────────────────────────────────────────────────────────────────
function CurrentMonthTab({ selfUserId }: { selfUserId: string | null }) {
  const [rows, setRows] = useState<CurrentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchCurrentMonthLeaderboard().then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const days = daysUntilMonthEnd();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          padding: 12,
          backgroundColor: '#7C5CFF15',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Mono style={{ fontSize: 10, color: '#7C5CFF', letterSpacing: 1.2 }}>
          AY SONUNA
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: '700',
            color: '#0F1E47',
            marginTop: 2,
          }}
        >
          {days} gün kaldı
        </Text>
        <Body color="#5A6478" style={{ fontSize: 12, marginTop: 4 }}>
          1.: 2000 coin + Ayın Birincisi rozeti · 2.: 1000 · 3.: 500 · 4-10: 200
        </Body>
      </View>

      {loading ? (
        <ActivityIndicator color="#7C5CFF" style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          Bu ay henüz kimse XP kazanmadı.
        </Body>
      ) : (
        rows.map((r, i) => (
          <LeaderRow
            key={r.user_id}
            rank={r.rank}
            displayName={r.full_name ?? r.username ?? 'Pilot'}
            avatarUrl={r.avatar_url}
            xp={r.month_xp}
            isSelf={r.user_id === selfUserId}
            delay={i * 30}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Geçen Ay ──────────────────────────────────────────────────────────────
function PreviousMonthTab({ year, month }: { year: number; month: number }) {
  const { rows, loading } = useMonthlyChampions(year, month);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          padding: 12,
          backgroundColor: '#7C5CFF15',
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Mono style={{ fontSize: 10, color: '#7C5CFF', letterSpacing: 1.2 }}>
          {(MONTHS_TR[month - 1] ?? '').toUpperCase()} {year}
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 18,
            fontWeight: '700',
            color: '#0F1E47',
            marginTop: 2,
          }}
        >
          Resmi Şampiyonlar
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7C5CFF" style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          Geçen ay için şampiyon kaydı yok.
        </Body>
      ) : (
        rows.map((c, i) => <ChampionRow champ={c} delay={i * 40} key={c.id} />)
      )}
    </ScrollView>
  );
}

// ─── Tüm Zamanlar (hall of fame) ──────────────────────────────────────────
function AllTimeTab() {
  const [rows, setRows] = useState<ChampionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase
      .from('championships')
      .select(
        'id, championship_type, year, period_number, role, level_tier, user_id, snapshot_xp, awarded_at, profiles!inner(username, full_name, avatar_url)',
      )
      .eq('championship_type', 'monthly')
      .order('awarded_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (!mounted) return;
        const mapped = ((data as any[]) ?? []).map((r) => ({
          id: r.id,
          championship_type: r.championship_type,
          year: r.year,
          period_number: r.period_number,
          role: r.role,
          level_tier: r.level_tier,
          user_id: r.user_id,
          snapshot_xp: r.snapshot_xp,
          awarded_at: r.awarded_at,
          username: r.profiles?.username ?? null,
          full_name: r.profiles?.full_name ?? null,
          avatar_url: r.profiles?.avatar_url ?? null,
        }));
        setRows(mapped);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {loading ? (
        <ActivityIndicator color="#7C5CFF" style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          Henüz aylık şampiyon yok.
        </Body>
      ) : (
        rows.map((c, i) => <ChampionRow champ={c} delay={i * 25} key={c.id} />)
      )}
    </ScrollView>
  );
}

// ─── Reusable rows ────────────────────────────────────────────────────────
function LeaderRow({
  rank,
  displayName,
  avatarUrl,
  xp,
  isSelf,
  delay,
}: {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  isSelf: boolean;
  delay: number;
}) {
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(280)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        marginBottom: 8,
        backgroundColor: isSelf ? '#FFF1F2' : '#FFFFFF',
        borderRadius: 12,
        borderWidth: isSelf ? 2 : 1,
        borderColor: isSelf ? '#E63946' : '#EDEFF3',
      }}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 16,
            fontWeight: '700',
            color: rank <= 3 ? '#7C5CFF' : '#5A6478',
          }}
        >
          {rank}
        </Text>
      </View>
      <Avatar initials={initials} imageUrl={avatarUrl} size={36} color="#0F1E47" />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 14,
            color: isSelf ? '#E63946' : '#0E1116',
          }}
          numberOfLines={1}
        >
          {isSelf ? `${displayName} (sen)` : displayName}
        </Text>
        <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 1 }}>
          {xp.toLocaleString('tr-TR')} XP
        </Mono>
      </View>
    </Animated.View>
  );
}

function ChampionRow({ champ, delay }: { champ: ChampionWithProfile; delay: number }) {
  const initials = (champ.full_name ?? champ.username ?? 'PI').slice(0, 2).toUpperCase();
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(280)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#7C5CFF',
      }}
    >
      <Crown size={28} color="#7C5CFF" />
      <Avatar initials={initials} imageUrl={champ.avatar_url} size={36} color="#0F1E47" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }} numberOfLines={1}>
          {champ.full_name ?? champ.username ?? 'Pilot'}
        </Text>
        <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8, marginTop: 2 }}>
          {[
            (MONTHS_TR[champ.period_number - 1] ?? '') + ' ' + champ.year,
            champ.role,
            champ.level_tier,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Mono>
        <Mono style={{ fontSize: 10, color: '#7C5CFF', letterSpacing: 0.8, marginTop: 1, fontFamily: FONTS.mono700 }}>
          {champ.snapshot_xp.toLocaleString('tr-TR')} XP
        </Mono>
      </View>
    </Animated.View>
  );
}
