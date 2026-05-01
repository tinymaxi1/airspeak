/**
 * Search — community posts (content ILIKE) + trending hashtags + group search.
 *
 * 6.D'de FTS + hashtag/post/group ayrı tab.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  searchPosts,
  useTrendingHashtags,
  useUserReactions,
  useBookmarkSet,
  type CommunityPost,
} from '@/features/community/api';
import { PostCard } from '@/components/community/PostCard';
import { FONTS, Mono, Body } from '@/components/airspeak';

export default function CommunitySearchScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CommunityPost[]>([]);

  const { rows: trending } = useTrendingHashtags(20, 7);

  const postIds = useMemo(() => results.map((p) => p.id), [results]);
  const { byTarget: myReactions, refresh: refreshReactions } = useUserReactions(
    userId,
    'post',
    postIds,
  );
  const { bookmarked, refresh: refreshBookmarks } = useBookmarkSet(userId, postIds);

  // Debounced search
  useEffect(() => {
    const t = query.trim();
    if (t.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      const r = await searchPosts(t, 50);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

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
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 999,
              paddingHorizontal: 12,
              height: 40,
              gap: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14 }}>🔍</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Post ara…"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={{
                flex: 1,
                color: '#FFFFFF',
                fontFamily: FONTS.body,
                fontSize: 14,
              }}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trending hashtags — query boş ise */}
        {query.trim().length < 2 && trending.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, marginBottom: 10 }}>
              POPÜLER HASHTAG'LER (SON 7 GÜN)
            </Mono>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {trending.map((h) => (
                <TouchableOpacity
                  key={h.tag}
                  onPress={() => router.push(`/community/hashtag/${h.tag}` as any)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#DCE0E8',
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#1F4FB6', fontFamily: FONTS.body700 }}>
                    #{h.tag}
                  </Text>
                  <Mono style={{ fontSize: 10, color: '#8A93A6' }}>{h.usage_count}</Mono>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {searching && (
          <View style={{ alignItems: 'center', marginVertical: 16 }}>
            <ActivityIndicator color="#E63946" />
          </View>
        )}

        {!searching && query.trim().length >= 2 && results.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 36 }}>🔎</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              "{query}" için sonuç yok.
            </Body>
          </View>
        )}

        {results.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            myReactions={myReactions.get(post.id)}
            bookmarked={bookmarked.has(post.id)}
            onReactionToggled={() => void refreshReactions()}
            onBookmarkToggled={() => void refreshBookmarks()}
          />
        ))}
      </ScrollView>
    </View>
  );
}
