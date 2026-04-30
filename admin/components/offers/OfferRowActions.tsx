'use client';

/**
 * OfferRowActions — list satırındaki aksiyonlar.
 * Edit · Aktif/Pasif toggle · Push broadcast · Delete (super_admin)
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setOfferActive, deleteOffer, broadcastOfferPush } from '@/lib/offers/actions';
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
import { Send, Trash2, Power, PowerOff } from 'lucide-react';
import { EditOfferButton } from '@/components/forms/OfferForm';

interface Props {
  row: any;
  canDelete?: boolean;
}

export function OfferRowActions({ row, canDelete = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [delOpen, setDelOpen] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const router = useRouter();

  const toggle = () => {
    startTransition(async () => {
      const r = await setOfferActive(row.id, !row.is_active);
      if (r.ok) {
        toast.success(!row.is_active ? 'Aktif' : 'Pasif');
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  const broadcast = () => {
    startTransition(async () => {
      const r = await broadcastOfferPush(row.id);
      if (r.ok) {
        toast.success(`Push gönderildi: ${r.sent ?? 0} kullanıcı`);
        setPushOpen(false);
      } else toast.error(r.error ?? 'Hata');
    });
  };

  const doDelete = () => {
    startTransition(async () => {
      const r = await deleteOffer(row.id);
      if (r.ok) {
        toast.success('Silindi');
        setDelOpen(false);
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  };

  return (
    <div className="flex justify-end gap-1 items-center">
      <EditOfferButton row={row} />

      <Button size="sm" variant="ghost" onClick={toggle} disabled={pending} title={row.is_active ? 'Pasif yap' : 'Aktif yap'}>
        {row.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => setPushOpen(true)}
        disabled={pending || !row.is_active}
        title={row.is_active ? 'Push gönder' : 'Önce aktif et'}
      >
        <Send className="w-4 h-4" />
      </Button>

      {canDelete && (
        <Button size="sm" variant="ghost" onClick={() => setDelOpen(true)} disabled={pending}>
          <Trash2 className="w-4 h-4 text-airspeak-red" />
        </Button>
      )}

      {/* Push confirm */}
      <Dialog open={pushOpen} onOpenChange={setPushOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push broadcast onayı</DialogTitle>
            <DialogDescription>
              <strong>{row.title_tr}</strong> push'unu <strong>{row.audience}</strong> segmentine gönder. Geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPushOpen(false)} disabled={pending}>İptal</Button>
            <Button onClick={broadcast} disabled={pending}>
              {pending ? 'Gönderiliyor…' : 'Gönder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sil onayı</DialogTitle>
            <DialogDescription>
              <strong>{row.code}</strong> kalıcı silinir. Mobile cache 5dk sonrasına yansır.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDelOpen(false)} disabled={pending}>İptal</Button>
            <Button variant="destructive" onClick={doDelete} disabled={pending}>
              {pending ? 'Siliniyor…' : 'Evet, sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
