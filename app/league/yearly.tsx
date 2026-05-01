/**
 * Yıllık Lig — Bu Yıl / Geçen Yıl / Hall of Fame.
 *
 * Sprint 4D ekranı.
 */
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ChevronLeft, Star, Sparkles } from 'lucide-react-native';
import { Body, Mono, FONTS, Avatar } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import {
  type ChampionshipRow,
} from '@/features/league/championships';

type TabKey = 'current' | 'previous' | 'hallOfFame';

interface CurrentRow {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  year_xp: number;
  rank: number;
}

interface ChampWithProfile extends ChampionshipRow {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

async function fetchCurrentYearLeaderboard(): Promise<CurrentRow[]> {
  const { data, error } = await supabase
    .from('user_xp_summary')
    .select('user_id, year_xp, profiles!inner(username, full_name, avatar_url)')
    .gt('year_xp', 0)
    .order('year_xp', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as any[]).map((r, idx) => ({
    user_id: r.user_id,
    username: r.profiles?.username ?? null,
    full_name: r.profiles?.full_name ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
    year_xp: r.year_xp,
    rank: idx + 1,
  }));
}

async function fetchYearChampions(year: number): Promise<ChampWithProfile[]> {
  const { data, error } = await supabase
    .from('championships')
    .select(
      'id, championship_type, year, period_number, role, level_tier, user_id, snapshot_xp, awarded_at, profiles!inner(username, full_name, avatar_url)',
    )
    .eq('championship_type', 'yearly')
    .eq('year', year)
    .order('snapshot_xp', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
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
}

async function fetchAllYearChampions(): Promise<ChampWithProfile[]> {
  const { data, error } = await supabase
    .from('championships')
    .select(
      'id, championship_type, year, period_number, role, level_tier, user_id, snapshot_xp, awarded_at, profiles!inner(username, full_name, avatar_url)',
    )
    .eq('championship_type', 'yearly')
    .order('year', { ascending: false })
    .order('snapshot_xp', { ascending: false });
  if (error || !data) return [];
  return (data as any[]).map((r) => ({
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
}

function daysUntilYearEnd(): number {
  const now = new Date();
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export default function YearlyLeagueScreen() {
  const c = usePalette();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabKey>('current');
  const prevYear = new Date().getFullYear() - 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#E0A82E' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#E0A82E',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Star size={26} color="#FFFFFF" fill="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.4 }}>
              YILLIK LİG
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
              Hall of Fame
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF3',
        }}
      >
        {(
          [
            { key: 'current' as TabKey, label: 'Bu Yıl' },
            { key: 'previous' as TabKey, label: 'Geçen Yıl' },
            { key: 'hallOfFame' as TabKey, label: 'Tüm Yıllar' },
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
                borderBottomColor: active ? '#E0A82E' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 13,
                  color: active ? '#E0A82E' : '#5A6478',
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === 'current' && <CurrentYearTab selfUserId={user?.id ?? null} />}
      {tab === 'previous' && <PreviousYearTab year={prevYear} />}
      {tab === 'hallOfFame' && <HallOfFameTab />}
    </View>
  );
}

// ─── Bu Yıl ────────────────────────────────────────────────────────────────
function CurrentYearTab({ selfUserId }: { selfUserId: string | null }) {
  const [rows, setRows] = useState<CurrentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchCurrentYearLeaderboard().then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const days = daysUntilYearEnd();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          padding: 14,
          backgroundColor: '#FFF8E5',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E0A82E',
          marginBottom: 16,
        }}
      >
        <Mono style={{ fontSize: 10, color: '#E0A82E', letterSpacing: 1.2, fontFamily: FONTS.mono700 }}>
          YIL SONUNA
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
        <Body color="#5A4A1F" style={{ fontSize: 12, marginTop: 4 }}>
          1.: 10000 coin + Yılın Birincisi (legendary) + 1 yıl premium ·
          2-3: 5000 · 4-10: 2000 · 11-50: 500
        </Body>
      </View>

      {loading ? (
        <ActivityIndicator color="#E0A82E" style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          Bu yıl henüz kimse XP kazanmadı.
        </Body>
      ) : (
        rows.map((r, i) => (
          <YearLeaderRow
            key={r.user_id}
            rank={r.rank}
            displayName={r.full_name ?? r.username ?? 'Pilot'}
            avatarUrl={r.avatar_url}
            xp={r.year_xp}
            isSelf={r.user_id === selfUserId}
            delay={i * 25}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Geçen Yıl ─────────────────────────────────────────────────────────────
function PreviousYearTab({ year }: { year: number }) {
  const [rows, setRows] = useState<ChampWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchYearChampions(year).then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [year]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          padding: 14,
          backgroundColor: '#FFF8E5',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#E0A82E',
          marginBottom: 16,
        }}
      >
        <Mono style={{ fontSize: 10, color: '#E0A82E', letterSpacing: 1.4, fontFamily: FONTS.mono700 }}>
          {year}
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
          Resmi Yıllık Şampiyonlar
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#E0A82E" style={{ marginTop: 24 }} />
      ) : rows.length === 0 ? (
        <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}>
          Geçen yıl için şampiyon kaydı yok.
        </Body>
      ) : (
        rows.map((c, i) => <ChampionLegendaryCard champ={c} delay={i * 50} key={c.id} />)
      )}
    </ScrollView>
  );
}

// ─── Hall of Fame ──────────────────────────────────────────────────────────
function HallOfFameTab() {
  const [rows, setRows] = useState<ChampWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void fetchAllYearChampions().then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Yıl bazlı grupla
  const groupedByYear = rows.reduce<Record<number, ChampWithProfile[]>>((acc, c) => {
    if (!acc[c.year]) acc[c.year] = [];
    acc[c.year]!.push(c);
    return acc;
  }, {});
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {loading ? (
        <ActivityIndicator color="#E0A82E" style={{ marginTop: 24 }} />
      ) : years.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
          <Text style={{ fontSize: 56 }}>👑</Text>
          <Body color="#5A6478" style={{ textAlign: 'center', fontSize: 13 }}>
            Henüz yıllık şampiyon yok. İlk yıllık şampiyon olmak için yarışı başlat.
          </Body>
        </View>
      ) : (
        years.map((y) => (
          <View key={y} style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Sparkles size={16} color="#E0A82E" />
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0F1E47',
                }}
              >
                {y}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#EDEFF3' }} />
            </View>
            {groupedByYear[y]!.map((c, i) => (
              <ChampionLegendaryCard champ={c} delay={i * 30} key={c.id} />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── Reusable rows ────────────────────────────────────────────────────────
function YearLeaderRow({
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
            color: rank <= 3 ? '#E0A82E' : '#5A6478',
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

function ChampionLegendaryCard({
  champ,
  delay,
}: {
  champ: ChampWithProfile;
  delay: number;
}) {
  const initials = (champ.full_name ?? champ.username ?? 'PI').slice(0, 2).toUpperCase();
  const meta = [champ.role, champ.level_tier].filter(Boolean).join(' · ');
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).duration(360)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        marginBottom: 10,
        backgroundColor: '#FFFAEC',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E0A82E',
        shadowColor: '#E0A82E',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Star size={32} color="#E0A82E" fill="#E0A82E" />
      <Avatar initials={initials} imageUrl={champ.avatar_url} size={42} color="#0F1E47" />
      <View style={{ flex: 1 }}>
        <Mono
          style={{
            fontSize: 9,
            color: '#E0A82E',
            letterSpacing: 1.4,
            fontFamily: FONTS.mono700,
          }}
        >
          {champ.year} ŞAMPİYONU
        </Mono>
        <Text
          style={{
            fontFamily: FONTS.body700,
            fontSize: 15,
            color: '#0E1116',
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {champ.full_name ?? champ.username ?? 'Pilot'}
        </Text>
        {meta ? (
          <Mono style={{ fontSize: 10, color: '#5A4A1F', letterSpacing: 0.8, marginTop: 2 }}>
            {meta}
          </Mono>
        ) : null}
        <Mono
          style={{
            fontSize: 10,
            color: '#E0A82E',
            letterSpacing: 0.8,
            marginTop: 1,
            fontFamily: FONTS.mono700,
          }}
        >
          {champ.snapshot_xp.toLocaleString('tr-TR')} XP
        </Mono>
      </View>
    </Animated.View>
  );
}
