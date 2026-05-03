/**
 * Aktif yarışmalar listesi.
 *
 * Banner kart + tema + süre sayacı + Katıl/Detay butonları.
 */
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ChevronLeft, Crown, Coins, Users } from 'lucide-react-native';
import { Body, Mono, FONTS } from '@/components/airspeak';
import {
  useActiveCompetitions,
  type CompetitionRow,
} from '@/features/competitions/api';

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

function hoursLeft(endIso: string): { value: number; unit: 'sa' | 'gün' } {
  const ms = new Date(endIso).getTime() - Date.now();
  if (ms <= 0) return { value: 0, unit: 'sa' };
  const hours = Math.floor(ms / 3_600_000);
  if (hours < 48) return { value: hours, unit: 'sa' };
  return { value: Math.floor(hours / 24), unit: 'gün' };
}

export default function CompetitionsScreen() {
  const c = usePalette();
  const { rows, loading, refresh } = useActiveCompetitions();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Crown size={24} color="#F2C14E" />
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              YARIŞMALAR
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
              {rows.length} aktif etkinlik
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {loading && rows.length === 0 ? (
          <ActivityIndicator color="#E63946" style={{ marginTop: 32 }} />
        ) : rows.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
            <Text style={{ fontSize: 56 }}>🏁</Text>
            <Body color="#5A6478" style={{ textAlign: 'center', maxWidth: 240, fontSize: 13 }}>
              Şu an aktif yarışma yok. Yeni etkinlikler için bildirim açık olsun.
            </Body>
          </View>
        ) : (
          rows.map((c, i) => <CompetitionCard key={c.id} comp={c} delay={i * 50} />)
        )}
      </ScrollView>
    </View>
  );
}

function CompetitionCard({ comp, delay }: { comp: CompetitionRow; delay: number }) {
  const { value, unit } = hoursLeft(comp.end_date);
  const accent = THEME_COLORS[comp.theme] ?? '#0F1E47';
  const isAnnounced = comp.status === 'announced';

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(280)}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/competitions/${comp.slug}`)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 2,
          borderColor: accent,
          padding: 16,
          marginBottom: 12,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: `${accent}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>{comp.icon_emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 9, color: accent, letterSpacing: 1.2, fontFamily: FONTS.mono700 }}>
              {comp.theme.toUpperCase().replace('_', ' ')}
              {comp.is_premium && ' · PREMIUM'}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.body700,
                fontSize: 16,
                color: '#0E1116',
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {comp.name_tr ?? comp.name}
            </Text>
            {comp.description_tr ? (
              <Body color="#5A6478" style={{ fontSize: 12, marginTop: 2 }} numberOfLines={2}>
                {comp.description_tr}
              </Body>
            ) : null}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#EDEFF3',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.8 }}>
                {isAnnounced ? 'BAŞLAYACAK' : `${value} ${unit.toUpperCase()} KALDI`}
              </Mono>
            </View>
            {comp.entry_cost_coin > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Coins size={12} color="#E0A82E" />
                <Mono style={{ fontSize: 10, color: '#E0A82E', letterSpacing: 0.8 }}>
                  {comp.entry_cost_coin}
                </Mono>
              </View>
            )}
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: accent,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: 1, fontFamily: FONTS.mono700 }}>
              DETAY →
            </Mono>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
