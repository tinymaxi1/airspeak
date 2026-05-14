'use client';

import { useState } from 'react';
import { createRelease, type ChangeItem } from './actions';

interface DraftItem extends ChangeItem {
  _key: number;
}

let _nextKey = 1;
function makeItem(): DraftItem {
  return { _key: _nextKey++, emoji: '', title: '', description: '' };
}

export function CreateReleaseButton() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [tr, setTr] = useState<DraftItem[]>([makeItem()]);
  const [en, setEn] = useState<DraftItem[]>([makeItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setVersion('');
    setMandatory(false);
    setTr([makeItem()]);
    setEn([makeItem()]);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await createRelease({
      version: version.trim(),
      changes_tr: tr.map(({ _key, ...c }) => c),
      changes_en: en.map(({ _key, ...c }) => c),
      mandatory,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'Kaydedilemedi');
      return;
    }
    reset();
    setOpen(false);
    // Server Action revalidatePath ile sayfa yenilenir
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-airspeak-red px-4 py-2 text-sm font-semibold text-white hover:bg-airspeak-red/90"
      >
        + Yeni Release
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-airspeak-navy">Yeni release notu</h2>
              <button onClick={() => setOpen(false)} className="text-2xl text-airspeak-muted">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-airspeak-muted">
                    Version (semver)
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full rounded-lg border border-airspeak-border px-3 py-2 font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={mandatory}
                      onChange={(e) => setMandatory(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>Zorunlu güncelleme (kapatılamaz sheet)</span>
                  </label>
                </div>
              </div>

              <ChangeListEditor label="TR Yenilikler" items={tr} onChange={setTr} />
              <ChangeListEditor label="EN Yenilikler" items={en} onChange={setEn} />

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <div className="flex justify-end gap-2 border-t border-airspeak-border pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-airspeak-border px-4 py-2 text-sm"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-airspeak-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet + push gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChangeListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: DraftItem[];
  onChange: (next: DraftItem[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase text-airspeak-muted">{label}</label>
        <button
          onClick={() => onChange([...items, makeItem()])}
          className="text-xs font-semibold text-airspeak-red"
        >
          + Satır ekle
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item._key} className="grid grid-cols-[60px_1fr_2fr_auto] gap-2 items-start">
            <input
              type="text"
              value={item.emoji}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, emoji: e.target.value };
                onChange(next);
              }}
              placeholder="🔥"
              className="rounded-lg border border-airspeak-border px-2 py-2 text-center text-lg"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, title: e.target.value };
                onChange(next);
              }}
              placeholder="Başlık"
              className="rounded-lg border border-airspeak-border px-3 py-2 text-sm"
            />
            <textarea
              value={item.description}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, description: e.target.value };
                onChange(next);
              }}
              placeholder="Detaylı açıklama..."
              rows={2}
              className="rounded-lg border border-airspeak-border px-3 py-2 text-sm"
            />
            <button
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              disabled={items.length === 1}
              className="px-2 py-2 text-airspeak-muted hover:text-red-600 disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
