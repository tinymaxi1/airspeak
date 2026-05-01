/**
 * Yarışma detay — kurallar + ödül havuzu + leaderboard + Katıl butonu.
 */
import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Crown, Coins, Trophy, Users, Clock } from 'lucide-react-native';
import { Body, Mono, FONTS, Avatar, Button3D } from '@/components/airspeak';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import {
  useCompetition,
  useUserEntry,
  useCompetitionLeaderboard,
  joinCompetition,
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

const TYPE_DESC: Record<string, string> = {
  xp_race: 'Süre boyunca en çok XP kazanan kazanır.',
  lesson_count: 'Süre içinde en fazla ders tamamlayan kazanır.',
  perfect_score: 'En çok 100% skor alan kazanır.',
  streak: 'En uzun streak kazanır.',
  specific_content: 'Belirli dersleri tamamlamak puan getirir.',
};

function fmtRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString('tr-TR')} → ${e.toLocaleDateString('tr-TR')}`;
}

function timeLeft(endIso: string): string {
  const ms = new Date(endIso).getTime() - Date.now();
  if (ms <= 0) return 'Sona erdi';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days} gün ${hours} saat kaldı`;
  return `${hours} saat kaldı`;
}

export default function CompetitionDetailScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const user = useAuthStore((s) => s.user);
  const coins = useGamificationStore((s) => s.coins ?? 0);
  const spendCoins = useGamificationStore((s) => s.spendCoins);

  const { row: comp, loading } = useCompetition(slug);
  const { entry, refresh: refreshEntry } = useUserEntry(user?.id, comp?.id);
  const { rows: leaderboard } = useCompetitionLeaderboard(comp?.id, user?.id);

  const [joining, setJoining] = useState(false);

  if (loading || !comp) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAF7', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  const accent = THEME_COLORS[comp.theme] ?? '#0F1E47';
  const isJoinable =
    !entry &&
    (comp.status === 'announced' || comp.status === 'active') &&
    new Date(comp.end_date) > new Date();

  async function handleJoin() {
    if (!user?.id || !comp) return;
    if (comp.is_premium) {
      // TODO: paywall check
    }
    if (comp.entry_cost_coin > 0) {
      if (coins < comp.entry_cost_coin) {
        Alert.alert(
          'Yetersiz coin',
          `Bu yarışma ${comp.entry_cost_coin} coin gerektiriyor. Mevcut: ${coins}`,
        );
        return;
      }
      const ok = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Katılım Ücreti',
          `${comp.entry_cost_coin} coin harcanacak. Devam?`,
          [
            { text: 'Vazgeç', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Katıl', onPress: () => resolve(true) },
          ],
        );
      });
      if (!ok) return;
      const spent = spendCoins(comp.entry_cost_coin, 'competition_entry');
      if (!spent) return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setJoining(true);
    const r = await joinCompetition(comp.id);
    setJoining(false);
    if (r.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Katıldın 🎉', 'Yarışmaya başarıyla katıldın. Bol şans!');
      void refreshEntry();
    } else {
      Alert.alert('Hata', r.error ?? 'Katılım başarısız');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: accent }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: accent,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 28 }}>{comp.icon_emoji}</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.4 }}>
              {comp.theme.toUpperCase().replace('_', ' ')}
            </Mono>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: '700',
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {comp.name_tr ?? comp.name}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#EDEFF3',
            marginBottom: 16,
          }}
        >
          {comp.description_tr ? (
            <Body color="#0E1116" style={{ fontSize: 14, lineHeight: 21, marginBottom: 12 }}>
              {comp.description_tr}
            </Body>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={14} color="#5A6478" />
            <Body color="#5A6478" style={{ fontSize: 13 }}>
              {timeLeft(comp.end_date)}
            </Body>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Mono style={{ fontSize: 11, color: '#8A93A6', letterSpacing: 0.8 }}>
              {fmtRange(comp.start_date, comp.end_date)}
            </Mono>
          </View>

          <View
            style={{
              marginTop: 12,
              padding: 10,
              backgroundColor: `${accent}15`,
              borderRadius: 10,
            }}
          >
            <Mono
              style={{
                fontSize: 10,
                color: accent,
                letterSpacing: 1.2,
                fontFamily: FONTS.mono700,
              }}
            >
              KURAL · {comp.type.toUpperCase()}
            </Mono>
            <Body color="#3A4255" style={{ fontSize: 12, marginTop: 4 }}>
              {TYPE_DESC[comp.type] ?? '—'}
            </Body>
          </View>
        </View>

        {/* User entry / join */}
        {entry ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              borderWidth: 2,
              borderColor: '#E63946',
              marginBottom: 16,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 1.2, fontFamily: FONTS.mono700 }}>
              KAYITLISIN
            </Mono>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <View>
                <Text style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: '700', color: '#0E1116' }}>
                  {entry.rank != null ? `#${entry.rank}` : '—'}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12 }}>
                  Sıralama
                </Body>
              </View>
              <View>
                <Text style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: '700', color: '#E63946', textAlign: 'right' }}>
                  {Number(entry.score).toLocaleString('tr-TR')}
                </Text>
                <Body color="#5A6478" style={{ fontSize: 12, textAlign: 'right' }}>
                  Score
                </Body>
              </View>
            </View>
          </View>
        ) : isJoinable ? (
          <View style={{ marginBottom: 16 }}>
            <Button3D variant="primary" fullWidth onPress={handleJoin} disabled={joining}>
              {joining
                ? 'Katılıyorsun…'
                : comp.entry_cost_coin > 0
                  ? `🪙 ${comp.entry_cost_coin} ile katıl`
                  : 'Katıl'}
            </Button3D>
          </View>
        ) : null}

        {/* Prize pool */}
        {(comp.prize_pool ?? []).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Trophy size={16} color="#E0A82E" />
              <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
                ÖDÜL HAVUZU
              </Mono>
            </View>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#EDEFF3',
                padding: 4,
              }}
            >
              {(comp.prize_pool as any[]).map((p, i) => {
                const rankLabel = p.rank != null ? `#${p.rank}` : `#${p.rank_from}-${p.rank_to}`;
                const valueLabel =
                  p.type === 'badge'
                    ? p.code
                    : p.type === 'premium_days'
                      ? `${p.days} gün premium`
                      : `${(p.amount ?? 0).toLocaleString('tr-TR')} ${p.type === 'coin' ? 'coin' : ''}`;
                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      borderBottomWidth: i < (comp.prize_pool as any[]).length - 1 ? 1 : 0,
                      borderBottomColor: '#EDEFF3',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 14,
                        color: i < 3 ? '#E0A82E' : '#5A6478',
                        width: 60,
                      }}
                    >
                      {rankLabel}
                    </Text>
                    {p.type === 'coin' && <Coins size={14} color="#E0A82E" />}
                    {p.type === 'badge' && <Crown size={14} color="#7C5CFF" />}
                    <Body color="#0E1116" style={{ fontSize: 13, flex: 1 }}>
                      {valueLabel}
                    </Body>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Leaderboard */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Users size={14} color="#5A6478" />
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1.4 }}>
              SIRALAMA · {leaderboard.length}
            </Mono>
          </View>
          {leaderboard.length === 0 ? (
            <Body color="#8A93A6" style={{ fontSize: 12, textAlign: 'center', marginTop: 16 }}>
              Henüz katılımcı yok. İlk olabilirsin.
            </Body>
          ) : (
            leaderboard.map((entry, i) => (
              <Animated.View
                key={entry.entry_id}
                entering={FadeInUp.delay(i * 25).duration(220)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  marginBottom: 6,
                  backgroundColor: entry.is_self ? '#FFF1F2' : '#FFFFFF',
                  borderRadius: 10,
                  borderWidth: entry.is_self ? 2 : 1,
                  borderColor: entry.is_self ? '#E63946' : '#EDEFF3',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: '700',
                    color: (entry.rank ?? 99) <= 3 ? '#E0A82E' : '#5A6478',
                    width: 24,
                    textAlign: 'center',
                  }}
                >
                  {entry.rank ?? '—'}
                </Text>
                <Avatar
                  initials={(entry.full_name ?? entry.username ?? 'PI').slice(0, 2).toUpperCase()}
                  imageUrl={entry.avatar_url}
                  size={32}
                  color="#0F1E47"
                />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONTS.body700,
                    fontSize: 13,
                    color: entry.is_self ? '#E63946' : '#0E1116',
                  }}
                  numberOfLines={1}
                >
                  {entry.is_self
                    ? `${entry.full_name ?? entry.username} (sen)`
                    : entry.full_name ?? entry.username ?? 'Pilot'}
                </Text>
                <Mono style={{ fontSize: 11, color: '#0E1116', fontFamily: FONTS.mono700 }}>
                  {Number(entry.score).toLocaleString('tr-TR')}
                </Mono>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
