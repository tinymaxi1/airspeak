'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';

interface ModuleFormProps {
  mode: 'create' | 'edit';
  role: string;
  initial?: {
    id?: string;
    slug?: string;
    number?: number;
    title?: string;
    title_tr?: string | null;
    description?: string | null;
    description_tr?: string | null;
    badge?: string | null;
    reward_xp?: number;
    level?: string | null;
  };
  onClose: () => void;
}

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function ModuleForm({ mode, role, initial, onClose }: ModuleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    number: initial?.number ?? 1,
    title: initial?.title ?? '',
    title_tr: initial?.title_tr ?? '',
    description: initial?.description ?? '',
    description_tr: initial?.description_tr ?? '',
    badge: initial?.badge ?? '🛩',
    reward_xp: initial?.reward_xp ?? 50,
    level: initial?.level ?? 'A0',
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.title_tr) {
      toast.error('Başlık (EN + TR) zorunlu');
      return;
    }
    if (!form.level) {
      toast.error('Seviye seçimi zorunlu');
      return;
    }
    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'modules',
          {
            // Slug format: {role}_m{number}_{level}_{title_slug}
            slug: uniqueSlug(form.title_tr || form.title, `${role}_m${form.number}_${form.level.toLowerCase()}`),
            role,
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            description: form.description,
            description_tr: form.description_tr,
            badge: form.badge,
            reward_xp: form.reward_xp,
            level: form.level,
            sort: form.number,
            status: 'draft',
          },
          [`/tree/${role}`, '/tree'],
        );
        if (r.ok) {
          toast.success('Modül oluşturuldu (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow(
          'modules',
          initial.id,
          {
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            description: form.description,
            description_tr: form.description_tr,
            badge: form.badge,
            reward_xp: form.reward_xp,
            level: form.level,
          },
          [`/tree/${role}`, `/tree/${role}/${initial.slug}`],
        );
        if (r.ok) {
          toast.success('Güncellendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col">
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Modül' : 'Modülü Düzenle'}</DialogTitle>
        <DialogDescription>
          Modül bir konunun ana çatısıdır. Üniteler ve dersler içerir.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label required>Sıra No</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={form.number}
              onChange={(e) => update('number', Math.max(1, Number(e.target.value)))}
              required
            />
          </div>
          <div>
            <Label required hint="CEFR">Seviye</Label>
            <Select value={form.level} onChange={(e) => update('level', e.target.value)}>
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Rozet</Label>
            <Input
              value={form.badge}
              onChange={(e) => update('badge', e.target.value)}
              placeholder="🛩"
            />
          </div>
          <div>
            <Label>Ödül XP</Label>
            <Input
              type="number"
              min={0}
              value={form.reward_xp}
              onChange={(e) => update('reward_xp', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label required hint="İngilizce">Başlık (EN)</Label>
          <Input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Cockpit & Aircraft Basics"
            required
          />
        </div>
        <div>
          <Label required hint="Türkçe">Başlık (TR)</Label>
          <Input
            value={form.title_tr}
            onChange={(e) => update('title_tr', e.target.value)}
            placeholder="Kokpit ve Uçak Temelleri"
            required
          />
        </div>

        <div>
          <Label hint="İngilizce">Açıklama (EN)</Label>
          <Textarea
            value={form.description ?? ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Aircraft anatomy and cockpit components."
            rows={2}
          />
        </div>
        <div>
          <Label hint="Türkçe">Açıklama (TR)</Label>
          <Textarea
            value={form.description_tr ?? ''}
            onChange={(e) => update('description_tr', e.target.value)}
            placeholder="Uçak anatomisi ve kokpit bileşenleri."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur (taslak)' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}
