'use client';

import { useState } from 'react';
import { Loader2, Plus, Pencil, AlertTriangle, X } from 'lucide-react';
import {
  createWordOfDay,
  updateWordOfDay,
  type WordOfDayPayload,
  type WotdRole,
} from '@/lib/word-of-day/actions';
import { SubRolePicker } from '@/components/sub-roles/SubRolePicker';

const ROLES: { id: WotdRole; label: string; emoji: string }[] = [
  { id: 'pilot', label: 'Pilot', emoji: '✈' },
  { id: 'atc', label: 'ATC', emoji: '🗼' },
  { id: 'cabin', label: 'Kabin', emoji: '🎧' },
  { id: 'technician', label: 'Teknisyen', emoji: '⚙' },
  { id: 'ground', label: 'Yer Hizmetleri', emoji: '💼' },
  { id: 'student', label: 'Öğrenci', emoji: '📖' },
];

const CONTENT_TYPES: { id: WordOfDayPayload['content_type']; label: string }[] = [
  { id: 'word', label: 'Kelime' },
  { id: 'phrase', label: 'İfade' },
  { id: 'sentence', label: 'Cümle' },
  { id: 'dialogue', label: 'Diyalog' },
  { id: 'tip', label: 'İpucu' },
];

const CATEGORIES = [
  'atc_communication',
  'phraseology',
  'ground_movement',
  'ground_operations',
  'ground_equipment',
  'cargo_operations',
  'cabin_announcements',
  'cabin_procedures',
  'cabin_equipment',
  'emergency_procedures',
  'maintenance',
  'maintenance_log',
  'maintenance_terminology',
  'inspection_procedures',
  'documentation',
  'weather',
  'pilot_terminology',
  'atc_procedures',
  'industry_jargon',
  'fundamentals',
  'regulations',
  'flight_rules',
];

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<WordOfDayPayload> & { id?: string };
  onClose: () => void;
}

export function WordOfDayForm({ mode, initial, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contentType, setContentType] = useState<WordOfDayPayload['content_type']>(
    initial?.content_type ?? 'word',
  );
  const [wordOrPhrase, setWordOrPhrase] = useState(initial?.word_or_phrase ?? '');
  const [ipa, setIpa] = useState(initial?.ipa ?? '');
  const [wordType, setWordType] = useState<string>(initial?.word_type ?? 'noun');
  const [targetRoles, setTargetRoles] = useState<WotdRole[]>(initial?.target_roles ?? ['pilot']);
  const [targetSubRoles, setTargetSubRoles] = useState<string[]>(initial?.target_sub_roles ?? []);
  const [definitionEn, setDefinitionEn] = useState(initial?.definition_en ?? '');
  const [definitionTr, setDefinitionTr] = useState(initial?.definition_tr ?? '');
  const [exampleEn, setExampleEn] = useState(initial?.example_en ?? '');
  const [exampleTr, setExampleTr] = useState(initial?.example_tr ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'phraseology');
  const [difficulty, setDifficulty] = useState<WordOfDayPayload['difficulty']>(
    initial?.difficulty ?? 'basic',
  );
  const [scheduledDate, setScheduledDate] = useState(initial?.scheduled_date ?? '');
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  function toggleRole(role: WotdRole) {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload: WordOfDayPayload = {
      content_type: contentType,
      word_or_phrase: wordOrPhrase.trim(),
      ipa: ipa.trim() || null,
      word_type: (wordType as any) || null,
      target_roles: targetRoles,
      target_sub_roles: targetSubRoles,
      definition_en: definitionEn.trim(),
      definition_tr: definitionTr.trim(),
      example_en: exampleEn.trim(),
      example_tr: exampleTr.trim(),
      category,
      difficulty,
      scheduled_date: scheduledDate || null,
      is_active: isActive,
    };

    const result =
      mode === 'create'
        ? await createWordOfDay(payload)
        : await updateWordOfDay(initial!.id!, payload);

    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-airspeak-navy flex items-center gap-2">
            {mode === 'create' ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
            {mode === 'create' ? 'Yeni kelime/ifade' : 'Düzenle'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content type + Word */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Tür</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                {CONTENT_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1">Kelime / İfade *</label>
              <input
                required
                value={wordOrPhrase}
                onChange={(e) => setWordOrPhrase(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm font-semibold"
                placeholder="squawk, cleared for takeoff, ..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">IPA (telaffuz)</label>
              <input
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm font-mono"
                placeholder="/skwɔːk/"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Kelime tipi</label>
              <select
                value={wordType}
                onChange={(e) => setWordType(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adj">adj</option>
                <option value="adv">adv</option>
                <option value="phrase">phrase</option>
                <option value="abbr">abbr</option>
                <option value="dialogue">dialogue</option>
                <option value="tip">tip</option>
              </select>
            </div>
          </div>

          {/* Target Roles */}
          <div>
            <label className="block text-xs font-semibold mb-2">
              Hedef roller * (en az 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => toggleRole(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border-2 transition ${
                    targetRoles.includes(r.id)
                      ? 'bg-airspeak-navy text-white border-airspeak-navy'
                      : 'bg-white text-airspeak-navy border-border'
                  }`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Sub-Roles (opsiyonel granular filter) */}
          <div>
            <label className="block text-xs font-semibold mb-2">
              Hedef alt-roller (opsiyonel — boş = tüm alt-roller)
            </label>
            <SubRolePicker
              parentRoles={targetRoles}
              value={targetSubRoles}
              onChange={setTargetSubRoles}
            />
          </div>

          {/* Definitions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Tanım (EN) *</label>
              <textarea
                required
                value={definitionEn}
                onChange={(e) => setDefinitionEn(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Tanım (TR) *</label>
              <textarea
                required
                value={definitionTr}
                onChange={(e) => setDefinitionTr(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* Examples */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Örnek (EN) *</label>
              <textarea
                required
                value={exampleEn}
                onChange={(e) => setExampleEn(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Örnek (TR) *</label>
              <textarea
                required
                value={exampleTr}
                onChange={(e) => setExampleTr(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Zorluk *</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="basic">basic</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Planlı tarih</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            Aktif (kullanıcılara gösterilir)
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm hover:bg-secondary"
              disabled={busy}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={busy || targetRoles.length === 0}
              className="px-4 py-2 rounded bg-airspeak-red text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'Oluştur' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateWordOfDayButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-airspeak-red text-white hover:bg-airspeak-red/90 text-sm font-semibold"
      >
        <Plus className="w-4 h-4" /> Yeni kelime
      </button>
      {open && <WordOfDayForm mode="create" onClose={() => setOpen(false)} />}
    </>
  );
}
