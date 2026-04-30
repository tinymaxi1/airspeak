'use client';

/**
 * BadgeForm — rozet template CRUD.
 *
 * Code/name/description, kategori, condition_type/value, rarity,
 * icon (emoji + opsiyonel custom URL), is_active toggle.
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const CATEGORIES = [
  { id: 'streak', label: 'Streak' },
  { id: 'xp', label: 'XP' },
  { id: 'level', label: 'Level' },
  { id: 'lesson', label: 'Ders' },
  { id: 'speed', label: 'Hız' },
  { id: 'social', label: 'Sosyal' },
  { id: 'league', label: 'Lig' },
  { id: 'special', label: 'Özel' },
] as const;

const CONDITION_TYPES = [
  { id: 'streak_days', label: 'Streak gün' },
  { id: 'total_xp', label: 'Toplam XP' },
  { id: 'level', label: 'Seviye' },
  { id: 'lessons_completed', label: 'Tamamlanan ders' },
  { id: 'perfect_scores', label: 'Hatasız sayısı' },
  { id: 'custom', label: 'Özel (kod)' },
] as const;

const RARITIES = [
  { id: 'common', label: 'Common', color: '#DCE0E8' },
  { id: 'rare', label: 'Rare', color: '#4FD487' },
  { id: 'epic', label: 'Epic', color: '#7C5CFF' },
  { id: 'legendary', label: 'Legendary', color: '#F2C14E' },
] as const;

interface BadgeFormInitial {
  id?: string;
  code?: string;
  name_tr?: string;
  name_en?: string | null;
  description_tr?: string | null;
  description_en?: string | null;
  icon_emoji?: string;
  icon_url?: string | null;
  category?: string;
  condition_type?: string;
  condition_value?: number;
  rarity?: string;
  sort?: number;
  is_active?: boolean;
}

function BadgeFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: BadgeFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    name_tr: initial?.name_tr ?? '',
    name_en: initial?.name_en ?? '',
    description_tr: initial?.description_tr ?? '',
    description_en: initial?.description_en ?? '',
    icon_emoji: initial?.icon_emoji ?? '🏆',
    icon_url: initial?.icon_url ?? '',
    category: initial?.category ?? 'streak',
    condition_type: initial?.condition_type ?? 'streak_days',
    condition_value: initial?.condition_value ?? 1,
    rarity: initial?.rarity ?? 'common',
    sort: initial?.sort ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !/^[a-z0-9_]+$/.test(form.code)) {
      toast.error('Code zorunlu — sadece a-z, 0-9, _');
      return;
    }
    if (!form.name_tr.trim()) {
      toast.error('Türkçe isim zorunlu');
      return;
    }
    if (!form.icon_emoji.trim()) {
      toast.error('Emoji zorunlu (custom URL yoksa fallback)');
      return;
    }
    if (form.condition_value < 0) {
      toast.error('Condition value negatif olamaz');
      return;
    }

    const payload = {
      code: form.code.trim(),
      name_tr: form.name_tr.trim(),
      name_en: form.name_en.trim() || null,
      description_tr: form.description_tr.trim() || null,
      description_en: form.description_en.trim() || null,
      icon_emoji: form.icon_emoji.trim(),
      icon_url: form.icon_url.trim() || null,
      category: form.category,
      condition_type: form.condition_type,
      condition_value: Number(form.condition_value) || 0,
      rarity: form.rarity,
      sort: Number(form.sort) || 0,
      is_active: form.is_active,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow('badges', payload, '/badges');
        if (r.ok) {
          toast.success('Rozet eklendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('badges', initial.id, payload, '/badges');
        if (r.ok) {
          toast.success('Güncellendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Rozet' : 'Rozeti Düzenle'}</DialogTitle>
        <DialogDescription>
          Code unique, kullanıcı kodla award edilir. Custom icon URL varsa emoji fallback olur.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required hint="snake_case, unique">
              Code
            </Label>
            <Input
              value={form.code}
              onChange={(e) => setField('code', e.target.value)}
              placeholder="streak_50"
              disabled={mode === 'edit'}
            />
          </div>
          <div>
            <Label required>İsim (TR)</Label>
            <Input
              value={form.name_tr}
              onChange={(e) => setField('name_tr', e.target.value)}
              placeholder="50 Gün Streak"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>İsim (EN)</Label>
            <Input
              value={form.name_en}
              onChange={(e) => setField('name_en', e.target.value)}
            />
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              value={form.sort}
              onChange={(e) => setField('sort', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label>Açıklama (TR)</Label>
          <Textarea
            value={form.description_tr}
            onChange={(e) => setField('description_tr', e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <Label>Açıklama (EN)</Label>
          <Textarea
            value={form.description_en}
            onChange={(e) => setField('description_en', e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Emoji</Label>
            <Input
              value={form.icon_emoji}
              onChange={(e) => setField('icon_emoji', e.target.value)}
              placeholder="🔥"
            />
          </div>
          <div>
            <Label hint="Storage URL (badge-icons bucket)">Icon URL (opsiyonel)</Label>
            <Input
              value={form.icon_url}
              onChange={(e) => setField('icon_url', e.target.value)}
              placeholder="https://....supabase.co/.../badges/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Kategori</Label>
            <Select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Koşul tipi</Label>
            <Select
              value={form.condition_type}
              onChange={(e) => setField('condition_type', e.target.value)}
            >
              {CONDITION_TYPES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Değer</Label>
            <Input
              type="number"
              min={0}
              value={form.condition_value}
              onChange={(e) => setField('condition_value', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label required>Rarity</Label>
          <div className="grid grid-cols-4 gap-2">
            {RARITIES.map((r) => {
              const active = form.rarity === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setField('rarity', r.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition ${
                    active
                      ? 'text-white border-transparent'
                      : 'bg-white border-border text-foreground hover:border-airspeak-navy/40'
                  }`}
                  style={active ? { backgroundColor: r.color } : undefined}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 border border-border">
          <div>
            <p className="text-sm font-semibold">Aktif</p>
            <p className="text-xs text-muted-foreground">
              Kapalıysa kullanıcılar bu rozeti kazanamaz / vitrinde görmez
            </p>
          </div>
          <button
            type="button"
            onClick={() => setField('is_active', !form.is_active)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              form.is_active ? 'bg-airspeak-green' : 'bg-secondary border border-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                form.is_active ? 'translate-x-5' : 'translate-x-0.5'
              } mt-0.5`}
            />
          </button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateBadgeButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni rozet'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <BadgeFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditBadgeButton({ row }: { row: BadgeFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <BadgeFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
