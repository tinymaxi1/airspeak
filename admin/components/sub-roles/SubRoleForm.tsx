'use client';

/**
 * SubRoleForm — Yeni veya düzenle drawer.
 *
 * 20 dil için names/descriptions tab'li editor.
 * TR/EN zorunlu, diğer 18 opsiyonel (admin'den eklenir veya boş kalır).
 */
import { useState } from 'react';
import { Loader2, Plus, Pencil, AlertTriangle, X } from 'lucide-react';
import {
  createSubRole,
  updateSubRole,
  type SubRolePayload,
  type ParentRole,
} from '@/lib/sub-roles/actions';

// 20 dil — flag emoji + isim
const LANGS: { code: string; flag: string; name: string }[] = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'ja', flag: '🇯🇵', name: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: '한국어' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
  { code: 'el', flag: '🇬🇷', name: 'Ελληνικά' },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
  { code: 'ms', flag: '🇲🇾', name: 'Bahasa Melayu' },
  { code: 'th', flag: '🇹🇭', name: 'ไทย' },
];

const PARENT_ROLES: { id: ParentRole; label: string; emoji: string }[] = [
  { id: 'pilot', label: 'Pilot', emoji: '✈️' },
  { id: 'atc', label: 'ATC', emoji: '🗼' },
  { id: 'cabin', label: 'Kabin', emoji: '🎧' },
  { id: 'technician', label: 'Teknisyen', emoji: '⚙️' },
  { id: 'ground', label: 'Yer', emoji: '💼' },
  { id: 'student', label: 'Öğrenci', emoji: '📖' },
  { id: 'dispatcher', label: 'Dispatcher', emoji: '📊' },
];

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<SubRolePayload> & { id?: string };
  onClose: () => void;
}

export function SubRoleForm({ mode, initial, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tr' | string>('tr');

  const [id, setId] = useState(initial?.id ?? '');
  const [parentRole, setParentRole] = useState<ParentRole>(initial?.parent_role ?? 'pilot');
  const [displayOrder, setDisplayOrder] = useState<number>(initial?.display_order ?? 0);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [names, setNames] = useState<Record<string, string>>(initial?.names ?? { tr: '', en: '' });
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    initial?.descriptions ?? { tr: '', en: '' },
  );

  // Auto-suggest id from EN name (sadece create mode)
  function handleNameChange(lang: string, val: string) {
    setNames((prev) => ({ ...prev, [lang]: val }));
    if (mode === 'create' && lang === 'en' && !id) {
      const suggested = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40);
      if (suggested.length >= 3) {
        setId(`${parentRole.slice(0, 5)}_${suggested}`.slice(0, 40));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // TR ve EN'i temizle (boş string ise key'i sil — UX olarak alt diller boş kalabilsin)
    const cleanedNames: Record<string, string> = {};
    Object.entries(names).forEach(([k, v]) => {
      if (v.trim()) cleanedNames[k] = v.trim();
    });
    const cleanedDescs: Record<string, string> = {};
    Object.entries(descriptions).forEach(([k, v]) => {
      if (v.trim()) cleanedDescs[k] = v.trim();
    });

    const payload: SubRolePayload = {
      id: id.trim(),
      parent_role: parentRole,
      display_order: displayOrder,
      active,
      icon: icon.trim() || null,
      names: cleanedNames,
      descriptions: Object.keys(cleanedDescs).length > 0 ? cleanedDescs : null,
    };

    const result =
      mode === 'create'
        ? await createSubRole(payload)
        : await updateSubRole(initial!.id!, {
            display_order: payload.display_order,
            active: payload.active,
            icon: payload.icon,
            names: payload.names,
            descriptions: payload.descriptions,
          });

    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Bilinmeyen hata');
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
            {mode === 'create' ? 'Yeni alt-rol' : `Düzenle: ${initial?.id}`}
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
          {/* ID + Parent role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">ID * (örn pilot_a320)</label>
              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase())}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 border rounded text-sm font-mono disabled:bg-gray-100"
                placeholder="pilot_a320"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Küçük harf + rakam + _ (3-40 karakter)
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Parent rol *</label>
              <select
                value={parentRole}
                onChange={(e) => setParentRole(e.target.value as ParentRole)}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 border rounded text-sm disabled:bg-gray-100"
              >
                {PARENT_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.emoji} {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon + Order + Active */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Icon (emoji)</label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-full px-3 py-2 border rounded text-2xl text-center"
                placeholder="✈️"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Sıra</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4"
                />
                Aktif
              </label>
            </div>
          </div>

          {/* Names + Descriptions tabs */}
          <div className="border rounded-lg overflow-hidden">
            <div className="flex flex-wrap gap-1 bg-secondary px-2 py-2 border-b">
              {LANGS.map((l) => {
                const isActive = activeTab === l.code;
                const hasName = !!names[l.code]?.trim();
                const isRequired = l.code === 'tr' || l.code === 'en';
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setActiveTab(l.code)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      isActive
                        ? 'bg-airspeak-navy text-white'
                        : hasName
                          ? 'bg-emerald-100 text-emerald-700'
                          : isRequired
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-white text-muted-foreground'
                    }`}
                  >
                    {l.flag} {l.code.toUpperCase()}
                    {isRequired && !hasName && ' *'}
                  </button>
                );
              })}
            </div>
            {LANGS.map((l) => {
              if (l.code !== activeTab) return null;
              const isRequired = l.code === 'tr' || l.code === 'en';
              return (
                <div key={l.code} className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {l.flag} {l.name} — İsim {isRequired && '*'}
                    </label>
                    <input
                      required={isRequired}
                      value={names[l.code] ?? ''}
                      onChange={(e) => handleNameChange(l.code, e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder={l.code === 'tr' ? 'A320 Pilot' : l.code === 'en' ? 'A320 Pilot' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      {l.flag} {l.name} — Açıklama (opsiyonel, 1-2 cümle)
                    </label>
                    <textarea
                      value={descriptions[l.code] ?? ''}
                      onChange={(e) =>
                        setDescriptions((prev) => ({ ...prev, [l.code]: e.target.value }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder={
                        l.code === 'tr'
                          ? 'Airbus A320 ailesi — orta menzil dar gövde...'
                          : l.code === 'en'
                            ? 'Airbus A320 family — medium-range narrow-body...'
                            : ''
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

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
              disabled={busy}
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

export function CreateSubRoleButton({ defaultParent }: { defaultParent?: ParentRole }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-airspeak-red text-white hover:bg-airspeak-red/90 text-sm font-semibold"
      >
        <Plus className="w-4 h-4" /> Yeni alt-rol
      </button>
      {open && (
        <SubRoleForm
          mode="create"
          initial={defaultParent ? { parent_role: defaultParent, display_order: 0 } : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
