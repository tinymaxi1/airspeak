'use client';

/**
 * Placement Test Sorusu — dimension/format-spesifik form.
 *
 * Icao4Form pattern adaptasyonu: dimension chip + format-conditional context,
 * roles multi-checkbox, category select+other fallback, weight input.
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

const DIMENSIONS = [
  { id: 'general_english', label: 'Genel İng.', emoji: '📚' },
  { id: 'aviation_english', label: 'Havacılık İng.', emoji: '✈️' },
  { id: 'aviation_knowledge', label: 'Havacılık Bilgisi', emoji: '🎓' },
  { id: 'communication', label: 'İletişim', emoji: '💬' },
] as const;

const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

const CATEGORY_OPTIONS = [
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'phraseology',
  'critical',
] as const;

const FORMATS = [
  { id: 'short', label: 'Kısa MCQ' },
  { id: 'passage', label: 'Pasaj' },
  { id: 'scenario', label: 'Senaryo' },
] as const;

const ROLES = [
  { id: 'all', label: 'Tüm roller' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'cabin', label: 'Kabin' },
  { id: 'technician', label: 'Teknisyen' },
  { id: 'ground', label: 'Yer hizmetleri' },
  { id: 'student', label: 'Öğrenci' },
] as const;

const OPTION_IDS = ['a', 'b', 'c', 'd'] as const;

type Dimension = (typeof DIMENSIONS)[number]['id'];
type Format = (typeof FORMATS)[number]['id'];

interface PlacementFormInitial {
  id?: string;
  dimension?: string;
  level?: string;
  category?: string | null;
  format?: string | null;
  roles?: string[] | null;
  question?: string | null;
  question_tr?: string | null;
  context?: string | null;
  options?: { id: string; text: string }[] | null;
  correct_id?: string | null;
  weight?: number | null;
}

function emptyOptions() {
  return OPTION_IDS.map((id) => ({ id, text: '' }));
}

function normalizeOptions(input: PlacementFormInitial['options']) {
  if (!Array.isArray(input)) return emptyOptions();
  const map = new Map(input.map((o) => [o.id, o.text ?? '']));
  return OPTION_IDS.map((id) => ({ id, text: map.get(id) ?? '' }));
}

function categoryInitial(initial?: PlacementFormInitial) {
  const cat = initial?.category ?? '';
  if (!cat) return { selected: 'vocabulary', custom: '' };
  if ((CATEGORY_OPTIONS as readonly string[]).includes(cat)) {
    return { selected: cat, custom: '' };
  }
  return { selected: '__other__', custom: cat };
}

function PlacementFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: PlacementFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const catInit = categoryInitial(initial);
  const [form, setForm] = useState({
    dimension: (initial?.dimension as Dimension) ?? 'general_english',
    level: initial?.level ?? 'B1',
    categorySelected: catInit.selected,
    categoryCustom: catInit.custom,
    format: (initial?.format as Format) ?? 'short',
    roles: (initial?.roles && initial.roles.length > 0 ? initial.roles : ['all']) as string[],
    question: initial?.question ?? '',
    question_tr: initial?.question_tr ?? '',
    context: initial?.context ?? '',
    options: normalizeOptions(initial?.options),
    correct_id: initial?.correct_id ?? 'a',
    weight: initial?.weight ?? 1,
  });

  const isPassage = form.format === 'passage';
  const isScenario = form.format === 'scenario';
  const contextRequired = isPassage || isScenario;
  const contextRows = isPassage ? 6 : isScenario ? 4 : 0;

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function updateOption(idx: number, text: string) {
    const next = [...form.options];
    next[idx] = { ...next[idx]!, text };
    setForm((s) => ({ ...s, options: next }));
  }

  function toggleRole(role: string) {
    setForm((s) => {
      const has = s.roles.includes(role);
      let next = has ? s.roles.filter((r) => r !== role) : [...s.roles, role];
      if (next.length === 0) next = ['all'];
      return { ...s, roles: next };
    });
  }

  function resolveCategory(): string | null {
    if (form.categorySelected === '__other__') {
      return form.categoryCustom.trim() || null;
    }
    return form.categorySelected;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.question.trim()) {
      toast.error('Soru (EN) zorunlu');
      return;
    }
    if (form.options.some((o) => !o.text.trim())) {
      toast.error('4 şıkkın hepsi dolu olmalı');
      return;
    }
    if (!form.options.find((o) => o.id === form.correct_id)) {
      toast.error('Doğru cevap geçerli bir şık olmalı');
      return;
    }
    if (contextRequired && !form.context.trim()) {
      toast.error(isPassage ? 'Pasaj zorunlu' : 'Senaryo bağlamı zorunlu');
      return;
    }
    if (form.categorySelected === '__other__' && !form.categoryCustom.trim()) {
      toast.error('Kategori boş bırakılamaz (Diğer seçildi)');
      return;
    }
    if (form.roles.length === 0) {
      toast.error('En az 1 rol seçili olmalı');
      return;
    }

    const payload = {
      dimension: form.dimension,
      level: form.level,
      category: resolveCategory(),
      format: form.format,
      roles: form.roles,
      question: form.question.trim(),
      question_tr: form.question_tr.trim() || null,
      context: form.context.trim() || null,
      options: form.options,
      correct_id: form.correct_id,
      weight: Number(form.weight) || 1,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'placement_questions',
          {
            ...payload,
            slug: uniqueSlug(form.question, `placement_${form.dimension}_${form.level}`),
            status: 'draft',
          },
          '/placement',
        );
        if (r.ok) {
          toast.success('Eklendi (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('placement_questions', initial.id, payload, '/placement');
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
        <DialogTitle>
          {mode === 'create' ? 'Yeni Placement Sorusu' : 'Placement Sorusunu Düzenle'}
        </DialogTitle>
        <DialogDescription>
          Boyut + format'a göre form değişir. Pasaj ve senaryo formatlarında bağlam zorunlu.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Dimension chips */}
        <div>
          <Label required>Boyut</Label>
          <div className="grid grid-cols-4 gap-2">
            {DIMENSIONS.map((d) => {
              const active = form.dimension === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setField('dimension', d.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-airspeak-navy border-airspeak-navy text-white'
                      : 'bg-white border-border text-foreground hover:border-airspeak-navy/50'
                  }`}
                >
                  <span className="mr-1">{d.emoji}</span>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Level + Format + Weight */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Seviye</Label>
            <Select value={form.level} onChange={(e) => setField('level', e.target.value)}>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Format</Label>
            <Select
              value={form.format}
              onChange={(e) => setField('format', e.target.value as Format)}
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="Puanlama ağırlığı">Ağırlık</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.weight}
              onChange={(e) => setField('weight', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Category — select + Diğer fallback */}
        <div>
          <Label>Kategori</Label>
          <Select
            value={form.categorySelected}
            onChange={(e) => setField('categorySelected', e.target.value)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__other__">Diğer…</option>
          </Select>
          {form.categorySelected === '__other__' && (
            <Input
              value={form.categoryCustom}
              onChange={(e) => setField('categoryCustom', e.target.value)}
              placeholder="Özel kategori adı"
              className="mt-2"
            />
          )}
        </div>

        {/* Roles multi-checkbox */}
        <div>
          <Label hint="En az 1 — boş bırakılırsa 'all' default'a döner">Roller</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const active = form.roles.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRole(r.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition ${
                    active
                      ? 'bg-airspeak-green/15 border-airspeak-green text-emerald-900'
                      : 'bg-white border-border text-foreground hover:border-airspeak-green/50'
                  }`}
                >
                  {active ? '✓ ' : ''}
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question EN + TR */}
        <div>
          <Label required>Soru (EN)</Label>
          <Textarea
            value={form.question}
            onChange={(e) => setField('question', e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <Label hint="Türkçe — opsiyonel">Soru (TR)</Label>
          <Textarea
            value={form.question_tr}
            onChange={(e) => setField('question_tr', e.target.value)}
            rows={2}
          />
        </div>

        {/* Format-conditional context */}
        {contextRows > 0 && (
          <div>
            <Label
              required={contextRequired}
              hint={
                isPassage
                  ? 'Okuma metni — soru bu pasaja gönderme yapar'
                  : 'Durum bağlamı — senaryo açıklaması'
              }
            >
              {isPassage ? 'Pasaj' : 'Senaryo bağlamı'}
            </Label>
            <Textarea
              value={form.context}
              onChange={(e) => setField('context', e.target.value)}
              rows={contextRows}
              className={
                contextRequired && !form.context.trim()
                  ? 'ring-2 ring-destructive/40 focus-visible:ring-destructive'
                  : ''
              }
            />
          </div>
        )}

        {/* Inline option builder — 4 sabit */}
        <div>
          <Label className="mb-2" required>
            Şıklar (4 sabit)
          </Label>
          <div className="space-y-2">
            {form.options.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setField('correct_id', opt.id)}
                  className={`shrink-0 w-8 h-8 rounded-full text-xs font-bold border-2 transition ${
                    form.correct_id === opt.id
                      ? 'bg-airspeak-green border-airspeak-green text-white'
                      : 'bg-white border-border text-foreground hover:border-airspeak-green'
                  }`}
                  title="Doğru cevabı seç"
                >
                  {opt.id}
                </button>
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  placeholder={`Şık ${opt.id.toUpperCase()}`}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Doğru şıkkı yeşil daireden seç (a/b/c/d).
          </p>
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

export function CreatePlacementButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni soru'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <PlacementFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditPlacementButton({ row }: { row: PlacementFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <PlacementFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
