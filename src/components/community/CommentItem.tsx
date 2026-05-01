/**
 * CommentItem — tek bir yorumu render eder.
 *
 * - Avatar + author + relative time
 * - Content
 * - 4 reaction toggle (👍 ❤️ 🎯 🤔)
 * - Reply (depth < 2 ise, 2 → flat replies parent ile aynı seviyede)
 * - Edit / Delete (kendisininkinde)
 *
 * Recursive değil — `children` prop'una alt-yorumlar verilir (CommentThread render eder).
 * Indent: depth * 16px sol margin.
 */
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {
  type CommunityComment,
  type ReactionKind,
  REACTION_KINDS,
  reactionEmoji,
  reactToggle,
  editComment,
  deleteComment,
} from '@/features/community/api';
import { useAuthStore } from '@/stores/authStore';
import { FONTS, Avatar, Mono } from '@/components/airspeak';
import { RichText } from './RichText';

function relTime(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}sn`;
  if (d < 3600) return `${Math.floor(d / 60)}dk`;
  if (d < 86400) return `${Math.floor(d / 3600)}sa`;
  if (d < 7 * 86400) return `${Math.floor(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

interface Props {
  comment: CommunityComment;
  myReactions?: Set<ReactionKind>;
  onReactionToggled?: (kind: ReactionKind, action: 'added' | 'removed') => void;
  onReply?: (parentId: string) => void;
  onMutated?: () => void;
  /** Render altındaki child yorumlar */
  children?: React.ReactNode;
}

export function CommentItem({
  comment,
  myReactions,
  onReactionToggled,
  onReply,
  onMutated,
  children,
}: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const isOwn = userId === comment.author_id;
  const canReply = (onReply !== undefined) && comment.depth < 2;
  // Indent: 0/16/32 — depth 0/1/2.
  const indent = comment.depth * 16;

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  async function onReact(kind: ReactionKind) {
    if (!userId) return;
    const r = await reactToggle({ targetType: 'comment', targetId: comment.id, kind });
    if (r.ok && r.action) onReactionToggled?.(kind, r.action);
  }

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setBusy(true);
    const r = await editComment({ commentId: comment.id, content: trimmed });
    setBusy(false);
    if (!r.ok) {
      Alert.alert('Hata', r.error ?? 'Düzenlenemedi');
      return;
    }
    setEditing(false);
    onMutated?.();
  }

  function confirmDelete() {
    Alert.alert('Yorumu sil?', 'Geri alınamaz.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const r = await deleteComment(comment.id);
          if (r.ok) onMutated?.();
          else Alert.alert('Hata', r.error ?? 'Silinemedi');
        },
      },
    ]);
  }

  return (
    <View style={{ marginLeft: indent, marginBottom: 10 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#EDEFF3',
          padding: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {comment.author_avatar_url ? (
            <Image
              source={{ uri: comment.author_avatar_url }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
          ) : (
            <Avatar
              initials={(comment.author_username ?? comment.author_full_name ?? '??')
                .slice(0, 2)
                .toUpperCase()}
              color="#0F1E47"
              size={28}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.body700, fontSize: 12, color: '#0E1116' }}>
              {comment.author_full_name ?? comment.author_username ?? 'Anonim'}
            </Text>
            <Mono style={{ fontSize: 9, color: '#8A93A6', letterSpacing: 0.7 }}>
              {relTime(comment.created_at)}
              {comment.edited_at ? ' · düzenlendi' : ''}
            </Mono>
          </View>
        </View>

        {editing ? (
          <View>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              style={{
                fontFamily: FONTS.body,
                fontSize: 13,
                color: '#0E1116',
                minHeight: 60,
                borderWidth: 1,
                borderColor: '#DCE0E8',
                borderRadius: 8,
                padding: 8,
                lineHeight: 19,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setEditText(comment.content);
                }}
                disabled={busy}
              >
                <Mono style={{ fontSize: 11, color: '#5A6478', letterSpacing: 0.8 }}>İPTAL</Mono>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} disabled={busy}>
                <Mono style={{ fontSize: 11, color: '#E63946', letterSpacing: 0.8 }}>
                  {busy ? 'KAYDEDILIYOR' : 'KAYDET'}
                </Mono>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <RichText
            content={comment.content}
            baseStyle={{ fontSize: 13, lineHeight: 19 }}
          />
        )}

        {!editing && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#F4F5F8',
            }}
          >
            {REACTION_KINDS.map((kind) => {
              const active = myReactions?.has(kind);
              return (
                <TouchableOpacity
                  key={kind}
                  onPress={() => void onReact(kind)}
                  style={{
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: active ? '#FFE4E7' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{reactionEmoji(kind)}</Text>
                </TouchableOpacity>
              );
            })}
            {comment.reaction_count > 0 && (
              <Mono style={{ fontSize: 10, color: '#8A93A6', marginLeft: 4 }}>
                {comment.reaction_count}
              </Mono>
            )}
            <View style={{ flex: 1 }} />
            {canReply && (
              <TouchableOpacity onPress={() => onReply?.(comment.id)}>
                <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.8 }}>
                  YANITLA
                </Mono>
              </TouchableOpacity>
            )}
            {isOwn && (
              <>
                <TouchableOpacity onPress={() => setEditing(true)} style={{ marginLeft: 8 }}>
                  <Mono style={{ fontSize: 10, color: '#5A6478', letterSpacing: 0.8 }}>
                    DÜZENLE
                  </Mono>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDelete} style={{ marginLeft: 8 }}>
                  <Mono style={{ fontSize: 10, color: '#E63946', letterSpacing: 0.8 }}>SIL</Mono>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {children}
    </View>
  );
}
