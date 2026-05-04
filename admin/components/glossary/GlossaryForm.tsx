'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, AlertTriangle } from 'lucide-react';
import {
  createGlossaryTerm,
  updateGlossaryTerm,
  type GlossaryPayload,
} from '@/lib/glossary/actions';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  'phraseology', 'aircraft_parts', 'aerodynamics', 'navigation',
  'meteorology', 'atc_communication', 'emergency', 'flight_operations',
  'crew_resource_mgmt', 'maintenance', 'cabin_service', 'ground_operations',
  'documentation', 'regulations', 'medical', 'general',
];

const SOURCES = ['icao_doc', 'admin_manual', 'ai_generated'];

export function CreateGlossaryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-airspeak-red text-white hover:bg-airspeak-red/90 text-sm font-semibold"
      >
        <Plus className="w-4 h-4" /> Yeni terim
      </button>
      {open && <GlossaryDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditGlossaryButton({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 inline-flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" />
        Düzenle
      </button>
      {open && <GlossaryDialog initial={row} onClose={() => setOpen(false)} />}
    </>
  );
}

function GlossaryDialog({
  initial,
  onClose,
}: {
  initial?: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState<GlossaryPayload>({
    term_en: initial?.term_en ?? '',
    term_tr: initial?.term_tr ?? '',
    category: initial?.category ?? 'general',
    abbreviation: initial?.abbreviation ?? '',
    definition_en: initial?.definition_en ?? '',
    definition_tr: initial?.definition_tr ?? '',
    example_usage: initial?.example_usage ?? '',
    icao_reference: initial?.icao_reference ?? '',
    source: initial?.source ?? 'admin_manual',
    is_verified: initial?.is_verified ?? false,
    frequency: initial?.frequency ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dupe, setDupe] = useState<{
    id: string;
    term_en: string;
    category: string;
    abbreviation: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  // Anlık duplicate detection — 350ms debounce, term_en >= 2 char
  useEffect(() => {
    const term = form.term_en.trim();
    if (term.length < 2) {
      setDupe(null);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const supabase = createClient();
        let q = (supabase as any)
          .from('aviation_glossary')
          .select('id, term_en, category, abbreviation')
          .ilike('term_en', term);
        if (initial?.id) q = q.neq('id', initial.id);
        const { data } = await q.maybeSingle();
        setDupe(data ?? null);
      } catch {
        setDupe(null);
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [form.term_en, initial?.id]);

  async function onSubmit() {
    setBusy(true);
    setErr(null);
    const r = initial
      ? await updateGlossaryTerm(initial.id, form)
      : await createGlossaryTerm(form);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error ?? 'Kaydedilemedi');
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? 'Terim düzenle' : 'Yeni terim'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Term (EN) *" value={form.term_en} onChange={(v) => set('term_en', v)} />
            <Field label="Term (TR)" value={form.term_tr ?? ''} onChange={(v) => set('term_tr', v)} />
          </div>

          {dupe && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">⚠ Bu terim zaten DB'de var</div>
                <div className="mt-0.5">
                  <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded">
                    {dupe.term_en}
                  </span>{' '}
                  · kategori <strong>{dupe.category}</strong>
                  {dupe.abbreviation && (
                    <>
                      {' '}
                      · {dupe.abbreviation}
                    </>
                  )}{' '}
                  · ID <span className="font-mono">{dupe.id.slice(0, 8)}</span>
                </div>
                <div className="mt-1 text-[11px] text-red-700/80">
                  Submit etsen "duplicate term_en" hatası alacaksın. Farklı bir term seç veya
                  mevcut kaydı düzenle.
                </div>
              </div>
            </div>
          )}
          {checking && form.term_en.length >= 2 && !dupe && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> duplicate kontrol ediliyor…
            </div>
          )}
          {!checking && !dupe && form.term_en.trim().length >= 2 && (
            <div className="text-xs text-emerald-700">
              ✓ {form.term_en} — DB'de yok, kullanılabilir
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Kategori *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as any)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Field
              label="Kısaltma (opsiyonel)"
              value={form.abbreviation ?? ''}
              onChange={(v) => set('abbreviation', v)}
              placeholder="METAR / ILS / VOR"
            />
          </div>

          <Textarea
            label="Tanım (EN)"
            value={form.definition_en ?? ''}
            onChange={(v) => set('definition_en', v)}
            rows={2}
          />
          <Textarea
            label="Tanım (TR)"
            value={form.definition_tr ?? ''}
            onChange={(v) => set('definition_tr', v)}
            rows={2}
          />
          <Textarea
            label="Örnek kullanım"
            value={form.example_usage ?? ''}
            onChange={(v) => set('example_usage', v)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="ICAO referans"
              value={form.icao_reference ?? ''}
              onChange={(v) => set('icao_reference', v)}
              placeholder="Annex 10 / Doc 4444"
            />
            <div>
              <label className="block text-xs font-semibold mb-1">Kaynak</label>
              <select
                value={form.source}
                onChange={(e) => set('source', e.target.value as any)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_verified ?? false}
                onChange={(e) => set('is_verified', e.target.checked)}
              />
              Doğrulanmış (AI çevirilerinde zorla kullan)
            </label>
            <Field
              label="Sıklık"
              value={String(form.frequency ?? 0)}
              onChange={(v) => set('frequency', parseInt(v, 10) || 0)}
              type="number"
              compact
            />
          </div>

          {err && <p className="text-sm text-red-700">{err}</p>}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-border hover:bg-secondary text-sm"
          >
            İptal
          </button>
          <button
            onClick={onSubmit}
            disabled={busy || !form.term_en || dupe !== null}
            title={dupe ? 'Duplicate var — submit kapalı' : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-airspeak-red text-white hover:bg-airspeak-red/90 disabled:opacity-50 text-sm font-semibold"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {initial ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );

  function set<K extends keyof GlossaryPayload>(k: K, v: GlossaryPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'w-24' : ''}>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded px-2 py-1.5 text-sm"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full border border-border rounded px-2 py-1.5 text-sm"
      />
    </div>
  );
}
