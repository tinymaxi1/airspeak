/**
 * Şampiyonluklar tam liste — profile/championships.
 *
 * Filter: tip (tümü / weekly / monthly / yearly).
 */
import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Trophy, Crown, Star } from 'lucide-react-native';
import { Body, Mono, Eyebrow, FONTS } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import {
  useUserChampionships,
  type ChampionshipRow,
  type ChampionshipType,
} from '@/features/league/championships';

type FilterKey = 'all' | ChampionshipType;

const TYPE_META: Record<
  ChampionshipType,
  { icon: any; color: string; label: string }
> = {
  weekly: { icon: Trophy, color: '#F2C14E', label: 'Haftalık' },
  monthly: { icon: Crown, color: '#7C5CFF', label: 'Aylık' },
  yearly: { icon: Star, color: '#E0A82E', label: 'Yıllık' },
};

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function fmtPeriod(c: ChampionshipRow): string {
  if (c.championship_type === 'weekly') return `${c.year} hafta ${c.period_number}`;
  if (c.championship_type === 'monthly') return `${MONTHS_TR[c.period_number - 1] ?? c.period_number} ${c.year}`;
  return `${c.year}`;
}

export default function ChampionshipsScreen() {
  const c = usePalette();
  const user = useAuthStore((s) => s.user);
  const { rows, loading } = useUserChampionships(user?.id);
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.championship_type === filter)),
    [rows, filter],
  );

  const stats = useMemo(() => {
    const counts: Record<ChampionshipType, number> = { weekly: 0, monthly: 0, yearly: 0 };
    for (const r of rows) counts[r.championship_type] += 1;
    return counts;
  }, [rows]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              ŞAMPİYONLUKLAR
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
              {rows.length} kupa
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Filtre */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {(
          [
            { key: 'all', label: `Tümü · ${rows.length}` },
            { key: 'weekly' as ChampionshipType, label: `Haftalık · ${stats.weekly}` },
            { key: 'monthly' as ChampionshipType, label: `Aylık · ${stats.monthly}` },
            { key: 'yearly' as ChampionshipType, label: `Yıllık · ${stats.yearly}` },
          ]
        ).map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key as FilterKey)}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? '#0F1E47' : '#FFFFFF',
                borderWidth: 1,
                borderColor: active ? '#0F1E47' : '#DCE0E8',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body700,
                  fontSize: 12,
                  color: active ? '#FFFFFF' : '#0F1E47',
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading && rows.length === 0 ? (
          <Body color="#8A93A6" style={{ textAlign: 'center', marginTop: 24 }}>
            Yükleniyor…
          </Body>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
            <Body color="#5A6478" style={{ textAlign: 'center', fontSize: 13 }}>
              Henüz şampiyonluğun yok. Haftalık ligte 1. olduğunda ilk kupanı alırsın.
            </Body>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((c, i) => {
              const meta = TYPE_META[c.championship_type];
              const Icon = meta.icon;
              return (
                <Animated.View
                  key={c.id}
                  entering={FadeInUp.delay(i * 30).duration(260)}
                  style={{
                    flexDirection: 'row',
                    gap: 14,
                    padding: 14,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: meta.color,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: `${meta.color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={26} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Mono
                      style={{
                        fontSize: 9,
                        color: meta.color,
                        letterSpacing: 1.2,
                        fontFamily: FONTS.mono700,
                      }}
                    >
                      {meta.label.toUpperCase()} ŞAMPİYONU
                    </Mono>
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 15,
                        color: '#0E1116',
                        marginTop: 2,
                      }}
                    >
                      {fmtPeriod(c)}
                    </Text>
                    <Mono
                      style={{
                        fontSize: 10,
                        color: '#8A93A6',
                        letterSpacing: 0.8,
                        marginTop: 2,
                      }}
                    >
                      {[c.role, c.level_tier].filter(Boolean).join(' · ')} · {c.snapshot_xp.toLocaleString('tr-TR')} XP
                    </Mono>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
