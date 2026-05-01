/**
 * Hashtag feed — #tag'li tüm postlar.
 *
 * RichText'ten tap → bu sayfa.
 * RLS post read kuralları geçerli (private grup postu görünmez).
 */
import { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  usePostsByHashtag,
  useUserReactions,
  useBookmarkSet,
} from '@/features/community/api';
import { PostCard } from '@/components/community/PostCard';
import { FONTS, Mono, Body } from '@/components/airspeak';

export default function HashtagFeedScreen() {
  const params = useLocalSearchParams<{ tag: string }>();
  const tag = typeof params.tag === 'string' ? params.tag.toLowerCase() : '';
  const userId = useAuthStore((s) => s.user?.id);

  const { rows, loading, refresh } = usePostsByHashtag(tag);
  const postIds = useMemo(() => rows.map((p) => p.id), [rows]);
  const { byTarget: myReactions, refresh: refreshReactions } = useUserReactions(
    userId,
    'post',
    postIds,
  );
  const { bookmarked, refresh: refreshBookmarks } = useBookmarkSet(userId, postIds);

  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refresh(), refreshReactions(), refreshBookmarks()]);
    setRefreshing(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
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
              HASHTAG
            </Mono>
            <Text
              numberOfLines={1}
              style={{ fontFamily: FONTS.display, fontSize: 22, color: '#FFFFFF', fontWeight: '700' }}
            >
              #{tag}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {loading && rows.length === 0 ? (
          <Body color="#5A6478" style={{ textAlign: 'center', marginTop: 40 }}>
            Yükleniyor…
          </Body>
        ) : rows.length === 0 ? (
          <View style={{ marginTop: 40, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center' }}>
              Bu hashtag için post yok.
            </Body>
          </View>
        ) : (
          rows.map((post) => (
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
