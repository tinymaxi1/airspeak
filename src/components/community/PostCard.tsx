/**
 * PostCard — feed item.
 *
 * Avatar + author + relative time + content + 1-4 image grid + reaction toolbar +
 * comment count + tap → post detail.
 *
 * Reactions inline minimal (👍 ❤️ 🎯 🤔 toggle). Detay 6.A.3'te.
 */
import { useState } from 'react';
import { TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  type CommunityPost,
  type ReactionKind,
  REACTION_KINDS,
  reactionEmoji,
  reactToggle,
  toggleBookmark,
} from '@/features/community/api';
import { useAuthStore } from '@/stores/authStore';
import { FONTS, Avatar, Mono } from '@/components/airspeak';
import { RichText } from './RichText';
import { ReportDialog } from './ReportDialog';

const SCREEN_W = Dimensions.get('window').width;

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}sn`;
  if (d < 3600) return `${Math.floor(d / 60)}dk`;
  if (d < 86400) return `${Math.floor(d / 3600)}sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

interface Props {
  post: CommunityPost;
  myReactions?: Set<ReactionKind>;
  bookmarked?: boolean;
  onReactionToggled?: (kind: ReactionKind, action: 'added' | 'removed') => void;
  onBookmarkToggled?: (action: 'added' | 'removed') => void;
}

export function PostCard({
  post,
  myReactions,
  bookmarked,
  onReactionToggled,
  onBookmarkToggled,
}: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const [reportOpen, setReportOpen] = useState(false);
  const isOwn = userId === post.author_id;

  async function onReact(kind: ReactionKind) {
    if (!userId) return;
    const r = await reactToggle({ targetType: 'post', targetId: post.id, kind });
    if (r.ok && r.action) onReactionToggled?.(kind, r.action);
  }

  async function onBookmark(e: any) {
    e?.stopPropagation?.();
    if (!userId) return;
    const r = await toggleBookmark(post.id);
    if (r.ok && r.action) onBookmarkToggled?.(r.action);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/community/post/${post.id}` as any)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: post.pinned ? '#FFD56B' : '#DCE0E8',
        borderBottomWidth: 4,
        borderBottomColor: post.pinned ? '#F2C14E' : '#DCE0E8',
        padding: 14,
        marginBottom: 10,
      }}
    >
      {post.pinned && (
        <Mono style={{ fontSize: 9, color: '#F2C14E', letterSpacing: 1.4, marginBottom: 6 }}>
          📌 SABİTLENMİŞ
        </Mono>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        {post.author_avatar_url ? (
          <Image
            source={{ uri: post.author_avatar_url }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
        ) : (
          <Avatar
            initials={(post.author_username ?? post.author_full_name ?? '??').slice(0, 2).toUpperCase()}
            color="#0F1E47"
            size={36}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.body700, fontSize: 13, color: '#0E1116' }}>
            {post.author_full_name ?? post.author_username ?? 'Anonim'}
          </Text>
          <Mono style={{ fontSize: 10, color: '#8A93A6', letterSpacing: 0.8 }}>
            {relTime(post.created_at)}
            {post.edited_at ? ' · düzenlendi' : ''}
          </Mono>
        </View>
      </View>

      <RichText content={post.content} />


      {/* Image grid */}
      {post.image_urls.length > 0 && (
        <ImageGrid urls={post.image_urls} />
      )}

      {/* Reaction toolbar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#EDEFF3',
        }}
      >
        {REACTION_KINDS.map((kind) => {
          const active = myReactions?.has(kind);
          return (
            <TouchableOpacity
              key={kind}
              onPress={() => void onReact(kind)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: active ? '#FFE4E7' : '#F4F5F8',
              }}
            >
              <Text style={{ fontSize: 14 }}>{reactionEmoji(kind)}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 13 }}>💬</Text>
          <Mono style={{ fontSize: 12, color: '#5A6478' }}>{post.comment_count}</Mono>
        </View>
        {post.reaction_count > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 10 }}>
            <Text style={{ fontSize: 13 }}>♥</Text>
            <Mono style={{ fontSize: 12, color: '#5A6478' }}>{post.reaction_count}</Mono>
          </View>
        )}
        <TouchableOpacity onPress={onBookmark} style={{ marginLeft: 10, padding: 2 }}>
          <Text style={{ fontSize: 16 }}>{bookmarked ? '🔖' : '📑'}</Text>
        </TouchableOpacity>
        {!isOwn && (
          <TouchableOpacity
            onPress={(e) => {
              e?.stopPropagation?.();
              setReportOpen(true);
            }}
            style={{ marginLeft: 8, padding: 2 }}
          >
            <Text style={{ fontSize: 14 }}>🚩</Text>
          </TouchableOpacity>
        )}
      </View>

      <ReportDialog
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="community_post"
        targetId={post.id}
      />
    </TouchableOpacity>
  );
}

function ImageGrid({ urls }: { urls: string[] }) {
  const cardWidth = SCREEN_W - 32 - 28; // outer padding 16+16, card padding 14+14
  if (urls.length === 1) {
    return (
      <Image
        source={{ uri: urls[0] }}
        style={{ width: cardWidth, height: cardWidth * 0.6, borderRadius: 10, marginTop: 10 }}
        contentFit="cover"
      />
    );
  }
  if (urls.length === 2) {
    const s = (cardWidth - 4) / 2;
    return (
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 10 }}>
        {urls.map((u) => (
          <Image
            key={u}
            source={{ uri: u }}
            style={{ width: s, height: s, borderRadius: 8 }}
            contentFit="cover"
          />
        ))}
      </View>
    );
  }
  // 3-4 image: 2x2 grid
  const s = (cardWidth - 4) / 2;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
      {urls.slice(0, 4).map((u, i) => (
        <Image
          key={u + i}
          source={{ uri: u }}
          style={{ width: s, height: s, borderRadius: 8 }}
          contentFit="cover"
        />
      ))}
    </View>
  );
}
