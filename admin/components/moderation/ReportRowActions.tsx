'use client';

/**
 * ReportRowActions — content_flags satırındaki aksiyonlar.
 *
 * - Hide content (post/comment için RPC çağırır → mod_warning push)
 * - Resolve (status='resolved') with note
 * - Dismiss (status='dismissed') — false positive
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  resolveReport,
  hideCommunityPost,
  hideCommunityComment,
} from '@/lib/moderation/actions';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { toast } from 'sonner';
import { EyeOff, Check, X } from 'lucide-react';

interface Props {
  row: any;
}

export function ReportRowActions({ row }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resolveOpen, setResolveOpen] = useState(false);
  const [hideAndResolveOpen, setHideAndResolveOpen] = useState(false);
  const [note, setNote] = useState('');

  const isPending = row.status === 'pending';
  const isPost = row.content_type === 'community_post';
  const isComment = row.content_type === 'community_comment';
  const canHide = isPost || isComment;

  const dismiss = () => {
    startTransition(async () => {
      const r = await resolveReport({ id: row.id, status: 'dismissed' });
      if (r.ok) {
        toast.success('Reddedildi');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  const resolveOnly = () => {
    startTransition(async () => {
      const r = await resolveReport({
        id: row.id,
        status: 'resolved',
        reviewerNote: note.trim() || undefined,
      });
      if (r.ok) {
        toast.success('Çözüldü');
        setResolveOpen(false);
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  const hideAndResolve = () => {
    startTransition(async () => {
      const hideRes = isPost
        ? await hideCommunityPost(row.content_id)
        : await hideCommunityComment(row.content_id);
      if (!hideRes.ok) {
        toast.error(hideRes.error ?? 'Gizlenemedi');
        return;
      }
      const r = await resolveReport({
        id: row.id,
        status: 'resolved',
        reviewerNote: note.trim() || undefined,
      });
      if (r.ok) {
        toast.success('Gizlendi + çözüldü');
        setHideAndResolveOpen(false);
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  if (!isPending) {
    return (
      <span className="text-xs text-muted-foreground">
        {row.reviewer_id ? 'Mod review' : 'Çözülmüş'}
      </span>
    );
  }

  return (
    <div className="flex justify-end gap-1 items-center">
      {canHide && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setHideAndResolveOpen(true)}
          disabled={pending}
          title="İçeriği gizle + çöz"
        >
          <EyeOff className="w-4 h-4" />
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setResolveOpen(true)}
        disabled={pending}
        title="Çöz (içeriği değiştirme)"
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={dismiss} disabled={pending} title="Reddet">
        <X className="w-4 h-4" />
      </Button>

      {/* Resolve only */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raporu çöz</DialogTitle>
            <DialogDescription>
              İçerik silinmez/gizlenmez — sadece flag status='resolved'. Not opsiyonel.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reviewer notu (opsiyonel)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResolveOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button onClick={resolveOnly} disabled={pending}>
              {pending ? 'Kaydediliyor…' : 'Çöz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hide and resolve */}
      <Dialog open={hideAndResolveOpen} onOpenChange={setHideAndResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İçeriği gizle + raporu çöz</DialogTitle>
            <DialogDescription>
              İçerik <strong>hidden</strong> olur (kullanıcıya bildirim gider). Geri alınabilir.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reviewer notu (opsiyonel)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setHideAndResolveOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button variant="destructive" onClick={hideAndResolve} disabled={pending}>
              {pending ? 'İşleniyor…' : 'Gizle + Çöz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
