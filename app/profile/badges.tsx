/**
 * Rozet Vitrini — kullanıcının kazandığı + kilitli rozetler.
 *
 * - Grid layout (3 sütun)
 * - Kategori filtreleri (chip)
 * - Tap → detay modal (dramatic reveal animasyonu)
 */
import { useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/authStore';
import {
  useBadgeTemplates,
  useUserBadges,
  type BadgeRow,
  type BadgeCategory,
  type BadgeRarity,
} from '@/features/badges/api';
import { FONTS, Mono } from '@/components/airspeak';
import { ChevronLeft, Lock as LockIcon } from 'lucide-react-native';

const CATEGORY_LABELS: Record<BadgeCategory | 'all', string> = {
  all: 'Tümü',
  streak: 'Streak',
  xp: 'XP',
  level: 'Level',
  lesson: 'Ders',
  speed: 'Hız',
  social: 'Sosyal',
  league: 'Lig',
  special: 'Özel',
};

const RARITY_RING: Record<BadgeRarity, string> = {
  common: '#DCE0E8',
  rare: '#4FD487',
  epic: '#7C5CFF',
  legendary: '#F2C14E',
};

export default function BadgesScreen() {
  const c = usePalette();
  const userId = useAuthStore((s) => s.user?.id);
  const { badges, loading } = useBadgeTemplates();
  const { rows: userBadges } = useUserBadges(userId);
  const [filter, setFilter] = useState<BadgeCategory | 'all'>('all');
  const [open, setOpen] = useState<{
    badge: BadgeRow;
    earnedAt: string | null;
  } | null>(null);

  const earnedMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of userBadges) m.set(u.badge_id, u.earned_at);
    return m;
  }, [userBadges]);

  const earnedCount = userBadges.length;

  const visibleCategories = useMemo<(BadgeCategory | 'all')[]>(() => {
    const set = new Set<BadgeCategory>();
    for (const b of badges) set.add(b.category);
    return ['all', ...Array.from(set)] as (BadgeCategory | 'all')[];
  }, [badges]);

  const filtered = useMemo(() => {
    if (filter === 'all') return badges;
    return badges.filter((b) => b.category === filter);
  }, [badges, filter]);

  function openBadge(badge: BadgeRow) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setOpen({ badge, earnedAt: earnedMap.get(badge.id) ?? null });
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            backgroundColor: '#0F1E47',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
                ROZETLER
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
                {earnedCount} / {badges.length}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Kategori filtreleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {visibleCategories.map((c) => {
          const active = filter === c;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => setFilter(c)}
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
                {CATEGORY_LABELS[c]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {loading ? (
          <Text style={{ color: '#8A93A6', textAlign: 'center', marginTop: 24 }}>
            Yükleniyor…
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {filtered.map((b, idx) => {
              const earnedAt = earnedMap.get(b.id);
              const earned = !!earnedAt;
              return (
                <Animated.View
                  key={b.id}
                  entering={FadeInUp.delay(idx * 30).duration(280)}
                  style={{ width: '31.5%' }}
                >
                  <TouchableOpacity onPress={() => openBadge(b)} activeOpacity={0.85}>
                    <View
                      style={{
                        backgroundColor: earned ? '#FFFFFF' : '#F4F2EC',
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: earned ? RARITY_RING[b.rarity] : '#E9E6DD',
                        padding: 12,
                        alignItems: 'center',
                        opacity: earned ? 1 : 0.55,
                      }}
                    >
                      {b.icon_url ? (
                        <Animated.Image
                          entering={ZoomIn.duration(280)}
                          source={{ uri: b.icon_url }}
                          style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Text style={{ fontSize: 32, marginBottom: 2 }}>
                          {b.icon_emoji}
                        </Text>
                      )}
                      <Mono
                        style={{
                          fontSize: 10,
                          color: '#5A6478',
                          textAlign: 'center',
                          letterSpacing: 0.8,
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {b.name_tr}
                      </Mono>
                      {!earned && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            backgroundColor: '#0F1E47',
                            borderRadius: 999,
                            padding: 3,
                          }}
                        >
                          <LockIcon size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Detay modal */}
      <Modal
        visible={!!open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(null)}
      >
        <Pressable
          onPress={() => setOpen(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15,30,71,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          {open && (
            <Animated.View
              entering={ZoomIn.duration(400)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 22,
                padding: 28,
                alignItems: 'center',
                width: '100%',
                maxWidth: 320,
                borderWidth: 3,
                borderColor: RARITY_RING[open.badge.rarity],
              }}
            >
              <Mono
                style={{
                  fontSize: 10,
                  color: RARITY_RING[open.badge.rarity],
                  letterSpacing: 1.6,
                }}
              >
                {open.badge.rarity.toUpperCase()}
              </Mono>
              {open.badge.icon_url ? (
                <Animated.Image
                  entering={FadeIn.delay(120).duration(300)}
                  source={{ uri: open.badge.icon_url }}
                  style={{ width: 100, height: 100, marginTop: 12 }}
                />
              ) : (
                <Text style={{ fontSize: 86, marginTop: 6 }}>
                  {open.badge.icon_emoji}
                </Text>
              )}
              <Text
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  color: '#0F1E47',
                  fontWeight: '700',
                  marginTop: 10,
                  textAlign: 'center',
                }}
              >
                {open.badge.name_tr}
              </Text>
              {open.badge.description_tr && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#5A6478',
                    textAlign: 'center',
                    marginTop: 6,
                    lineHeight: 20,
                  }}
                >
                  {open.badge.description_tr}
                </Text>
              )}
              <View
                style={{
                  marginTop: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: open.earnedAt ? '#DDF7E6' : '#F4F2EC',
                }}
              >
                <Mono
                  style={{
                    fontSize: 11,
                    color: open.earnedAt ? '#118040' : '#8A93A6',
                    letterSpacing: 0.9,
                  }}
                >
                  {open.earnedAt
                    ? `✓ ${new Date(open.earnedAt).toLocaleDateString('tr-TR')}`
                    : 'Henüz kazanılmadı'}
                </Mono>
              </View>
            </Animated.View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
