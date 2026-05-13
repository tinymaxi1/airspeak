'use client';

/**
 * Listen & Solve Drill CRUD form (Sprint C2).
 *
 * 4 multi-choice editor: id+label_tr+label_en, correct radio.
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
const CATEGORIES = ['atc_listen', 'garbled_radio', 'transcribe', 'pa_decode', 'snag_report', 'metar_notam'] as const;
const ALL_PARENT_ROLES = ['pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'];

interface OptionItem {
  id: string;
  label_tr: string;
  label_en: string;
}

export interface ListenSolveFormInitial {
  id?: string;
  level?: string | null;
  target_role?: string | null;
  target_sub_roles?: string[] | null;
  category?: string | null;
  audio_text?: string | null;
  question_tr?: string | null;
  question_en?: string | null;
  options?: any;
  correct_id?: string | null;
  explanation_tr?: string | null;
  explanation_en?: string | null;
  hint_tr?: string | null;
  hint_en?: string | null;
  noise_level?: number | null;
}

const DEFAULT_OPTIONS: OptionItem[] = [
  { id: 'a', label_tr: '', label_en: '' },
  { id: 'b', label_tr: '', label_en: '' },
  { id: 'c', label_tr: '', label_en: '' },
  { id: 'd', label_tr: '', label_en: '' },
];

function ListenSolveFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: ListenSolveFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    level: (initial?.level as any) ?? 'B1',
    target_role: (initial?.target_role as any) ?? 'pilot',
    target_sub_roles: initial?.target_sub_roles ?? [],
    category: (initial?.category as any) ?? 'atc_listen',
    audio_text: initial?.audio_text ?? '',
    question_tr: initial?.question_tr ?? '',
    question_en: initial?.question_en ?? '',
    options: (Array.isArray(initial?.options) ? initial!.options! : DEFAULT_OPTIONS) as OptionItem[],
    correct_id: initial?.correct_id ?? 'a',
    explanation_tr: initial?.explanation_tr ?? '',
    explanation_en: initial?.explanation_en ?? '',
    hint_tr: initial?.hint_tr ?? '',
    hint_en: initial?.hint_en ?? '',
    noise_level: initial?.noise_level ?? 0,
  });

  const subRoleParentRoles =
    form.target_role === 'all' ? ALL_PARENT_ROLES : [form.target_role];

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  function updateOption(idx: number, field: 'label_tr' | 'label_en', value: string) {
    const opts = [...form.options];
    opts[idx] = { ...opts[idx]!, [field]: value };
    set('options', opts);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.audio_text.trim() || !form.question_tr.trim() || !form.question_en.trim()) {
      toast.error('audio_text + question_tr + question_en zorunlu');
      return;
    }
    if (form.options.some((o) => !o.label_tr.trim() || !o.label_en.trim())) {
      toast.error('Tüm seçenek label\'ları (TR + EN) doldurulmalı');
      return;
    }
    if (!form.options.find((o) => o.id === form.correct_id)) {
      toast.error('Doğru cevap seçilmedi');
      return;
    }

    const payload = {
      level: form.level,
      target_role: form.target_role,
      target_sub_roles: form.target_sub_roles,
      category: form.category,
      audio_text: form.audio_text.trim(),
      question_tr: form.question_tr.trim(),
      question_en: form.question_en.trim(),
      options: form.options,
      correct_id: form.correct_id,
      explanation_tr: form.explanation_tr.trim() || null,
      explanation_en: form.explanation_en.trim() || null,
      hint_tr: form.hint_tr.trim() || null,
      hint_en: form.hint_en.trim() || null,
      noise_level: Number(form.noise_level) || 0,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'listen_solve_drills',
          {
            ...payload,
            slug: uniqueSlug(form.audio_text.slice(0, 40), `ls_${form.target_role}_${form.category}`),
            status: 'draft',
          },
          '/listen-solve',
        );
        if (r.ok) {
          toast.success('Oluşturuldu');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('listen_solve_drills', initial.id, payload, '/listen-solve');
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
        <DialogTitle>{mode === 'create' ? 'Yeni Dinle & Çöz Drill' : 'Drill Düzenle'}</DialogTitle>
        <DialogDescription>
          Audio + soru + 4 seçenek + açıklama.
        </DialogDescription>
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
          <Label required hint="TTS okur — İngilizce, gerçek havacılık frazeolojisi">Audio Text</Label>
          <Textarea
            value={form.audio_text}
            onChange={(e) => set('audio_text', e.target.value)}
            placeholder="Turkish 1453, climb and maintain flight level 350."
            rows={2}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Soru (TR)</Label>
            <Textarea
              value={form.question_tr}
              onChange={(e) => set('question_tr', e.target.value)}
              placeholder="Hangi yüksekliğe çıkılması istendi?"
              rows={2}
              required
            />
          </div>
          <div>
            <Label required>Soru (EN)</Label>
            <Textarea
              value={form.question_en}
              onChange={(e) => set('question_en', e.target.value)}
              placeholder="What altitude was instructed?"
              rows={2}
              required
            />
          </div>
        </div>

        <div>
          <Label required>4 Seçenek</Label>
          <div className="space-y-2">
            {form.options.map((opt, idx) => (
              <div key={opt.id} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correct_id"
                  checked={form.correct_id === opt.id}
                  onChange={() => set('correct_id', opt.id)}
                  title="Doğru cevap"
                />
                <span className="text-xs uppercase font-mono w-6">{opt.id}</span>
                <Input
                  value={opt.label_tr}
                  onChange={(e) => updateOption(idx, 'label_tr', e.target.value)}
                  placeholder={`Seçenek ${opt.id.toUpperCase()} (TR)`}
                  className="flex-1"
                />
                <Input
                  value={opt.label_en}
                  onChange={(e) => updateOption(idx, 'label_en', e.target.value)}
                  placeholder={`Option ${opt.id.toUpperCase()} (EN)`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Radio: doğru cevap</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Açıklama (TR)</Label>
            <Textarea value={form.explanation_tr} onChange={(e) => set('explanation_tr', e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Explanation (EN)</Label>
            <Textarea value={form.explanation_en} onChange={(e) => set('explanation_en', e.target.value)} rows={3} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>İpucu (TR — opsiyonel)</Label>
            <Input value={form.hint_tr} onChange={(e) => set('hint_tr', e.target.value)} />
          </div>
          <div>
            <Label hint="0-100, gelecekte audio noise overlay">Noise Level</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.noise_level}
              onChange={(e) => set('noise_level', Number(e.target.value))}
            />
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

export function CreateListenSolveButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni Drill'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ListenSolveFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditListenSolveButton({ row }: { row: ListenSolveFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Düzenle</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ListenSolveFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
