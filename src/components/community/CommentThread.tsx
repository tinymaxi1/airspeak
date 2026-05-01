/**
 * CommentThread — flat comment listesini thread tree'ye çevirip render eder.
 *
 * - Backend'de `depth` 0/1/2 olarak hesaplanmış (max 3 derin).
 * - depth=2 yorumun reply'ı backend'de yine depth=2 (flat tutulur).
 * - Bu component children grouping'i parent_comment_id'ye göre yapar,
 *   render'da CommentItem'ı recursive child geçirerek çağırır.
 */
import { useMemo } from 'react';
import {
  type CommunityComment,
  type ReactionKind,
} from '@/features/community/api';
import { CommentItem } from './CommentItem';

interface Props {
  comments: CommunityComment[];
  myReactions: Map<string, Set<ReactionKind>>;
  onReactionToggled: (kind: ReactionKind, action: 'added' | 'removed') => void;
  onReply: (parentId: string) => void;
  onMutated: () => void;
}

export function CommentThread({
  comments,
  myReactions,
  onReactionToggled,
  onReply,
  onMutated,
}: Props) {
  // Group: parent_comment_id (null = top-level) → children []
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, CommunityComment[]>();
    for (const c of comments) {
      const key = c.parent_comment_id ?? null;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [comments]);

  function renderNode(c: CommunityComment): React.ReactNode {
    const kids = childrenByParent.get(c.id) ?? [];
    return (
      <CommentItem
        key={c.id}
        comment={c}
        myReactions={myReactions.get(c.id)}
        onReactionToggled={onReactionToggled}
        onReply={onReply}
        onMutated={onMutated}
      >
        {kids.map(renderNode)}
      </CommentItem>
    );
  }

  const top = childrenByParent.get(null) ?? [];
  return <>{top.map(renderNode)}</>;
}
