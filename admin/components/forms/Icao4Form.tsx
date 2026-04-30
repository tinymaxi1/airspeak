'use client';

/**
 * ICAO 4 Sorusu — section-spesifik form.
 *
 * GenericTableForm yerine custom: section'a göre context field ve audio_url
 * koşullu render edilir, options inline builder ile alınır.
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
import { AudioUploader } from '@/components/forms/AudioUploader';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import {
  ICAO4_CONTEXT_LABELS,
  ICAO4_SECTIONS,
  type IcaoSection,
} from '@shared/features/icao4/sectionLabels';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const SET_OPTIONS = [1, 2, 3] as const;
const LEVEL_OPTIONS = ['B1', 'B2', 'B2+', 'C1'] as const;
const OPTION_IDS = ['a', 'b', 'c', 'd'] as const;

interface Icao4FormInitial {
  id?: string;
  set_no?: number;
  section?: string;
  level?: string;
  question?: string | null;
  question_tr?: string | null;
  context?: string | null;
  audio_url?: string | null;
  options?: { id: string; text: string }[] | null;
  correct_id?: string | null;
  explanation_tr?: string | null;
}

function emptyOptions() {
  return OPTION_IDS.map((id) => ({ id, text: '' }));
}

function normalizeOptions(input: Icao4FormInitial['options']) {
  if (!Array.isArray(input)) return emptyOptions();
  const map = new Map(input.map((o) => [o.id, o.text ?? '']));
  return OPTION_IDS.map((id) => ({ id, text: map.get(id) ?? '' }));
}

function Icao4FormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: Icao4FormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    set_no: Number(initial?.set_no ?? 1),
    section: (initial?.section as IcaoSection) ?? 'vocabulary',
    level: initial?.level ?? 'B1',
    question: initial?.question ?? '',
    question_tr: initial?.question_tr ?? '',
    context: initial?.context ?? '',
    audio_url: initial?.audio_url ?? '',
    options: normalizeOptions(initial?.options),
    correct_id: initial?.correct_id ?? 'a',
    explanation_tr: initial?.explanation_tr ?? '',
  });

  const sectionConfig = ICAO4_CONTEXT_LABELS[form.section];

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function updateOption(idx: number, text: string) {
    const next = [...form.options];
    next[idx] = { ...next[idx]!, text };
    setForm((s) => ({ ...s, options: next }));
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
    if (form.section === 'listening' && !form.audio_url.trim()) {
      toast.error('Listening sorusu için ses URL zorunlu');
      return;
    }
    if (sectionConfig.required && !form.context.trim()) {
      toast.error(`${sectionConfig.label} zorunlu`);
      return;
    }

    const payload = {
      set_no: form.set_no,
      section: form.section,
      level: form.level,
      question: form.question.trim(),
      question_tr: form.question_tr.trim() || null,
      context: form.context.trim() || null,
      audio_url: form.audio_url.trim() || null,
      options: form.options,
      correct_id: form.correct_id,
      explanation_tr: form.explanation_tr.trim() || null,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'icao4_questions',
          {
            ...payload,
            slug: uniqueSlug(form.question, `icao4_set${form.set_no}_${form.section}`),
            status: 'draft',
          },
          '/icao4',
        );
        if (r.ok) {
          toast.success('Eklendi (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('icao4_questions', initial.id, payload, '/icao4');
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
          {mode === 'create' ? 'Yeni ICAO 4 Sorusu' : 'ICAO 4 Sorusunu Düzenle'}
        </DialogTitle>
        <DialogDescription>
          Section'a göre form değişir. Listening için ses zorunlu, Reading için pasaj zorunlu.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Section chips */}
        <div>
          <Label required>Bölüm</Label>
          <div className="grid grid-cols-4 gap-2">
            {ICAO4_SECTIONS.map((s) => {
              const active = form.section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setField('section', s.id)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-airspeak-navy border-airspeak-navy text-white'
                      : 'bg-white border-border text-foreground hover:border-airspeak-navy/50'
                  }`}
                >
                  <span className="mr-1">{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Set + Level */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Set</Label>
            <Select
              value={String(form.set_no)}
              onChange={(e) => setField('set_no', Number(e.target.value))}
            >
              {SET_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  Set {s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Seviye</Label>
            <Select
              value={form.level}
              onChange={(e) => setField('level', e.target.value)}
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Question EN + TR */}
        <div>
          <Label required hint="Sınav soru metni — İngilizce">
            Soru (EN)
          </Label>
          <Textarea
            value={form.question}
            onChange={(e) => setField('question', e.target.value)}
            rows={2}
            placeholder="What does ATC mean?"
          />
        </div>
        <div>
          <Label hint="Türkçe — opsiyonel referans">Soru (TR)</Label>
          <Textarea
            value={form.question_tr}
            onChange={(e) => setField('question_tr', e.target.value)}
            rows={2}
          />
        </div>

        {/* Listening: audio uploader (zorunlu) */}
        {form.section === 'listening' && (
          <div>
            <Label required hint="Yayına çıkması için ses dosyası şart">
              Ses URL
            </Label>
            <Input
              value={form.audio_url}
              onChange={(e) => setField('audio_url', e.target.value)}
              placeholder="https://....supabase.co/storage/v1/object/public/lesson-audio/..."
              className={
                !form.audio_url
                  ? 'ring-2 ring-destructive/40 focus-visible:ring-destructive'
                  : ''
              }
            />
            <div className="mt-2">
              <AudioUploader
                sourceText={form.context || form.question}
                onAudioGenerated={(url) => setField('audio_url', url)}
                bucket="lesson-audio"
                pathPrefix={`icao4/set${form.set_no}/listening`}
                currentUrl={form.audio_url || null}
              />
            </div>
          </div>
        )}

        {/* Section-conditional context field */}
        {sectionConfig.rows > 0 && (
          <div>
            <Label
              required={sectionConfig.required}
              hint={
                form.section === 'listening'
                  ? 'Önerilen — STT/Whisper kalibrasyonu için'
                  : undefined
              }
            >
              {sectionConfig.label}
            </Label>
            <Textarea
              value={form.context}
              onChange={(e) => setField('context', e.target.value)}
              rows={sectionConfig.rows}
              placeholder={sectionConfig.placeholder}
              className={
                sectionConfig.required && !form.context.trim()
                  ? 'ring-2 ring-destructive/40 focus-visible:ring-destructive'
                  : ''
              }
            />
          </div>
        )}

        {/* Inline option builder — 4 sabit */}
        <div>
          <Label className="mb-2" required>
            Şıklar (4 sabit, ICAO standardı)
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

        {/* Açıklama TR */}
        <div>
          <Label hint="Cevap geldikten sonra gösterilir">Açıklama (TR)</Label>
          <Textarea
            value={form.explanation_tr}
            onChange={(e) => setField('explanation_tr', e.target.value)}
            rows={3}
            placeholder="Doğru cevabın gerekçesi…"
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

export function CreateIcao4Button({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni soru'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <Icao4FormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditIcao4Button({ row }: { row: Icao4FormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <Icao4FormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
