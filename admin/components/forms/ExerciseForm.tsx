'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { AudioField } from '@/components/forms/AudioField';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

const EXERCISE_TYPES = [
  { id: 'vocab-mc', label: '📝 Çoktan seçmeli' },
  { id: 'fill-blank', label: '✏️ Boşluk doldur' },
  { id: 'dialogue-fill', label: '💬 Diyalog' },
  { id: 'listening-mc', label: '🎧 Dinleme' },
  { id: 'pronunciation-record', label: '🎙 Telaffuz' },
  { id: 'match', label: '🔗 Eşleştir (eski)' },
  { id: 'order', label: '📋 Sırala (eski)' },
  { id: 'drag-drop', label: '🎯 Sürükle-bırak' },
  { id: 'open-text', label: '📖 Serbest cevap' },
  // Sprint 10.B — yeni tipler
  { id: 'matching', label: '🔗 Eşleştir (yeni)' },
  { id: 'ordering', label: '📋 Sırala (yeni)' },
  { id: 'true_false', label: '✅ Doğru/Yanlış' },
];

const TYPES_WITH_OPTIONS = new Set([
  'vocab-mc',
  'fill-blank',
  'dialogue-fill',
  'listening-mc',
  'match',
  'drag-drop',
]);

export interface PairItem {
  id: string;
  left: string;
  right: string;
}

export interface OrderItem {
  id: string;
  text: string;
}

interface ExerciseFormProps {
  mode: 'create' | 'edit';
  lessonId: string;
  lessonSlug: string;
  treePath: string;
  nextSort: number;
  initial?: {
    id?: string;
    slug?: string | null;
    sort?: number;
    type?: string;
    prompt?: string | null;
    prompt_tr?: string | null;
    options?: { id: string; text: string }[] | null;
    correct_id?: string | null;
    explanation_tr?: string | null;
    audio_url?: string | null;
    image_url?: string | null;
    difficulty?: number;
    // Sprint 10.A yeni kolonlar
    pairs?: PairItem[] | null;
    correct_order?: string[] | null;
    is_true?: boolean | null;
  };
  onClose: () => void;
}

