/**
 * Community user profile.
 *
 * - Header: avatar + name + username + bio_short
 * - Stats: post_count / follower_count / following_count
 * - Follow toggle butonu (kendisi değilse)
 * - Posts feed (useUserCommunityPosts; RLS gizli grup postlarını filtreler)
 * - Tap post → /community/post/[id]
 */
import { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import {
  toggleFollow,
  useFollowing,
  useUserCommunityPosts,
  useUserReactions,
  useBookmarkSet,
} from '@/features/community/api';
import { PostCard } from '@/components/community/PostCard';
import { FONTS, Avatar, Mono, Body, Button3D } from '@/components/airspeak';

interface UserHeader {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio_short: string | null;
  community_post_count: number;
  community_follower_count: number;
  community_following_count: number;
}

export default function CommunityUserProfileScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ username: string }>();
  const username = typeof params.username === 'string' ? params.username.toLowerCase() : '';
  const myUserId = useAuthStore((s) => s.user?.id);

  const [user, setUser] = useState<UserHeader | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  async function loadUser() {
    if (!username) return;
    const { data } = await (supabase as any)
      .from('profiles')
      .select(
        'id, username, full_name, avatar_url, bio_short, community_post_count, community_follower_count, community_following_count',
      )
      .ilike('username', username)
      .maybeSingle();
    setUser((data as UserHeader) ?? null);
    setUserLoading(false);
  }

  useEffect(() => {
    void loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const targetId = user?.id;
  const isOwn = !!myUserId && myUserId === targetId;

  const { following, refresh: refreshFollow } = useFollowing(myUserId, targetId);
  const { rows: posts, loading: postsLoading, refresh: refreshPosts } = useUserCommunityPosts(targetId);
  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);
  const { byTarget: myReactions, refresh: refreshReactions } = useUserReactions(
    myUserId,
    'post',
    postIds,
  );
  const { bookmarked, refresh: refreshBookmarks } = useBookmarkSet(myUserId, postIds);

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadUser(), refreshFollow(), refreshPosts(), refreshReactions(), refreshBookmarks()]);
    setRefreshing(false);
  }

  const [followBusy, setFollowBusy] = useState(false);
  async function onFollowToggle() {
    if (!targetId) return;
    setFollowBusy(true);
    const r = await toggleFollow(targetId);
    setFollowBusy(false);
    if (r.ok) {
      void refreshFollow();
      void loadUser(); // refresh follower count
    }
  }

  if (userLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}>
        <Body color="#5A6478" style={{ textAlign: 'center' }}>
          Yükleniyor…
        </Body>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SafeAreaView edges={['top']}>
          <View style={{ padding: 16 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 22 }}>←</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48 }}>🚫</Text>
          <Text
            style={{ fontFamily: FONTS.body800, fontSize: 16, color: '#0E1116', marginTop: 8, textAlign: 'center' }}
          >
            @{username} bulunamadı
          </Text>
        </View>
      </View>
    );
  }

  return (
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 22, color: '#FFFFFF' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              @{user.username ?? '...'}
            </Mono>
            <Text
              numberOfLines={1}
              style={{ fontFamily: FONTS.display, fontSize: 18, color: '#FFFFFF', fontWeight: '700' }}
            >
              {user.full_name ?? user.username ?? 'Pilot'}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {/* Hero card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: '#DCE0E8',
            borderBottomWidth: 4,
            borderBottomColor: '#DCE0E8',
            padding: 16,
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
            />
          ) : (
            <Avatar
              initials={(user.username ?? user.full_name ?? '??').slice(0, 2).toUpperCase()}
              color="#0F1E47"
              size={88}
            />
          )}
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: '700',
              color: '#0E1116',
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {user.full_name ?? user.username ?? 'Pilot'}
          </Text>
          <Mono style={{ fontSize: 11, color: '#8A93A6', marginTop: 2, letterSpacing: 0.8 }}>
            @{user.username}
          </Mono>
          {user.bio_short && (
            <Body
              color="#5A6478"
              style={{ fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 19, maxWidth: 280 }}
            >
              {user.bio_short}
            </Body>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
            <Stat label="POST" value={user.community_post_count} />
            <Stat label="TAKİPÇİ" value={user.community_follower_count} />
            <Stat label="TAKİP" value={user.community_following_count} />
          </View>

          {/* Follow buton */}
          {!isOwn && myUserId && (
            <View style={{ marginTop: 16, width: '100%' }}>
              <Button3D
                variant={following ? 'secondary' : 'primary'}
                fullWidth
                disabled={followBusy}
                onPress={onFollowToggle}
              >
                {followBusy ? 'İşleniyor…' : following ? '✓ Takip ediliyor' : 'Takip et'}
              </Button3D>
            </View>
          )}
        </View>

        {/* Posts */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, marginBottom: 10 }}>
          POSTLAR ({user.community_post_count})
        </Mono>

        {postsLoading && posts.length === 0 ? (
          <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 16 }}>
            Yükleniyor…
          </Body>
        ) : posts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Body color="#8A93A6" style={{ fontSize: 13 }}>
              Henüz post yok.
            </Body>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myReactions={myReactions.get(post.id)}
              bookmarked={bookmarked.has(post.id)}
              onReactionToggled={() => void refreshReactions()}
              onBookmarkToggled={() => void refreshBookmarks()}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: '700', color: '#0E1116' }}>
        {value.toLocaleString('tr-TR')}
      </Text>
      <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 1, marginTop: 2 }}>
        {label}
      </Mono>
    </View>
  );
}
