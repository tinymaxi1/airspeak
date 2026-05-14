/**
 * Community index — group browser.
 *
 * 2 sekme: "Benim Gruplarım" / "Keşfet"
 * Sağ üst: yeni grup oluşturma butonu
 */
import { useState, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useGroups,
  useMyGroups,
  useTrendingHashtags,
  usePostsByHashtag,
  useBlockedUserIds,
} from '@/features/community/api';
import { useCommunityNotifications } from '@/features/community/notifications';
import { GroupCard } from '@/components/community/GroupCard';
import { FONTS, Mono, Body, TopoBackground, EmptyState } from '@/components/airspeak';
import { TabletShell } from '@/components/tablet';

export default function CommunityIndexScreen() {
  const c = usePalette();
  const userId = useAuthStore((s) => s.user?.id);
  // Block 1.C — Hibrit 2-segment (designer onayı)
  // Default 'feed' (%70 trafik discovery), v1.1: lastVisitedTab AsyncStorage
  type CommunitySegment = 'feed' | 'squadron';
  const [segment, setSegment] = useState<CommunitySegment>('feed');
  const [tab, setTab] = useState<'mine' | 'discover'>(userId ? 'mine' : 'discover');
  const { rows: myRows, loading: myLoading } = useMyGroups(userId);
  const { rows: allRows, loading: allLoading, refresh } = useGroups();
  const { unreadCount } = useCommunityNotifications(userId);
  const [refreshing, setRefreshing] = useState(false);

  // Feed segment — trending hashtag rail + ilk hashtag postları
  const { rows: trending } = useTrendingHashtags(8);
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const feedHashtag = activeHashtag ?? trending[0]?.tag ?? null;
  const { rows: feedPostsRaw, loading: feedLoading } = usePostsByHashtag(feedHashtag, 30);
  // Apple 1.2 — Block user filter (engellenen author'ların postları gizlenir)
  const { ids: blockedIds } = useBlockedUserIds();
  const feedPosts = useMemo(
    () => feedPostsRaw.filter((p) => !blockedIds.has(p.author_id)),
    [feedPostsRaw, blockedIds],
  );

  async function onRefresh() {
    setRefreshing(true);
    await refresh().catch(() => undefined);
    setRefreshing(false);
  }

  const rows = tab === 'mine' ? myRows : allRows;
  const loading = tab === 'mine' ? myLoading : allLoading;

  return (
    <TabletShell background={c.bg}>
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0F1E47' }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#0F1E47',
          }}
        >
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              TOPLULUK
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}>
              Topluluk Merkezi
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/community/notifications' as any)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#E63946',
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: '#0F1E47',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/community/search' as any)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/community/bookmarks' as any)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/community/new-group' as any)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>+ Yeni</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Block 1.C — Segment switcher: Feed / Squadron */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#EDEFF3',
        }}
      >
        {(['feed', 'squadron'] as const).map((id) => {
          const active = segment === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSegment(id)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderBottomWidth: 3,
                borderBottomColor: active ? '#E63946' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.body800,
                  fontSize: 13,
                  color: active ? '#0E1116' : '#8A93A6',
                  letterSpacing: 0.39,
                }}
              >
                {id === 'feed' ? 'FEED' : 'SQUADRON'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ═══ FEED SEGMENT — For You stream + trending hashtag rail + PinnedPhrase ═══ */}
      {segment === 'feed' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
        >
          {/* Pinned phrase — ICAO odak terimi (v1.0 hardcoded sample) */}
          <View
            style={{
              margin: 16,
              padding: 16,
              borderRadius: 14,
              backgroundColor: '#0A1430',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 }}>
              <TopoBackground />
            </View>
            <View style={{ position: 'relative' }}>
              <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.8 }}>
                🔖 PINNED · #PHRASEOFDAY
              </Mono>
              <Text
                style={{
                  fontFamily: FONTS.mono700,
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginTop: 6,
                }}
              >
                &quot;Cleared for the option.&quot;
              </Text>
              <Body color="rgba(255,255,255,0.7)" style={{ fontSize: 12, marginTop: 6, lineHeight: 17 }}>
                ATC izni: pilot touch-and-go, low approach, missed approach veya full stop yapabilir.
              </Body>
            </View>
          </View>

          {/* Trending hashtag rail (Group rail equivalent) */}
          {trending.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
            >
              {trending.map((h, i) => {
                const isActive = feedHashtag === h.tag;
                return (
                  <TouchableOpacity
                    key={h.tag}
                    activeOpacity={0.85}
                    onPress={() => setActiveHashtag(h.tag)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: isActive ? '#E63946' : '#F4F2EC',
                      borderWidth: isActive ? 0 : 1.5,
                      borderColor: '#DCE0E8',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONTS.body700,
                        fontSize: 12,
                        color: isActive ? '#FFFFFF' : '#0E1116',
                      }}
                    >
                      #{h.tag} <Text style={{ opacity: 0.6, fontSize: 10 }}>· {h.usage_count}</Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Feed posts */}
          {feedLoading && feedPosts.length === 0 ? (
            <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
              Feed yükleniyor…
            </Body>
          ) : feedPosts.length === 0 ? (
            <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
              <EmptyState
                icon="📡"
                title="Henüz gönderi yok"
                description="İlk gönderiyi sen oluştur — bir gruba katıl, paylaş."
                cta={{
                  label: 'Grupları gör',
                  onPress: () => router.push('/community' as any),
                }}
              />
            </View>
          ) : (
            feedPosts.map((p) => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.85}
                onPress={() => router.push(`/community/post/${p.id}` as any)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#EDEFF3',
                }}
              >
                <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.9 }}>
                  @{p.author_username ?? 'pilot'}
                </Mono>
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 14,
                    color: '#0E1116',
                    marginTop: 6,
                    lineHeight: 21,
                  }}
                  numberOfLines={4}
                >
                  {p.content}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                  <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
                    ❤ {p.reaction_count ?? 0}
                  </Mono>
                  <Mono style={{ fontSize: 11, color: '#8A93A6' }}>
                    💬 {p.comment_count ?? 0}
                  </Mono>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* ═══ SQUADRON SEGMENT — Group browser (mevcut Benim/Keşfet) ═══ */}
      {segment === 'squadron' && (
        <>
          {/* Tabs */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#FFFFFF',
              borderBottomWidth: 1,
              borderBottomColor: '#EDEFF3',
            }}
          >
            {(['mine', 'discover'] as const).map((id) => {
              const active = tab === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => setTab(id)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderBottomWidth: 3,
                    borderBottomColor: active ? '#E63946' : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.body800,
                      fontSize: 12,
                      color: active ? '#0E1116' : '#8A93A6',
                      letterSpacing: 0.36,
                    }}
                  >
                    {id === 'mine' ? 'BENİM GRUPLARIM' : 'KEŞFET'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
          >
            {loading && rows.length === 0 ? (
              <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
                Yükleniyor…
              </Body>
            ) : rows.length === 0 ? (
              <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
                <EmptyState
                  icon={tab === 'mine' ? '✈️' : '🌐'}
                  title={tab === 'mine' ? 'Henüz bir grupta değilsin' : 'Henüz açık grup yok'}
                  description={
                    tab === 'mine'
                      ? '"Keşfet" sekmesinden bir gruba katıl ya da kendin oluştur.'
                      : 'İlk grubu sen oluştur — diğer pilotları davet et.'
                  }
                  cta={{
                    label: tab === 'mine' ? 'Keşfet' : 'Grup oluştur',
                    onPress: () =>
                      tab === 'mine'
                        ? setTab('discover')
                        : router.push('/community/new-group' as any),
                  }}
                />
              </View>
            ) : (
              rows.map((g) => <GroupCard key={g.id} group={g} />)
            )}
          </ScrollView>
        </>
      )}

      {/* Compose FAB — context-aware (Feed → /post-compose, Squadron → /new-group) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push(
            (segment === 'feed' ? '/community/new-group' : '/community/new-group') as any,
          )
        }
        accessibilityLabel={segment === 'feed' ? 'Yeni post oluştur' : 'Yeni grup oluştur'}
        style={{
          position: 'absolute',
          right: 18,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: '#E63946',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomWidth: 4,
          borderBottomColor: '#C8202E',
          shadowColor: '#E63946',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 28, color: '#FFFFFF', lineHeight: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
    </TabletShell>
  );
}
