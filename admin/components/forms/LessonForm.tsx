'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';

const LESSON_TYPES = [
  { id: 'vocabulary', label: '📖 Vocabulary' },
  { id: 'dialogue', label: '💬 Dialogue' },
  { id: 'listening', label: '🎧 Listening' },
  { id: 'pronunciation', label: '🎙 Pronunciation' },
  { id: 'quiz', label: '⭐ Quiz' },
  { id: 'reading', label: '📰 Reading' },
  { id: 'speaking', label: '🗣 Speaking' },
];

interface LessonFormProps {
  mode: 'create' | 'edit';
  unitId: string;
  unitSlug: string;
  role: string;
  moduleSlug: string;
  initial?: {
    id?: string;
    slug?: string;
    number?: number;
    title?: string;
    title_tr?: string | null;
    type?: string;
    xp?: number;
    estimated_minutes?: number;
    is_premium?: boolean;
  };
  onClose: () => void;
}

export function LessonForm({
  mode,
  unitId,
  unitSlug,
  role,
  moduleSlug,
  initial,
  onClose,
}: LessonFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    number: initial?.number ?? 1,
    title: initial?.title ?? '',
    title_tr: initial?.title_tr ?? '',
    type: initial?.type ?? 'vocabulary',
    xp: initial?.xp ?? 10,
    estimated_minutes: initial?.estimated_minutes ?? 5,
    is_premium: initial?.is_premium ?? false,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      toast.error('Başlık zorunlu');
      return;
    }
    startTransition(async () => {
      const path = `/tree/${role}/${moduleSlug}/${unitSlug}`;
      if (mode === 'create') {
        const r = await createRow(
          'lessons',
          {
            slug: uniqueSlug(form.title_tr || form.title, `lesson_${role}`),
            unit_id: unitId,
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            type: form.type,
            xp: form.xp,
            estimated_minutes: form.estimated_minutes,
            is_premium: form.is_premium,
            sort: form.number - 1,
            status: 'draft',
          },
          [path],
        );
        if (r.ok) {
          toast.success('Ders oluşturuldu (taslak) — egzersiz eklemek için aç');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow(
          'lessons',
          initial.id,
          {
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            type: form.type,
            xp: form.xp,
            estimated_minutes: form.estimated_minutes,
            is_premium: form.is_premium,
          },
          [path, `${path}/${initial.slug}`],
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
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Ders' : 'Dersi Düzenle'}</DialogTitle>
        <DialogDescription>
          Ders 5–10 sıralı egzersizten oluşur. Egzersizleri ders açıldıktan sonra ekleyeceksin.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Sıra</Label>
            <Input
              type="number"
              min={1}
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label required>Tip</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {LESSON_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Pro?</Label>
            <Select
              value={form.is_premium ? 'yes' : 'no'}
              onChange={(e) => setForm({ ...form, is_premium: e.target.value === 'yes' })}
            >
              <option value="no">Free</option>
              <option value="yes">PRO</option>
            </Select>
          </div>
        </div>

        <div>
          <Label required>Başlık (EN)</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Aircraft Anatomy 1"
            required
          />
        </div>
        <div>
          <Label>Başlık (TR)</Label>
          <Input
            value={form.title_tr ?? ''}
            onChange={(e) => setForm({ ...form, title_tr: e.target.value })}
            placeholder="Uçak Anatomisi 1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>XP</Label>
            <Input
              type="number"
              min={0}
              value={form.xp}
              onChange={(e) => setForm({ ...form, xp: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Tahmini süre (dk)</Label>
            <Input
              type="number"
              min={1}
              value={form.estimated_minutes}
              onChange={(e) => setForm({ ...form, estimated_minutes: Number(e.target.value) })}
            />
          </div>
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
