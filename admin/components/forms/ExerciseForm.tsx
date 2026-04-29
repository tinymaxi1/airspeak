'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import { DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

const EXERCISE_TYPES = [
  { id: 'vocab-mc', label: '📝 Çoktan seçmeli' },
  { id: 'fill-blank', label: '✏️ Boşluk doldur' },
  { id: 'dialogue-fill', label: '💬 Diyalog' },
  { id: 'listening-mc', label: '🎧 Dinleme' },
  { id: 'pronunciation-record', label: '🎙 Telaffuz' },
  { id: 'match', label: '🔗 Eşleştir' },
  { id: 'order', label: '📋 Sırala' },
  { id: 'drag-drop', label: '🎯 Sürükle-bırak' },
  { id: 'open-text', label: '📖 Serbest cevap' },
];

interface ExerciseFormProps {
  mode: 'create' | 'edit';
  lessonId: string;
  lessonSlug: string;
  treePath: string; // e.g. /tree/pilot/mod_x/unit_y/lesson_z
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
  });

  function updateOption(idx: number, text: string) {
    const next = [...form.options];
    next[idx] = { ...next[idx]!, text };
    setForm({ ...form, options: next });
  }

  function addOption() {
    if (form.options.length >= 8) return;
    const id = String.fromCharCode(97 + form.options.length); // a, b, c, ...
    setForm({ ...form, options: [...form.options, { id, text: '' }] });
  }

  function removeOption(idx: number) {
    if (form.options.length <= 2) return;
    const next = form.options.filter((_, i) => i !== idx);
    setForm({ ...form, options: next });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.prompt_tr && !form.prompt) {
      toast.error('Soru metni zorunlu');
      return;
    }
    if (form.options.some((o) => !o.text)) {
      toast.error('Tüm şıklar dolu olmalı (boşları sil)');
      return;
    }
    if (!form.options.find((o) => o.id === form.correct_id)) {
      toast.error('Doğru cevap geçerli bir şık olmalı');
      return;
    }

    startTransition(async () => {
      const payload = {
        sort: form.sort,
        type: form.type,
        prompt: form.prompt,
        prompt_tr: form.prompt_tr,
        options: form.options,
        correct_id: form.correct_id,
        explanation_tr: form.explanation_tr,
        audio_url: form.audio_url || null,
        image_url: form.image_url || null,
        difficulty: form.difficulty,
        status: 'draft' as const,
      };

      if (mode === 'create') {
        const r = await createRow(
          'exercises',
          {
            ...payload,
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
        const r = await updateRow('exercises', initial.id, payload, [treePath]);
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
        <DialogTitle>{mode === 'create' ? 'Yeni Egzersiz' : 'Egzersizi Düzenle'}</DialogTitle>
        <DialogDescription>
          Soru + şıklar + doğru cevap. Egzersiz tipini seçince form ona göre değişir.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Tip</Label>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
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
          <Label required hint="Türkçe — UI'da büyük yazılır">Soru (TR)</Label>
          <Textarea
            value={form.prompt_tr}
            onChange={(e) => setForm({ ...form, prompt_tr: e.target.value })}
            placeholder='"squawk" Türkçesi nedir?'
            rows={2}
          />
        </div>
        <div>
          <Label hint="İngilizce — opsiyonel referans">Soru (EN)</Label>
          <Textarea
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            placeholder="What does 'squawk' mean?"
            rows={2}
          />
        </div>

        {/* Şıklar */}
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

        <div>
          <Label hint="Cevap geldikten sonra gösterilir">Açıklama (TR)</Label>
          <Textarea
            value={form.explanation_tr}
            onChange={(e) => setForm({ ...form, explanation_tr: e.target.value })}
            rows={2}
            placeholder="Squawk = transponder kodu ayarla..."
          />
        </div>

        {(form.type === 'listening-mc' || form.type === 'pronunciation-record') && (
          <div>
            <Label>Ses URL'i</Label>
            <Input
              value={form.audio_url}
              onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
              placeholder="https://....supabase.co/storage/v1/object/public/lesson-audio/..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Faz 5'te Storage upload + ElevenLabs üretim eklenecek.
            </p>
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
