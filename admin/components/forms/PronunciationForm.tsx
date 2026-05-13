'use client';

/**
 * Pronunciation Sentence CRUD form (Sprint C2).
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
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { SubRolePicker } from '@/components/sub-roles/SubRolePicker';

const ROLES = ['all', 'pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'] as const;
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const CATEGORIES = ['phraseology', 'numbers', 'phonetic', 'emergency'] as const;
const ALL_PARENT_ROLES = ['pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'];

export interface PronunciationFormInitial {
  id?: string;
  text_en?: string | null;
  text_tr?: string | null;
  ipa?: string | null;
  phonemes?: any;
  level?: string | null;
  target_role?: string | null;
  target_sub_roles?: string[] | null;
  category?: string | null;
  hint_tr?: string | null;
  hint_en?: string | null;
}

function PronunciationFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: PronunciationFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    text_en: initial?.text_en ?? '',
    text_tr: initial?.text_tr ?? '',
    ipa: initial?.ipa ?? '',
    phonemes_csv: Array.isArray(initial?.phonemes) ? initial!.phonemes!.join(', ') : '',
    level: (initial?.level as any) ?? 'A2',
    target_role: (initial?.target_role as any) ?? 'all',
    target_sub_roles: initial?.target_sub_roles ?? [],
    category: (initial?.category as any) ?? 'phraseology',
    hint_tr: initial?.hint_tr ?? '',
    hint_en: initial?.hint_en ?? '',
  });

  const subRoleParentRoles =
    form.target_role === 'all' ? ALL_PARENT_ROLES : [form.target_role];

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text_en.trim()) {
      toast.error('text_en zorunlu');
      return;
    }
    const phonemes = form.phonemes_csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      text_en: form.text_en.trim(),
      text_tr: form.text_tr.trim() || null,
      ipa: form.ipa.trim() || null,
      phonemes: phonemes.length > 0 ? phonemes : null,
      level: form.level,
      target_role: form.target_role,
      target_sub_roles: form.target_sub_roles,
      category: form.category,
      hint_tr: form.hint_tr.trim() || null,
      hint_en: form.hint_en.trim() || null,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'pronunciation_sentences',
          {
            ...payload,
            slug: uniqueSlug(form.text_en, `pron_${form.target_role}_${form.level.toLowerCase()}`),
            status: 'draft',
          },
          '/pronunciation',
        );
        if (r.ok) {
          toast.success('Oluşturuldu');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('pronunciation_sentences', initial.id, payload, '/pronunciation');
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
        <DialogTitle>{mode === 'create' ? 'Yeni Telaffuz Cümlesi' : 'Cümleyi Düzenle'}</DialogTitle>
        <DialogDescription>Telaffuz drill için cümle + IPA + phoneme breakdown.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Rol</Label>
            <Select
              value={form.target_role}
              onChange={(e) => setForm({ ...form, target_role: e.target.value as any, target_sub_roles: [] })}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div>
            <Label required>Seviye</Label>
            <Select value={form.level} onChange={(e) => set('level', e.target.value as any)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div>
            <Label required>Kategori</Label>
            <Select value={form.category} onChange={(e) => set('category', e.target.value as any)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label hint="Boş = parent role'ün tüm sub'larına açık">Hedef alt-roller (opsiyonel)</Label>
          <SubRolePicker
            parentRoles={subRoleParentRoles}
            value={form.target_sub_roles}
            onChange={(next) => set('target_sub_roles', next)}
          />
        </div>

        <div>
          <Label required>Cümle (EN)</Label>
          <Textarea
            value={form.text_en}
            onChange={(e) => set('text_en', e.target.value)}
            placeholder="Cleared for takeoff, runway two seven."
            rows={2}
            required
          />
        </div>

        <div>
          <Label>Cümle (TR — opsiyonel)</Label>
          <Textarea
            value={form.text_tr}
            onChange={(e) => set('text_tr', e.target.value)}
            placeholder="Kalkış için izinlisiniz, pist iki yedi."
            rows={2}
          />
        </div>

        <div>
          <Label hint="/klɪərd fɔr ˈteɪkɒf/">IPA</Label>
          <Input value={form.ipa} onChange={(e) => set('ipa', e.target.value)} placeholder="/klɪərd fɔr ˈteɪkɒf/" />
        </div>

        <div>
          <Label hint="Virgülle ayır: k, l, ɪ, ə, r, d">Phoneme'ler (CSV)</Label>
          <Input
            value={form.phonemes_csv}
            onChange={(e) => set('phonemes_csv', e.target.value)}
            placeholder="k, l, ɪ, ə, r, d"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>İpucu (TR)</Label>
            <Textarea value={form.hint_tr} onChange={(e) => set('hint_tr', e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Hint (EN)</Label>
            <Textarea value={form.hint_en} onChange={(e) => set('hint_en', e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>Vazgeç</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur (taslak)' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreatePronunciationButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni Telaffuz'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <PronunciationFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditPronunciationButton({ row }: { row: PronunciationFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Düzenle</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <PronunciationFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
