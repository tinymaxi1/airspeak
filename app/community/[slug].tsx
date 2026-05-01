/**
 * Group detail + post feed.
 *
 * - Header: emoji + name + privacy badge + member/post count + join/leave button
 * - Premium grup için "Pro gerekli" gate
 * - Closed grup pending state
 * - Secret grup için passcode prompt
 * - Post feed (FlatList olmadan ScrollView — yüksek volume olduğunda 6.B'de)
 * - FAB: yeni post composer
 */
import { useState, useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useGroup,
  usePosts,
  useGroupMembership,
  useUserReactions,
  useBookmarkSet,
  joinGroup,
  leaveGroup,
} from '@/features/community/api';
import { useGroupPresence } from '@/features/community/notifications';
import { useProfile } from '@/features/profile/useProfile';
import { PostCard } from '@/components/community/PostCard';
import { PostComposer } from '@/components/community/PostComposer';
import { FONTS, Mono, Body, Button3D } from '@/components/airspeak';

const PRIVACY_LABEL: Record<string, string> = {
  open: '🌐 Açık',
  closed: '🔐 Kapalı',
  secret: '🤫 Gizli',
  premium: '👑 Pro',
};

export default function GroupDetailScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const userId = useAuthStore((s) => s.user?.id);

  const { group, loading: groupLoading, refresh: refreshGroup } = useGroup(slug);
  const groupId = group?.id;
  const { membership, refresh: refreshMembership } = useGroupMembership(groupId, userId);
  const { rows: posts, loading: postsLoading, refresh: refreshPosts } = usePosts(groupId);

  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);
  const { byTarget: myPostReactions, refresh: refreshReactions } = useUserReactions(
    userId,
    'post',
    postIds,
  );
  const { bookmarked, refresh: refreshBookmarks } = useBookmarkSet(userId, postIds);

  // Realtime presence — sadece üyelik aktifse track et (banned/pending hariç)
  const { profile } = useProfile(userId);
  const presenceProfile =
    userId && membership?.status === 'active'
      ? {
          user_id: userId,
          full_name: profile?.full_name ?? null,
          username: profile?.username ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }
      : null;
  const { count: onlineCount } = useGroupPresence(
    membership?.status === 'active' ? groupId : null,
    presenceProfile,
  );

  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [joining, setJoining] = useState(false);

  const isMember = membership?.status === 'active';
  const isPending = membership?.status === 'pending';
  const isBanned = membership?.status === 'banned';

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refreshGroup(), refreshMembership(), refreshPosts(), refreshReactions()]);
    setRefreshing(false);
  }

  async function onJoin() {
    if (!group) return;
    setJoining(true);
    const r = await joinGroup({
      groupId: group.id,
      passcode: group.privacy === 'secret' ? secretCode : undefined,
    });
    setJoining(false);
    if (!r.ok) {
      const msg =
        r.error === 'invalid_passcode'
          ? 'Passcode yanlış'
          : r.error === 'premium_required'
            ? 'Bu grup Pro üyelere özel'
            : r.error === 'banned'
              ? 'Bu grupta yasaklısın'
              : r.error === 'group_full'
                ? 'Grup dolu'
                : r.error ?? 'Tekrar dene';
      Alert.alert('Katılamadın', msg);
      return;
    }
    void refreshMembership();
  }

  async function onLeave() {
    if (!group) return;
    Alert.alert('Gruptan ayrıl?', 'Tekrar katılmak isteyebilirsin.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Ayrıl',
        style: 'destructive',
        onPress: async () => {
          await leaveGroup(group.id);
          void refreshMembership();
        },
      },
    ]);
  }

  if (groupLoading && !group) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}>
        <Body color="#5A6478" style={{ textAlign: 'center' }}>
          Yükleniyor…
        </Body>
      </View>
    );
  }

  if (!group) {
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
            style={{
              fontFamily: FONTS.body800,
              fontSize: 16,
              color: '#0E1116',
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            Grup bulunamadı veya erişim yok
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
          <Text style={{ fontSize: 26 }}>{group.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Mono style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.4 }}>
              {PRIVACY_LABEL[group.privacy]} · {group.member_count}/{group.capacity}
            </Mono>
            <Text
              numberOfLines={1}
              style={{ fontFamily: FONTS.display, fontSize: 18, color: '#FFFFFF', fontWeight: '700' }}
            >
              {group.name}
            </Text>
          </View>
          {onlineCount > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(45,190,108,0.22)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <View
                style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#2DBE6C' }}
              />
              <Mono style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: 0.8 }}>
                {onlineCount}
              </Mono>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />}
      >
        {group.description && (
          <Body color="#0E1116" style={{ fontSize: 14, marginBottom: 14, lineHeight: 21 }}>
            {group.description}
          </Body>
        )}

        {/* Membership state */}
        {!isMember && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#DCE0E8',
              padding: 14,
              marginBottom: 14,
              gap: 10,
            }}
          >
            {isBanned ? (
              <Body color="#E63946" style={{ fontSize: 13, fontFamily: FONTS.body700 }}>
                ⚠ Bu grupta yasaklısın.
              </Body>
            ) : isPending ? (
              <Body color="#5A6478" style={{ fontSize: 13 }}>
                Üyelik isteğin admin onayında bekliyor.
              </Body>
            ) : (
              <>
                {group.privacy === 'secret' && (
                  <View>
                    <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.8, marginBottom: 4 }}>
                      PASSCODE
                    </Mono>
                    <TextInput
                      value={secretCode}
                      onChangeText={setSecretCode}
                      placeholder="Davet kodunu gir"
                      autoCapitalize="none"
                      style={{
                        borderWidth: 1.5,
                        borderColor: '#DCE0E8',
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        height: 44,
                        fontSize: 14,
                        fontFamily: FONTS.body,
                      }}
                    />
                  </View>
                )}
                <Button3D variant="primary" fullWidth disabled={joining} onPress={onJoin}>
                  {joining
                    ? 'Katılıyor…'
                    : group.privacy === 'closed'
                      ? 'Katılma isteği gönder'
                      : 'Katıl'}
                </Button3D>
              </>
            )}
          </View>
        )}

        {/* Posts */}
        {isMember && posts.length === 0 && !postsLoading ? (
          <View style={{ alignItems: 'center', marginTop: 24, gap: 8 }}>
            <Text style={{ fontSize: 36 }}>📝</Text>
            <Body color="#5A6478" style={{ fontSize: 13, textAlign: 'center' }}>
              İlk postu sen yaz.
            </Body>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myReactions={myPostReactions.get(post.id)}
              bookmarked={bookmarked.has(post.id)}
              onReactionToggled={() => void refreshReactions()}
              onBookmarkToggled={() => void refreshBookmarks()}
            />
          ))
        )}
      </ScrollView>

      {/* FAB — yeni post */}
      {isMember && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setComposerOpen(true)}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#E63946',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      )}

      {isMember && groupId && (
        <PostComposer
          groupId={groupId}
          visible={composerOpen}
          onClose={() => setComposerOpen(false)}
          onSuccess={() => void refreshPosts()}
        />
      )}

      {/* Footer kick — leave group entry */}
      {isMember && (
        <TouchableOpacity
          onPress={onLeave}
          style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderWidth: 1,
            borderColor: '#DCE0E8',
          }}
        >
          <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 0.8 }}>AYRIL</Mono>
        </TouchableOpacity>
      )}
    </View>
  );
}
