'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBannedWord } from '@/lib/moderation/actions';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { EditBannedWordButton } from '@/components/forms/BannedWordForm';

export function BannedWordRowActions({ row, canDelete }: { row: any; canDelete: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const doDelete = () => {
    startTransition(async () => {
      const r = await deleteBannedWord(row.id);
      if (r.ok) {
        toast.success('Silindi');
        setOpen(false);
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  return (
    <div className="flex justify-end gap-1 items-center">
      <EditBannedWordButton row={row} />
      {canDelete && (
        <Button size="sm" variant="ghost" onClick={() => setOpen(true)} disabled={pending}>
          <Trash2 className="w-4 h-4 text-airspeak-red" />
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sil onayı</DialogTitle>
            <DialogDescription>
              <strong>{row.word}</strong> kalıcı silinir. Geçmiş post/yorumlar etkilenmez,
              yeni içerikler artık bu kelime için filtre edilmez.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={pending}>
              {pending ? 'Siliniyor…' : 'Evet, sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
