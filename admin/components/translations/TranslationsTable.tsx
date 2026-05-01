'use client';

import { useState } from 'react';
import { Loader2, Sparkles, CheckCheck } from 'lucide-react';
import { triggerTranslation, bulkTranslate } from '@/lib/translations/actions';

interface Row {
  id: string;
  title: string;
  coverage: number;
}

export function TranslationsTable({
  contentType,
  rows,
  targetLangCount,
}: {
  contentType: string;
  rows: Row[];
  targetLangCount: number;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onTranslate(id: string) {
    setBusyId(id);
    const r = await triggerTranslation({ content_type: contentType, content_id: id });
    setBusyId(null);
    if (!r.ok) {
      alert('Hata: ' + r.error);
      return;
    }
    alert(
      `✓ ${r.translated ?? 0} hücre çevrildi (${r.target_langs?.length ?? 0} dil)\n` +
        `Provider: ${r.provider}\nMaliyet: $${(r.cost_usd ?? 0).toFixed(4)}`,
    );
    window.location.reload();
  }

  async function onBulk() {
    if (selected.size === 0) {
      alert('En az 1 kayıt seç.');
      return;
    }
    if (!confirm(`${selected.size} kayıt için eksik dilleri çevirelim mi?`)) return;
    setBulkBusy(true);
    const r = await bulkTranslate({
      content_type: contentType,
      content_ids: Array.from(selected),
    });
    setBulkBusy(false);
    alert(`✓ ${r.total - r.failed}/${r.total} başarılı, ${r.failed} hata.`);
    setSelected(new Set());
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBulk}
          disabled={bulkBusy || selected.size === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-airspeak-red text-white text-sm font-semibold disabled:opacity-50"
        >
          {bulkBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {selected.size} seçili — Toplu çevir
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === rows.length && rows.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
                  }
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Başlık</th>
              <th className="px-4 py-3 text-left font-semibold w-64">Coverage</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pct = Math.round((row.coverage / targetLangCount) * 100);
              const complete = row.coverage >= targetLangCount;
              return (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/30"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold line-clamp-1">{row.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {row.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${complete ? 'bg-emerald-500' : 'bg-airspeak-navy'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                        {row.coverage}/{targetLangCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {complete ? (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                        <CheckCheck className="w-3 h-3" /> Tam
                      </span>
                    ) : (
                      <button
                        onClick={() => onTranslate(row.id)}
                        disabled={busyId === row.id}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-airspeak-navy text-white hover:bg-airspeak-navy/90 disabled:opacity-50 font-semibold"
                      >
                        {busyId === row.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Çevriliyor…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" /> Çevir
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  Bu tipte kayıt yok veya filtreyle eşleşen yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
