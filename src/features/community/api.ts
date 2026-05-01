/**
 * Community DB layer — groups + posts + comments + reactions.
 *
 * Hooks (TTL 2dk module cache):
 *   useGroups (privacy + search)
 *   useMyGroups
 *   useGroup(slug)
 *   useGroupMembers(groupId)
 *   usePosts(groupId) — realtime subscribe
 *   usePost(postId)
 *   useComments(postId) — flat list, depth field ile thread render
 *   useUserReactions(targetType, targetIds[]) — toggle UI
 *
 * RPC wrappers — Sprint 6.A.1 backend ile birebir.
 *
 * Image upload: post-images bucket, owner folder /{userId}/post_{ts}_N.jpg.
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

// ─── Types ────────────────────────────────────────────────────────────────
export type GroupPrivacy = 'open' | 'closed' | 'secret' | 'premium';
export type MemberRole = 'admin' | 'mod' | 'member';
export type MemberStatus = 'active' | 'pending' | 'banned';
export type ReactionKind = 'like' | 'love' | 'goal' | 'thinking';
export type TargetType = 'post' | 'comment';

export interface CommunityGroup {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string;
  banner_url: string | null;
  privacy: GroupPrivacy;
  capacity: number;
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface CommunityPost {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  image_urls: string[];
  pinned: boolean;
  comment_count: number;
  reaction_count: number;
  created_at: string;
  edited_at: string | null;
  // Author profile join
  author_username?: string | null;
  author_full_name?: string | null;
  author_avatar_url?: string | null;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  depth: number;
  reaction_count: number;
  created_at: string;
  edited_at: string | null;
  author_username?: string | null;
  author_full_name?: string | null;
  author_avatar_url?: string | null;
}

export interface ReactionRow {
  target_type: TargetType;
  target_id: string;
  kind: ReactionKind;
}

const REACTION_EMOJI: Record<ReactionKind, string> = {
  like: '👍',
  love: '❤️',
  goal: '🎯',
  thinking: '🤔',
};

export const REACTION_KINDS: ReactionKind[] = ['like', 'love', 'goal', 'thinking'];
export function reactionEmoji(kind: ReactionKind): string {
  return REACTION_EMOJI[kind];
}

const TTL_MS = 2 * 60 * 1000;

// ─── useGroups (browse, includes my groups) ───────────────────────────────
let groupsCache: { rows: CommunityGroup[]; loadedAt: number } | null = null;

async function fetchGroups(privacy?: GroupPrivacy[]): Promise<CommunityGroup[]> {
  let q = (supabase as any)
    .from('community_groups')
    .select('*')
    .order('member_count', { ascending: false })
    .limit(100);
  if (privacy && privacy.length) q = q.in('privacy', privacy);
  const { data, error } = await q;
  if (error) return [];
  return (data as CommunityGroup[]) ?? [];
}

export function useGroups(privacy?: GroupPrivacy[]): {
  rows: CommunityGroup[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CommunityGroup[]>(groupsCache?.rows ?? []);
  const [loading, setLoading] = useState(!groupsCache);

  const refresh = useCallback(async () => {
    const fresh = await fetchGroups(privacy);
    groupsCache = { rows: fresh, loadedAt: Date.now() };
    setRows(fresh);
    setLoading(false);
  }, [privacy?.join(',')]);

  useEffect(() => {
    let mounted = true;
    if (groupsCache && Date.now() - groupsCache.loadedAt < TTL_MS) {
      setRows(groupsCache.rows);
      setLoading(false);
      return;
    }
    void refresh().catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { rows, loading, refresh };
}

// ─── useMyGroups ──────────────────────────────────────────────────────────
async function fetchMyGroups(userId: string): Promise<CommunityGroup[]> {
  const { data } = await (supabase as any)
    .from('community_group_members')
    .select('community_groups!inner(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  return ((data as any[]) ?? []).map((r) => r.community_groups as CommunityGroup);
}

export function useMyGroups(userId: string | null | undefined): {
  rows: CommunityGroup[];
  loading: boolean;
} {
  const [rows, setRows] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    void fetchMyGroups(userId).then((r) => {
      if (mounted) {
        setRows(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { rows, loading };
}

// ─── useGroup (single by slug) ────────────────────────────────────────────
export function useGroup(slug: string | null | undefined): {
  group: CommunityGroup | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [loading, setLoading] = useState(!!slug);

  const refresh = useCallback(async () => {
    if (!slug) return;
    const { data } = await (supabase as any)
      .from('community_groups')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    setGroup(data as CommunityGroup | null);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setGroup(null);
      setLoading(false);
      return;
    }
    void refresh();
  }, [slug, refresh]);

  return { group, loading, refresh };
}

// ─── useGroupMember (current user's relation to group) ───────────────────
export function useGroupMembership(
  groupId: string | null | undefined,
  userId: string | null | undefined,
): { membership: GroupMember | null; loading: boolean; refresh: () => Promise<void> } {
  const [membership, setMembership] = useState<GroupMember | null>(null);
  const [loading, setLoading] = useState(!!groupId && !!userId);

  const refresh = useCallback(async () => {
    if (!groupId || !userId) {
      setMembership(null);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('community_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();
    setMembership(data as GroupMember | null);
    setLoading(false);
  }, [groupId, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { membership, loading, refresh };
}

// ─── usePosts (group feed, realtime) ──────────────────────────────────────
export function usePosts(groupId: string | null | undefined): {
  rows: CommunityPost[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(!!groupId);

  const refresh = useCallback(async () => {
    if (!groupId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('community_posts')
      .select(
        'id, group_id, author_id, content, image_urls, pinned, comment_count, reaction_count, created_at, edited_at, author:profiles!community_posts_author_id_fkey(username, full_name, avatar_url)',
      )
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    const mapped = ((data as any[]) ?? []).map(
      (r): CommunityPost => ({
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
      }),
    );
    setRows(mapped);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    void refresh();
    if (!groupId) return;
    const channel = supabase
      .channel(`community_posts_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [groupId, refresh]);

  return { rows, loading, refresh };
}

// ─── useComments (flat list, ordered) ────────────────────────────────────
export function useComments(postId: string | null | undefined): {
  rows: CommunityComment[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(!!postId);

  const refresh = useCallback(async () => {
    if (!postId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('community_comments')
      .select(
        'id, post_id, author_id, parent_comment_id, content, depth, reaction_count, created_at, edited_at, author:profiles!community_comments_author_id_fkey(username, full_name, avatar_url)',
      )
      .eq('post_id', postId)
      .eq('status', 'active')
      .order('depth', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(500);
    const mapped = ((data as any[]) ?? []).map(
      (r): CommunityComment => ({
        id: r.id,
        post_id: r.post_id,
        author_id: r.author_id,
        parent_comment_id: r.parent_comment_id,
        content: r.content,
        depth: r.depth,
        reaction_count: r.reaction_count ?? 0,
        created_at: r.created_at,
        edited_at: r.edited_at,
        author_username: r.author?.username ?? null,
        author_full_name: r.author?.full_name ?? null,
        author_avatar_url: r.author?.avatar_url ?? null,
      }),
    );
    setRows(mapped);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// ─── useUserReactions (toggle UI için) ───────────────────────────────────
export function useUserReactions(
  userId: string | null | undefined,
  targetType: TargetType,
  targetIds: string[],
): { byTarget: Map<string, Set<ReactionKind>>; refresh: () => Promise<void> } {
  const [byTarget, setByTarget] = useState<Map<string, Set<ReactionKind>>>(new Map());

  const idsKey = targetIds.join(',');

  const refresh = useCallback(async () => {
    if (!userId || targetIds.length === 0) {
      setByTarget(new Map());
      return;
    }
    const { data } = await (supabase as any)
      .from('community_reactions')
      .select('target_id, kind')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .in('target_id', targetIds);
    const map = new Map<string, Set<ReactionKind>>();
    for (const r of (data as any[]) ?? []) {
      const set = map.get(r.target_id) ?? new Set<ReactionKind>();
      set.add(r.kind as ReactionKind);
      map.set(r.target_id, set);
    }
    setByTarget(map);
  }, [userId, targetType, idsKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { byTarget, refresh };
}

// ═══════════════════════════════════════════════════════════════════════
// RPC WRAPPERS
// ═══════════════════════════════════════════════════════════════════════

export async function createGroup(args: {
  slug: string;
  name: string;
  description?: string;
  emoji?: string;
  privacy: GroupPrivacy;
  capacity?: number;
  passcode?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await (supabase as any).rpc('create_community_group', {
    p_slug: args.slug,
    p_name: args.name,
    p_description: args.description ?? null,
    p_emoji: args.emoji ?? '✈️',
    p_privacy: args.privacy,
    p_capacity: args.capacity ?? 100,
    p_passcode: args.passcode ?? null,
  });
  if (error) return { ok: false, error: error.message };
  groupsCache = null;
  return data;
}

export async function joinGroup(args: {
  groupId: string;
  passcode?: string;
}): Promise<{
  ok: boolean;
  status?: 'active' | 'pending';
  already_joined?: boolean;
  pending?: boolean;
  error?: string;
}> {
  const { data, error } = await (supabase as any).rpc('join_community_group', {
    p_group_id: args.groupId,
    p_passcode: args.passcode ?? null,
  });
  if (error) return { ok: false, error: error.message };
  groupsCache = null;
  return data;
}

export async function approveJoin(
  memberId: string,
  approve: boolean,
): Promise<{ ok: boolean; approved?: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('approve_community_join', {
    p_member_id: memberId,
    p_approve: approve,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function leaveGroup(groupId: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('leave_community_group', {
    p_group_id: groupId,
  });
  if (error) return { ok: false, error: error.message };
  groupsCache = null;
  return data;
}

export async function banMember(args: {
  groupId: string;
  userId: string;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('ban_community_member', {
    p_group_id: args.groupId,
    p_user_id: args.userId,
    p_reason: args.reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function createPost(args: {
  groupId: string;
  content: string;
  imageUrls?: string[];
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await (supabase as any).rpc('create_community_post', {
    p_group_id: args.groupId,
    p_content: args.content,
    p_image_urls: args.imageUrls ?? [],
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function editPost(args: {
  postId: string;
  content: string;
  imageUrls?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('edit_community_post', {
    p_post_id: args.postId,
    p_content: args.content,
    p_image_urls: args.imageUrls ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function deletePost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('delete_community_post', {
    p_post_id: postId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function pinPost(
  postId: string,
  pin: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('pin_community_post', {
    p_post_id: postId,
    p_pin: pin,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function createComment(args: {
  postId: string;
  content: string;
  parentCommentId?: string | null;
}): Promise<{ ok: boolean; id?: string; depth?: number; error?: string }> {
  const { data, error } = await (supabase as any).rpc('create_community_comment', {
    p_post_id: args.postId,
    p_content: args.content,
    p_parent_comment_id: args.parentCommentId ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function editComment(args: {
  commentId: string;
  content: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('edit_community_comment', {
    p_comment_id: args.commentId,
    p_content: args.content,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function deleteComment(commentId: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await (supabase as any).rpc('delete_community_comment', {
    p_comment_id: commentId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

export async function reactToggle(args: {
  targetType: TargetType;
  targetId: string;
  kind: ReactionKind;
}): Promise<{ ok: boolean; action?: 'added' | 'removed'; error?: string }> {
  const { data, error } = await (supabase as any).rpc('react_community', {
    p_target_type: args.targetType,
    p_target_id: args.targetId,
    p_kind: args.kind,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// ═══════════════════════════════════════════════════════════════════════
// POST IMAGE UPLOAD
// ═══════════════════════════════════════════════════════════════════════

const POST_BUCKET = 'post-images';
const POST_TARGET_W = 1080;

export async function uploadPostImage(
  userId: string,
  fileUri: string,
  index: number,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Resize 1080w + JPEG q=0.85
  const manipulated = await ImageManipulator.manipulateAsync(
    fileUri,
    [{ resize: { width: POST_TARGET_W } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );
  const path = `${userId}/post_${Date.now()}_${index}.jpg`;
  const res = await fetch(manipulated.uri);
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(POST_BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
  if (error) return { ok: false, error: error.message };
  const { data: pub } = supabase.storage.from(POST_BUCKET).getPublicUrl(data.path);
  return { ok: true, url: pub.publicUrl };
}

export async function uploadPostImages(
  userId: string,
  fileUris: string[],
): Promise<{ ok: boolean; urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];
  for (let i = 0; i < fileUris.length; i++) {
    const r = await uploadPostImage(userId, fileUris[i]!, i);
    if (r.ok && r.url) urls.push(r.url);
    else errors.push(r.error ?? 'unknown');
  }
  return { ok: errors.length === 0, urls, errors };
}

// ═══════════════════════════════════════════════════════════════════════
// 6.B.2 — Bookmarks + Hashtags + Search
// ═══════════════════════════════════════════════════════════════════════

export async function toggleBookmark(
  postId: string,
): Promise<{ ok: boolean; action?: 'added' | 'removed'; error?: string }> {
  const { data, error } = await (supabase as any).rpc('toggle_community_bookmark', {
    p_post_id: postId,
  });
  if (error) return { ok: false, error: error.message };
  return data;
}

// Set of post IDs that the user has bookmarked (for toggle UI)
export function useBookmarkSet(
  userId: string | null | undefined,
  postIds: string[],
): { bookmarked: Set<string>; refresh: () => Promise<void> } {
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const idsKey = postIds.join(',');

  const refresh = useCallback(async () => {
    if (!userId || postIds.length === 0) {
      setBookmarked(new Set());
      return;
    }
    const { data } = await (supabase as any)
      .from('community_bookmarks')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
    const set = new Set<string>();
    for (const r of (data as any[]) ?? []) set.add(r.post_id);
    setBookmarked(set);
  }, [userId, idsKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { bookmarked, refresh };
}

// Kullanıcının bookmark'ladığı tüm postlar (full feed)
export function useMyBookmarks(userId: string | null | undefined): {
  rows: CommunityPost[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const refresh = useCallback(async () => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('community_bookmarks')
      .select(
        'created_at, post:community_posts!inner(id, group_id, author_id, content, image_urls, pinned, comment_count, reaction_count, created_at, edited_at, status, author:profiles!community_posts_author_id_fkey(username, full_name, avatar_url))',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    const mapped = ((data as any[]) ?? [])
      .filter((r) => r.post && r.post.status === 'active')
      .map((r): CommunityPost => {
        const p = r.post;
        return {
          id: p.id,
          group_id: p.group_id,
          author_id: p.author_id,
          content: p.content,
          image_urls: p.image_urls ?? [],
          pinned: !!p.pinned,
          comment_count: p.comment_count ?? 0,
          reaction_count: p.reaction_count ?? 0,
          created_at: p.created_at,
          edited_at: p.edited_at,
          author_username: p.author?.username ?? null,
          author_full_name: p.author?.full_name ?? null,
          author_avatar_url: p.author?.avatar_url ?? null,
        };
      });
    setRows(mapped);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

export interface TrendingHashtag {
  tag: string;
  usage_count: number;
  last_used_at: string;
}

export function useTrendingHashtags(limit = 20, windowDays = 7): {
  rows: TrendingHashtag[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await (supabase as any).rpc('get_trending_hashtags', {
      p_limit: limit,
      p_window_days: windowDays,
    });
    setRows((data as TrendingHashtag[]) ?? []);
    setLoading(false);
  }, [limit, windowDays]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// Hashtag feed
export function usePostsByHashtag(tag: string | null | undefined, limit = 50): {
  rows: CommunityPost[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [rows, setRows] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(!!tag);

  const refresh = useCallback(async () => {
    if (!tag) {
      setRows([]);
      setLoading(false);
      return;
    }
    // Doğrudan SQL: get_posts_by_hashtag SETOF community_posts döndürür ama
    // author join'i join'le ekleyelim (extra fetch).
    const { data } = await (supabase as any)
      .from('community_post_hashtags')
      .select(
        'post:community_posts!inner(id, group_id, author_id, content, image_urls, pinned, comment_count, reaction_count, created_at, edited_at, status, author:profiles!community_posts_author_id_fkey(username, full_name, avatar_url))',
      )
      .eq('tag', tag.toLowerCase())
      .order('post(created_at)', { ascending: false })
      .limit(limit);

    const mapped = ((data as any[]) ?? [])
      .filter((r) => r.post && r.post.status === 'active')
      .map((r): CommunityPost => {
        const p = r.post;
        return {
          id: p.id,
          group_id: p.group_id,
          author_id: p.author_id,
          content: p.content,
          image_urls: p.image_urls ?? [],
          pinned: !!p.pinned,
          comment_count: p.comment_count ?? 0,
          reaction_count: p.reaction_count ?? 0,
          created_at: p.created_at,
          edited_at: p.edited_at,
          author_username: p.author?.username ?? null,
          author_full_name: p.author?.full_name ?? null,
          author_avatar_url: p.author?.avatar_url ?? null,
        };
      });
    setRows(mapped);
    setLoading(false);
  }, [tag, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, loading, refresh };
}

// Search community posts (ILIKE basit, FTS 6.D'de)
export async function searchPosts(query: string, limit = 50): Promise<CommunityPost[]> {
  if (!query.trim()) return [];
  const { data } = await (supabase as any)
    .from('community_posts')
    .select(
      'id, group_id, author_id, content, image_urls, pinned, comment_count, reaction_count, created_at, edited_at, status, author:profiles!community_posts_author_id_fkey(username, full_name, avatar_url)',
    )
    .eq('status', 'active')
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  return ((data as any[]) ?? []).map(
    (p): CommunityPost => ({
      id: p.id,
      group_id: p.group_id,
      author_id: p.author_id,
      content: p.content,
      image_urls: p.image_urls ?? [],
      pinned: !!p.pinned,
      comment_count: p.comment_count ?? 0,
      reaction_count: p.reaction_count ?? 0,
      created_at: p.created_at,
      edited_at: p.edited_at,
      author_username: p.author?.username ?? null,
      author_full_name: p.author?.full_name ?? null,
      author_avatar_url: p.author?.avatar_url ?? null,
    }),
  );
}
