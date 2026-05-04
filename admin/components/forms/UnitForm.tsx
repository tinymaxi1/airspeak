'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label } from '@/components/ui/Input';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';

interface UnitFormProps {
  mode: 'create' | 'edit';
  moduleId: string;
  moduleSlug: string;
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
    intro_md?: string | null;
    intro_md_en?: string | null;
  };
  onClose: () => void;
}

export function UnitForm({ mode, moduleId, moduleSlug, role, initial, onClose }: UnitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    number: initial?.number ?? 1,
    title: initial?.title ?? '',
    title_tr: initial?.title_tr ?? '',
    description: initial?.description ?? '',
    description_tr: initial?.description_tr ?? '',
    badge: initial?.badge ?? '',
    intro_md: initial?.intro_md ?? '',
    intro_md_en: initial?.intro_md_en ?? '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      toast.error('Başlık zorunlu');
      return;
    }
    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'units',
          {
            slug: uniqueSlug(form.title_tr || form.title, `unit_${role}`),
            module_id: moduleId,
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            description: form.description,
            description_tr: form.description_tr,
            badge: form.badge,
            intro_md: form.intro_md || null,
            intro_md_en: form.intro_md_en || null,
            sort: form.number,
            status: 'draft',
          },
          [`/tree/${role}/${moduleSlug}`],
        );
        if (r.ok) {
          toast.success('Ünite oluşturuldu');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow(
          'units',
          initial.id,
          {
            number: form.number,
            title: form.title,
            title_tr: form.title_tr,
            description: form.description,
            description_tr: form.description_tr,
            badge: form.badge,
            intro_md: form.intro_md || null,
            intro_md_en: form.intro_md_en || null,
          },
          [`/tree/${role}/${moduleSlug}`],
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
        <DialogTitle>{mode === 'create' ? 'Yeni Ünite' : 'Üniteyi Düzenle'}</DialogTitle>
        <DialogDescription>Ünite bir modül içindeki tema gruplarıdır.</DialogDescription>
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
          <div className="col-span-2">
            <Label>Rozet</Label>
            <Input
              value={form.badge ?? ''}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="🎯"
            />
          </div>
        </div>

        <div>
          <Label required>Başlık (EN)</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Holding & approach"
            required
          />
        </div>
        <div>
          <Label>Başlık (TR)</Label>
          <Input
            value={form.title_tr ?? ''}
            onChange={(e) => setForm({ ...form, title_tr: e.target.value })}
            placeholder="Bekleme ve yaklaşma"
          />
        </div>

        <div>
          <Label>Açıklama (TR)</Label>
          <Textarea
            value={form.description_tr ?? ''}
            onChange={(e) => setForm({ ...form, description_tr: e.target.value })}
            rows={2}
          />
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold mb-1">Ünite Girişi</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Mobilde üniteye ilk tıklandığında modal'da gösterilir. Markdown desteği:
            <code className="text-[11px] bg-secondary px-1 rounded mx-0.5">## başlık</code>
            <code className="text-[11px] bg-secondary px-1 rounded mx-0.5">**kalın**</code>
            <code className="text-[11px] bg-secondary px-1 rounded mx-0.5">- bullet</code>
            · paragraflar boş satırla ayrılır. Boş bırakılabilir.
          </p>
          <div className="space-y-3">
            <div>
              <Label>Giriş metni (TR)</Label>
              <Textarea
                value={form.intro_md ?? ''}
                onChange={(e) => setForm({ ...form, intro_md: e.target.value })}
                rows={5}
                placeholder={'## Bu ünitede ne öğreneceksin\n\nKısa anlatım…\n\n- Madde 1\n- Madde 2'}
              />
            </div>
            <div>
              <Label>Giriş metni (EN)</Label>
              <Textarea
                value={form.intro_md_en ?? ''}
                onChange={(e) => setForm({ ...form, intro_md_en: e.target.value })}
                rows={5}
                placeholder={'## What you will learn\n\nShort intro…'}
              />
            </div>
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