export function ExerciseForm({
  mode,
  lessonId,
  lessonSlug,
  treePath,
  nextSort,
  initial,
  onClose,
}: ExerciseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    sort: initial?.sort ?? nextSort,
    type: initial?.type ?? 'vocab-mc',
    prompt: initial?.prompt ?? '',
    prompt_tr: initial?.prompt_tr ?? '',
    explanation_tr: initial?.explanation_tr ?? '',
    audio_url: initial?.audio_url ?? '',
    image_url: initial?.image_url ?? '',
    difficulty: initial?.difficulty ?? 2,
    options: initial?.options ?? [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ],
    correct_id: initial?.correct_id ?? 'a',
    // matching
    pairs: (initial?.pairs as PairItem[] | undefined) ?? [
      { id: 'p1', left: '', right: '' },
      { id: 'p2', left: '', right: '' },
    ],
    // ordering
    orderItems: (initial?.options as OrderItem[] | undefined) ?? [
      { id: 'o1', text: '' },
      { id: 'o2', text: '' },
      { id: 'o3', text: '' },
    ],
    // true_false
    is_true: initial?.is_true ?? true,
  });

  // ─── Options handlers ─────────────────────────────────────────
  function updateOption(idx: number, text: string) {
    const next = [...form.options];
    next[idx] = { ...next[idx]!, text };
    setForm({ ...form, options: next });
  }
  function addOption() {
    if (form.options.length >= 8) return;
    const id = String.fromCharCode(97 + form.options.length);
    setForm({ ...form, options: [...form.options, { id, text: '' }] });
  }
  function removeOption(idx: number) {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  }

  // ─── Pairs handlers (matching) ────────────────────────────────
  function addPair() {
    if (form.pairs.length >= 8) return;
    const id = `p${form.pairs.length + 1}`;
    setForm({ ...form, pairs: [...form.pairs, { id, left: '', right: '' }] });
  }
  function removePair(idx: number) {
    if (form.pairs.length <= 2) return;
    setForm({ ...form, pairs: form.pairs.filter((_, i) => i !== idx) });
  }
  function updatePair(idx: number, side: 'left' | 'right', value: string) {
    const next = [...form.pairs];
    next[idx] = { ...next[idx]!, [side]: value };
    setForm({ ...form, pairs: next });
  }

  // ─── Order items handlers (ordering) ──────────────────────────
  function addOrderItem() {
    if (form.orderItems.length >= 8) return;
    const id = `o${form.orderItems.length + 1}`;
    setForm({ ...form, orderItems: [...form.orderItems, { id, text: '' }] });
  }
  function removeOrderItem(idx: number) {
    if (form.orderItems.length <= 2) return;
    setForm({ ...form, orderItems: form.orderItems.filter((_, i) => i !== idx) });
  }
  function updateOrderItem(idx: number, text: string) {
    const next = [...form.orderItems];
    next[idx] = { ...next[idx]!, text };
    setForm({ ...form, orderItems: next });
  }
  function moveOrderItem(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= form.orderItems.length) return;
    const next = [...form.orderItems];
    const tmp = next[idx]!;
    next[idx] = next[target]!;
    next[target] = tmp;
    setForm({ ...form, orderItems: next });
  }

  // ─── Submit ───────────────────────────────────────────────────
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prompt_tr && !form.prompt) {
      toast.error('Soru/ifade metni zorunlu');
      return;
    }

    // Tipe-özel validasyon
    if (form.type === 'matching') {
      if (form.pairs.length < 2) {
        toast.error('En az 2 eşleştirme çifti gerekli');
        return;
      }
      if (form.pairs.some((p) => !p.left.trim() || !p.right.trim())) {
        toast.error('Tüm eşleştirme çiftleri dolu olmalı');
        return;
      }
    } else if (form.type === 'ordering') {
      if (form.orderItems.length < 2) {
        toast.error('En az 2 sıra öğesi gerekli');
        return;
      }
      if (form.orderItems.some((o) => !o.text.trim())) {
        toast.error('Tüm sıra öğeleri dolu olmalı');
        return;
      }
    } else if (form.type === 'true_false') {
      // sadece prompt + is_true yeterli
    } else if (TYPES_WITH_OPTIONS.has(form.type)) {
      if (form.options.some((o) => !o.text)) {
        toast.error('Tüm şıklar dolu olmalı (boşları sil)');
        return;
      }
      if (!form.options.find((o) => o.id === form.correct_id)) {
        toast.error('Doğru cevap geçerli bir şık olmalı');
        return;
      }
    }

    startTransition(async () => {
      const base = {
        sort: form.sort,
        type: form.type,
        prompt: form.prompt,
        prompt_tr: form.prompt_tr,
        explanation_tr: form.explanation_tr,
        audio_url: form.audio_url || null,
        image_url: form.image_url || null,
        difficulty: form.difficulty,
        status: 'draft' as const,
      };

      // Tipe-özel payload
      const typed: Record<string, unknown> = { ...base };
      if (form.type === 'matching') {
        typed.pairs = form.pairs;
        typed.options = null;
        typed.correct_id = null;
        typed.correct_order = null;
        typed.is_true = null;
      } else if (form.type === 'ordering') {
        typed.options = form.orderItems;
        typed.correct_order = form.orderItems.map((o) => o.id);
        typed.pairs = null;
        typed.correct_id = null;
        typed.is_true = null;
      } else if (form.type === 'true_false') {
        typed.is_true = form.is_true;
        typed.options = null;
        typed.correct_id = null;
        typed.pairs = null;
        typed.correct_order = null;
      } else if (TYPES_WITH_OPTIONS.has(form.type)) {
        typed.options = form.options;
        typed.correct_id = form.correct_id;
        typed.pairs = null;
        typed.correct_order = null;
        typed.is_true = null;
      } else {
        // open-text, pronunciation-record vs.
        typed.options = null;
        typed.correct_id = null;
        typed.pairs = null;
        typed.correct_order = null;
        typed.is_true = null;
      }

      if (mode === 'create') {
        const r = await createRow(
          'exercises',
          {
            ...typed,
            lesson_id: lessonId,
            slug: uniqueSlug(form.prompt_tr || form.prompt, `${lessonSlug}_ex`),
          },
          [treePath],
        );
        if (r.ok) {
          toast.success('Egzersiz eklendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('exercises', initial.id, typed, [treePath]);
        if (r.ok) {
          toast.success('Güncellendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      }
    });
  }

  const showOptions = TYPES_WITH_OPTIONS.has(form.type);
  const showPairs = form.type === 'matching';
  const showOrdering = form.type === 'ordering';
  const showTrueFalse = form.type === 'true_false';

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Egzersiz' : 'Egzersizi Düzenle'}</DialogTitle>
        <DialogDescription>
          Egzersiz tipini seç — form ona göre değişir. Her tip kendi alanını kullanır.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Tip</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {EXERCISE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Sıra</Label>
            <Input
              type="number"
              min={0}
              value={form.sort}
              onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Zorluk (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label required hint="Türkçe — UI'da büyük yazılır">
            {showTrueFalse ? 'İfade (TR)' : 'Soru (TR)'}
          </Label>
          <Textarea
            value={form.prompt_tr}
            onChange={(e) => setForm({ ...form, prompt_tr: e.target.value })}
            placeholder={
              showTrueFalse ? '"Mayday üç kez tekrar edilmelidir."' : '"squawk" Türkçesi nedir?'
            }
            rows={2}
          />
        </div>
        <div>
          <Label hint="İngilizce — opsiyonel referans">
            {showTrueFalse ? 'İfade (EN)' : 'Soru (EN)'}
          </Label>
          <Textarea
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={2}
          />
        </div>

        {/* MATCHING — pairs editor */}
        {showPairs && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0" required>
                Eşleştirme çiftleri ({form.pairs.length}/8)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addPair}
                disabled={form.pairs.length >= 8}
              >
                <Plus className="w-3 h-3" /> Çift ekle
              </Button>
            </div>
            <div className="space-y-2">
              {form.pairs.map((pair, idx) => (
                <div key={pair.id} className="flex items-center gap-2">
                  <Input
                    value={pair.left}
                    onChange={(e) => updatePair(idx, 'left', e.target.value)}
                    placeholder="Sol (örn: METAR)"
                    required
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">↔</span>
                  <Input
                    value={pair.right}
                    onChange={(e) => updatePair(idx, 'right', e.target.value)}
                    placeholder="Sağ (örn: hava raporu)"
                    required
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removePair(idx)}
                    disabled={form.pairs.length <= 2}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Min 2, max 8 çift. Mobile rastgele karıştırıp eşleştirmeyi kullanıcıya yaptırır.
            </p>
          </div>
        )}

        {/* ORDERING — items list + ↑↓ */}
        {showOrdering && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0" required>
                Sıralama öğeleri — doğru sıra ({form.orderItems.length}/8)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOrderItem}
                disabled={form.orderItems.length >= 8}
              >
                <Plus className="w-3 h-3" /> Öğe ekle
              </Button>
            </div>
            <div className="space-y-2">
              {form.orderItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-airspeak-navy text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Input
                    value={item.text}
                    onChange={(e) => updateOrderItem(idx, e.target.value)}
                    placeholder={`${idx + 1}. adım`}
                    required
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => moveOrderItem(idx, -1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Yukarı"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOrderItem(idx, 1)}
                    disabled={idx === form.orderItems.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Aşağı"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeOrderItem(idx)}
                    disabled={form.orderItems.length <= 2}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sıralama buradaki dizilim. Mobile karıştırıp kullanıcıdan tekrar sıralamasını ister.
            </p>
          </div>
        )}

        {/* TRUE_FALSE — Doğru/Yanlış toggle */}
        {showTrueFalse && (
          <div>
            <Label required>Doğru cevap</Label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_true: true })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition ${
                  form.is_true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border bg-white text-foreground hover:border-emerald-300'
                }`}
              >
                ✓ Doğru
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_true: false })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition ${
                  !form.is_true
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-border bg-white text-foreground hover:border-red-300'
                }`}
              >
                ✗ Yanlış
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Yukarıdaki ifade <strong>{form.is_true ? 'doğru' : 'yanlış'}</strong> kabul edilecek.
            </p>
          </div>
        )}

        {/* OPTIONS — vocab-mc / fill-blank / dialogue-fill / listening-mc / match / drag-drop */}
        {showOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0" required>
                Şıklar ({form.options.length}/8)
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addOption}
                disabled={form.options.length >= 8}
              >
                <Plus className="w-3 h-3" /> Şık ekle
              </Button>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correct_id: opt.id })}
                    className={`shrink-0 w-8 h-8 rounded-full text-xs font-bold border-2 transition ${
                      form.correct_id === opt.id
                        ? 'bg-airspeak-green border-airspeak-green text-white'
                        : 'bg-white border-border text-foreground hover:border-airspeak-green'
                    }`}
                    title="Doğru cevap"
                  >
                    {opt.id}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Şık ${opt.id.toUpperCase()}`}
                    required
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    disabled={form.options.length <= 2}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Doğru şıkkı yeşil daireden seç. Min 2 şık.
            </p>
          </div>
        )}

        <div>
          <Label hint="Cevap geldikten sonra gösterilir">Açıklama (TR)</Label>
          <Textarea
            value={form.explanation_tr}
            onChange={(e) => setForm({ ...form, explanation_tr: e.target.value })}
            rows={2}
            placeholder="Cevabın gerekçesi..."
          />
        </div>

        {(form.type === 'listening-mc' || form.type === 'pronunciation-record') && (
          <div>
            <Label>Ses dosyası</Label>
            <AudioField
              bucket="lesson-audio"
              pathPrefix={`lessons/${lessonSlug}`}
              value={form.audio_url || null}
              onChange={(url) => setForm({ ...form, audio_url: url ?? '' })}
            />
          </div>
        )}

        <div>
          <Label>Görsel URL'i</Label>
          <Input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://...image..."
          />
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
