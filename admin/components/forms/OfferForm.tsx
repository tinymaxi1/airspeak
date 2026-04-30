'use client';

/**
 * OfferForm — limited offer create/edit Dialog.
 *
 * - Pricing: tier override + discount_percent (en az biri zorunlu)
 * - Audience: 6 segment
 * - Window: starts_at + ends_at (datetime-local, UTC ISO çevirisi)
 * - Push: title_tr + body_tr (broadcast butonu için)
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { createOffer, updateOffer, type OfferAudience, type OfferPayload } from '@/lib/offers/actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const AUDIENCE_OPTIONS: { id: OfferAudience; label: string; help: string }[] = [
  { id: 'all', label: 'Herkes', help: 'Hiçbir filtre' },
  { id: 'free', label: 'Free kullanıcı', help: 'Premium yok + trial yok' },
  { id: 'trial_used', label: 'Trial bitti', help: 'Trial kullanmış, premium yok' },
  { id: 'expired_trial', label: 'Expired trial 7gün+', help: 'Win-back için' },
  { id: 'active_premium', label: 'Aktif Pro', help: 'Upsell için' },
  { id: 'inactive_7d', label: 'İnaktif 7gün+', help: 'Hareketsiz kullanıcı' },
];

interface FormState {
  code: string;
  title_tr: string;
  title_en: string;
  body_tr: string;
  body_en: string;
  monthly_price_try: string;
  yearly_price_try: string;
  lifetime_price_try: string;
  discount_percent: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  banner_color: string;
  push_title_tr: string;
  push_body_tr: string;
  audience: OfferAudience;
  priority: string;
}

function emptyForm(): FormState {
  const now = new Date();
  const startIso = now.toISOString().slice(0, 16);
  const endIso = new Date(now.getTime() + 7 * 86400e3).toISOString().slice(0, 16);
  return {
    code: '',
    title_tr: '',
    title_en: '',
    body_tr: '',
    body_en: '',
    monthly_price_try: '',
    yearly_price_try: '',
    lifetime_price_try: '',
    discount_percent: '',
    starts_at: startIso,
    ends_at: endIso,
    is_active: false,
    banner_color: '#E63946',
    push_title_tr: '',
    push_body_tr: '',
    audience: 'all',
    priority: '0',
  };
}

function rowToForm(row: any): FormState {
  return {
    code: row.code ?? '',
    title_tr: row.title_tr ?? '',
    title_en: row.title_en ?? '',
    body_tr: row.body_tr ?? '',
    body_en: row.body_en ?? '',
    monthly_price_try: row.monthly_price_try?.toString() ?? '',
    yearly_price_try: row.yearly_price_try?.toString() ?? '',
    lifetime_price_try: row.lifetime_price_try?.toString() ?? '',
    discount_percent: row.discount_percent?.toString() ?? '',
    starts_at: row.starts_at ? new Date(row.starts_at).toISOString().slice(0, 16) : '',
    ends_at: row.ends_at ? new Date(row.ends_at).toISOString().slice(0, 16) : '',
    is_active: !!row.is_active,
    banner_color: row.banner_color ?? '#E63946',
    push_title_tr: row.push_title_tr ?? '',
    push_body_tr: row.push_body_tr ?? '',
    audience: (row.audience as OfferAudience) ?? 'all',
    priority: row.priority?.toString() ?? '0',
  };
}

interface BodyProps {
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}

function OfferFormBody({ mode, initial, onClose }: BodyProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? rowToForm(initial) : emptyForm(),
  );
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = (s: string): number | null => (s.trim() === '' ? null : Number(s));
    const payload: OfferPayload = {
      code: form.code.trim(),
      title_tr: form.title_tr.trim(),
      title_en: form.title_en.trim() || null,
      body_tr: form.body_tr.trim(),
      body_en: form.body_en.trim() || null,
      monthly_price_try: num(form.monthly_price_try),
      yearly_price_try: num(form.yearly_price_try),
      lifetime_price_try: num(form.lifetime_price_try),
      discount_percent: num(form.discount_percent),
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_active: form.is_active,
      banner_color: form.banner_color || '#E63946',
      push_title_tr: form.push_title_tr.trim() || null,
      push_body_tr: form.push_body_tr.trim() || null,
      audience: form.audience,
      priority: Number(form.priority) || 0,
    };

    startTransition(async () => {
      const r = mode === 'create'
        ? await createOffer(payload)
        : await updateOffer(initial.id, payload);
      if (r.ok) {
        toast.success(mode === 'create' ? 'Offer oluşturuldu (pasif)' : 'Güncellendi');
        onClose();
        router.refresh();
      } else {
        toast.error(r.error ?? 'Hata');
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Limited Offer' : 'Offer Düzenle'}</DialogTitle>
        <DialogDescription>
          Pricing önceliği: tier override → discount_percent → default. En az biri zorunlu.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label required hint="snake-case unique">Code</Label>
          <Input
            value={form.code}
            onChange={(e) => setField('code', e.target.value)}
            placeholder="winter_50_off"
            disabled={mode === 'edit'}
          />
        </div>
        <div>
          <Label required>Audience</Label>
          <Select
            value={form.audience}
            onChange={(e) => setField('audience', e.target.value as OfferAudience)}
          >
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {AUDIENCE_OPTIONS.find((a) => a.id === form.audience)?.help}
          </p>
        </div>
        <div>
          <Label hint="Yüksek = öncelikli">Priority</Label>
          <Input
            type="number"
            value={form.priority}
            onChange={(e) => setField('priority', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Başlık (TR)</Label>
          <Input
            value={form.title_tr}
            onChange={(e) => setField('title_tr', e.target.value)}
            placeholder="Kış İndirimi"
          />
        </div>
        <div>
          <Label>Başlık (EN)</Label>
          <Input
            value={form.title_en}
            onChange={(e) => setField('title_en', e.target.value)}
            placeholder="Winter Sale"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Açıklama (TR)</Label>
          <Textarea
            value={form.body_tr}
            onChange={(e) => setField('body_tr', e.target.value)}
            rows={2}
            placeholder="Yıllığa %50 indirim — sadece bu hafta"
          />
        </div>
        <div>
          <Label>Açıklama (EN)</Label>
          <Textarea
            value={form.body_en}
            onChange={(e) => setField('body_en', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Başlangıç</Label>
          <Input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setField('starts_at', e.target.value)}
          />
        </div>
        <div>
          <Label required>Bitiş</Label>
          <Input
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => setField('ends_at', e.target.value)}
          />
        </div>
      </div>

      <div className="border border-border rounded-lg p-3 bg-secondary/40">
        <p className="text-xs font-semibold mb-2 text-airspeak-navy">
          Pricing — tier override (boş bırakılırsa discount_percent uygulanır)
        </p>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label hint="₺">Aylık</Label>
            <Input
              type="number"
              step="0.01"
              value={form.monthly_price_try}
              onChange={(e) => setField('monthly_price_try', e.target.value)}
              placeholder="boş = default"
            />
          </div>
          <div>
            <Label hint="₺">Yıllık</Label>
            <Input
              type="number"
              step="0.01"
              value={form.yearly_price_try}
              onChange={(e) => setField('yearly_price_try', e.target.value)}
              placeholder="boş = default"
            />
          </div>
          <div>
            <Label hint="₺">Lifetime</Label>
            <Input
              type="number"
              step="0.01"
              value={form.lifetime_price_try}
              onChange={(e) => setField('lifetime_price_try', e.target.value)}
              placeholder="boş = default"
            />
          </div>
          <div>
            <Label hint="1-90">Discount %</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.discount_percent}
              onChange={(e) => setField('discount_percent', e.target.value)}
              placeholder="örn 50"
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-3 bg-secondary/40">
        <p className="text-xs font-semibold mb-2 text-airspeak-navy">
          Push notification (broadcast butonu kullanır)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Push başlık (TR)</Label>
            <Input
              value={form.push_title_tr}
              onChange={(e) => setField('push_title_tr', e.target.value)}
              placeholder="🎁 Sana özel teklif"
            />
          </div>
          <div>
            <Label>Push body (TR)</Label>
            <Input
              value={form.push_body_tr}
              onChange={(e) => setField('push_body_tr', e.target.value)}
              placeholder="Yıllığa %50 — sadece bu hafta."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <Label hint="hex">Banner rengi</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={form.banner_color}
              onChange={(e) => setField('banner_color', e.target.value)}
              className="w-14 p-0 h-10"
            />
            <Input
              value={form.banner_color}
              onChange={(e) => setField('banner_color', e.target.value)}
              placeholder="#E63946"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setField('is_active', e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm font-semibold">
            Aktif (mobile'da hemen görünür)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          İptal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}

export function CreateOfferButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni offer'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <OfferFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditOfferButton({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <OfferFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
