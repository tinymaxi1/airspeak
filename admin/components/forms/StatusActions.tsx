'use client';

import { useState, useTransition } from 'react';
import { setStatus, deleteRow, type ContentTable } from '@/lib/content/actions';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { toast } from 'sonner';
import { Trash2, Send, Archive, RotateCcw, Eye } from 'lucide-react';

type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

interface StatusActionsProps {
  table: ContentTable;
  id: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  /** Sayfalar revalidate edilmek için */
  revalidate?: string | string[];
  /** Silme onayında gösterilecek başlık (örn lesson title) */
  label?: string;
  /** Sadece super_admin görebilir */
  canDelete?: boolean;
  /** Silindikten sonra yönlendirilecek path */
  onDeleted?: () => void;
}

export function StatusActions({
  table,
  id,
  status,
  revalidate = '/',
  label,
  canDelete = false,
  onDeleted,
}: StatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const change = (newStatus: 'draft' | 'review' | 'published' | 'archived') => {
    startTransition(async () => {
      const r = await setStatus(table, id, newStatus, revalidate);
      if (r.ok) {
        toast.success(STATUS_LABELS[newStatus]);
      } else {
        toast.error(r.error);
      }
    });
  };

  const doDelete = () => {
    startTransition(async () => {
      const r = await deleteRow(table, id, revalidate);
      if (r.ok) {
        toast.success('Silindi');
        setConfirmOpen(false);
        onDeleted?.();
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'draft' && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => change('review')}>
          <Eye className="w-3.5 h-3.5" /> İncelemeye gönder
        </Button>
      )}
      {(status === 'draft' || status === 'review') && (
        <Button size="sm" variant="green" disabled={isPending} onClick={() => change('published')}>
          <Send className="w-3.5 h-3.5" /> Yayınla
        </Button>
      )}
      {status === 'published' && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => change('draft')}>
          <RotateCcw className="w-3.5 h-3.5" /> Yayından kaldır
        </Button>
      )}
      {(status === 'draft' || status === 'review' || status === 'published') && (
        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => change('archived')}>
          <Archive className="w-3.5 h-3.5" /> Arşivle
        </Button>
      )}
      {status === 'archived' && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => change('draft')}>
          <RotateCcw className="w-3.5 h-3.5" /> Geri yükle (taslak)
        </Button>
      )}

      {canDelete && (
        <>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Sil
          </Button>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Silmek istediğine emin misin?</DialogTitle>
                <DialogDescription>
                  {label ? `"${label}" ` : ''}
                  ve tüm ilişkili veriler kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Vazgeç
                </Button>
                <Button variant="destructive" disabled={isPending} onClick={doDelete}>
                  Evet, sil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

const STATUS_LABELS = {
  draft: 'Taslak yapıldı',
  review: 'İncelemeye gönderildi',
  published: '✅ Yayınlandı — mobil app içinde anında görünür',
  archived: 'Arşivlendi',
} as const;

