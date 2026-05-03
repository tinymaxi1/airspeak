/**
 * Post detail — full post content + image grid + comments thread + inline reply composer.
 *
 * - Yukarıda PostCard benzeri full görünüm (4 reaction, comment_count)
 * - Aşağıda CommentThread (3 derin tree, max depth=2 sonra flat)
 * - En altta sticky reply composer
 *   * Parent yoksa = top-level comment
 *   * "Yanıtla" tap → parent_id set, header değişir, vazgeç ile reset
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { usePalette } from '@/lib/usePalette';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import {
  useComments,
  useUserReactions,
  reactToggle,
  createComment,
  deletePost,
  toggleBookmark,
  REACTION_KINDS,
  reactionEmoji,
  type CommunityPost,
  type ReactionKind,
} from '@/features/community/api';
import { CommentThread } from '@/components/community/CommentThread';
import { RichText } from '@/components/community/RichText';
import { ReportDialog } from '@/components/community/ReportDialog';
import { supabase } from '@/lib/supabase';
import { FONTS, Mono, Body, Avatar } from '@/components/airspeak';

const SCREEN_W = Dimensions.get('window').width;

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}sn`;
  if (d < 3600) return `${Math.floor(d / 60)}dk`;
  if (d < 86400) return `${Math.floor(d / 3600)}sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

export default function PostDetailScreen() {
  const c = usePalette();
  const params = useLocalSearchParams<{ id: string }>();
  const postId = typeof params.id === 'string' ? params.id : '';
  const userId = useAuthStore((s) => s.user?.id);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postReactions, setPostReactions] = useState<Set<ReactionKind>>(new Set());
  const [bookmarked, setBookmarked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { rows: comments, refresh: refreshComments } = useComments(postId);
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments]);
  const { byTarget: myCommentReactions, refresh: refreshCommentReactions } =
    useUserReactions(userId, 'comment', commentIds);

  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function loadPost() {
    if (!postId) return;
    const { data } = await (supabase as any)
      .from('community_posts')
      .select(
        'id, group_id, author_id, content, image_urls, pinned, comment_count, reaction_count, created_at, edited_at, status, author:profiles!community_posts_author_id_fkey(username, full_name, avatar_url)',
      )
      .eq('id', postId)
      .maybeSingle();
    if (!data || (data as any).status !== 'active') {
      setPost(null);
      setPostLoading(false);
      return;
    }
    const r = data as any;
    setPost({
      id: r.id,
      group_id: r.group_id,
      author_id: r.author_id,
      content: r.content,
      image_urls: r.image_urls ?? [],
      pinned: !!r.pinned,
      comment_count: r.comment_count ?? 0,
      reaction_count: r.reaction_count ?? 0,
      created_at: r.created_at,
      edited_at: r.edited_at,
      author_username: r.author?.username ?? null,
      author_full_name: r.author?.full_name ?? null,
      author_avatar_url: r.author?.avatar_url ?? null,
    });
    setPostLoading(false);
  }

  async function loadMyPostReactions() {
    if (!userId || !postId) return;
    const { data } = await (supabase as any)
      .from('community_reactions')
      .select('kind')
      .eq('user_id', userId)
      .eq('target_type', 'post')
      .eq('target_id', postId);
    const set = new Set<ReactionKind>();
    for (const r of (data as any[]) ?? []) set.add(r.kind as ReactionKind);
    setPostReactions(set);
  }

  async function loadBookmark() {
    if (!userId || !postId) return;
    const { data } = await (supabase as any)
      .from('community_bookmarks')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    setBookmarked(!!data);
  }

  async function onToggleBookmark() {
    if (!post) return;
    const r = await toggleBookmark(post.id);
    if (r.ok) setBookmarked(r.action === 'added');
  }

  useEffect(() => {
    void loadPost();
    void loadMyPostReactions();
    void loadBookmark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, userId]);

  async function onPostReact(kind: ReactionKind) {
    if (!userId || !post) return;
    const r = await reactToggle({ targetType: 'post', targetId: post.id, kind });
    if (r.ok) {
      // Optimistic UI
      setPostReactions((s) => {
        const next = new Set(s);
        if (r.action === 'added') next.add(kind);
        else next.delete(kind);
        return next;
      });
      // Counts → reload
      void loadPost();
    }
  }

  async function submitReply() {
    if (!post) return;
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const r = await createComment({
      postId: post.id,
      parentCommentId: replyParentId,
      content: trimmed,
    });
    setSubmitting(false);
    if (!r.ok) {
      const msg =
        r.error === 'banned_words_blocked'
          ? 'Yorumun topluluk kurallarına uymuyor (yasaklı kelime).'
          : r.error === 'rate_limited'
            ? 'Çok hızlı yorum atıyorsun. Birkaç dakika bekle.'
            : r.error === 'user_banned'
              ? 'Hesabın askıya alınmış.'
              : r.error ?? 'Tekrar deneyin.';
      Alert.alert('Gönderilemedi', msg);
      return;
    }
    if ((r as any).auto_hidden) {
      Alert.alert(
        'İnceleme bekleniyor',
        'Yorumun gönderildi ama mod ekibi inceleyene kadar gizli. Onaylanırsa yayınlanır.',
      );
    }
    setReplyText('');
    setReplyParentId(null);
    Keyboard.dismiss();
    void refreshComments();
    void loadPost();
  }

  function startReply(parentId: string) {
    setReplyParentId(parentId);
    inputRef.current?.focus();
  }

  async function confirmDeletePost() {
    if (!post) return;
    Alert.alert('Postu sil?', 'Geri alınamaz.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const r = await deletePost(post.id);
          if (r.ok) router.back();
          else Alert.alert('Hata', r.error ?? 'Silinemedi');
        },
      },
    ]);
  }

  if (postLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}>
        <Body color="#5A6478" style={{ textAlign: 'center' }}>
          Yükleniyor…
        </Body>
      </View>
    );
  }

  if (!post) {
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
            style={{ fontFamily: FONTS.body800, fontSize: 16, color: '#0E1116', marginTop: 8 }}
          >
            Post bulunamadı
          </Text>
        </View>
      </View>
    );
  }

  const isOwn = post.author_id === userId;
  const replyParent = replyParentId ? comments.find((c) => c.id === replyParentId) : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
              POST
            </Mono>
            <Text style={{ fontFamily: FONTS.display, fontSize: 18, color: '#FFFFFF', fontWeight: '700' }}>
              {post.comment_count} yorum · {post.reaction_count} tepki
            </Text>
          </View>
          <TouchableOpacity onPress={() => void onToggleBookmark()} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 20 }}>{bookmarked ? '🔖' : '📑'}</Text>
          </TouchableOpacity>
          {!isOwn && (
            <TouchableOpacity onPress={() => setReportOpen(true)} style={{ marginRight: 8 }}>
              <Text style={{ fontSize: 18 }}>🚩</Text>
            </TouchableOpacity>
          )}
          {isOwn && (
            <TouchableOpacity onPress={confirmDeletePost}>
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>🗑</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post body */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: post.pinned ? '#FFD56B' : '#DCE0E8',
            borderBottomWidth: 4,
            borderBottomColor: post.pinned ? '#F2C14E' : '#DCE0E8',
            padding: 14,
            marginBottom: 16,
          }}
        >
          {post.pinned && (
            <Mono style={{ fontSize: 9, color: '#F2C14E', letterSpacing: 1.4, marginBottom: 6 }}>
              📌 SABITLENMIŞ
            </Mono>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {post.author_avatar_url ? (
              <Image
                source={{ uri: post.author_avatar_url }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Avatar
                initials={(post.author_username ?? post.author_full_name ?? '??')
                  .slice(0, 2)
                  .toUpperCase()}
                color="#0F1E47"
                size={40}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONTS.body700, fontSize: 14, color: '#0E1116' }}>
                {post.author_full_name ?? post.author_username ?? 'Anonim'}
              </Text>
              <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
                {relTime(post.created_at)}
                {post.edited_at ? ' · düzenlendi' : ''}
              </Mono>
            </View>
          </View>

          <RichText content={post.content} baseStyle={{ fontSize: 15, lineHeight: 22 }} />


          {post.image_urls.length > 0 && (
            <View style={{ marginTop: 12, gap: 6 }}>
              {post.image_urls.map((u) => (
                <Image
                  key={u}
                  source={{ uri: u }}
                  style={{ width: '100%', height: SCREEN_W * 0.55, borderRadius: 10 }}
                  contentFit="cover"
                />
              ))}
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#EDEFF3',
            }}
          >
            {REACTION_KINDS.map((kind) => {
              const active = postReactions.has(kind);
              return (
                <TouchableOpacity
                  key={kind}
                  onPress={() => void onPostReact(kind)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? '#FFE4E7' : '#F4F5F8',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{reactionEmoji(kind)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Comments section */}
        <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 1, marginBottom: 12 }}>
          YORUMLAR ({comments.length})
        </Mono>

        {comments.length === 0 ? (
          <View style={{ alignItems: 'center', marginVertical: 24 }}>
            <Body color="#8A93A6" style={{ fontSize: 13 }}>
              İlk yorumu sen yaz.
            </Body>
          </View>
        ) : (
          <CommentThread
            comments={comments}
            myReactions={myCommentReactions}
            onReactionToggled={() => void refreshCommentReactions()}
            onReply={startReply}
            onMutated={() => {
              void refreshComments();
              void loadPost();
            }}
          />
        )}
      </ScrollView>

      {/* Sticky reply composer */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EDEFF3',
        }}
      >
        {replyParent && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: '#F4F5F8',
              gap: 8,
            }}
          >
            <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.8 }}>
              ↪ {replyParent.author_full_name ?? replyParent.author_username ?? 'Anonim'} yanıtlanıyor
            </Mono>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => setReplyParentId(null)}>
              <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 0.8 }}>VAZGEÇ</Mono>
            </TouchableOpacity>
          </View>
        )}
        <SafeAreaView edges={['bottom']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 10,
              gap: 8,
            }}
          >
            <TextInput
              ref={inputRef}
              value={replyText}
              onChangeText={setReplyText}
              placeholder={replyParent ? 'Yanıtını yaz...' : 'Yorum yaz...'}
              placeholderTextColor="#8A93A6"
              multiline
              style={{
                flex: 1,
                minHeight: 38,
                maxHeight: 100,
                borderWidth: 1.5,
                borderColor: '#DCE0E8',
                borderRadius: 18,
                paddingHorizontal: 14,
                paddingVertical: 8,
                fontSize: 14,
                fontFamily: FONTS.body,
                color: '#0E1116',
              }}
            />
            <TouchableOpacity
              onPress={() => void submitReply()}
              disabled={submitting || !replyText.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: replyText.trim() && !submitting ? '#E63946' : '#DCE0E8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                {submitting ? '…' : '↑'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ReportDialog
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="community_post"
        targetId={post.id}
      />
    </KeyboardAvoidingView>
  );
}
