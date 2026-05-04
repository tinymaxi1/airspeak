'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

export function GlossaryFilter({
  categories,
  initial,
}: {
  categories: Record<string, string>;
  initial: { q?: string; category?: string; verified?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Controlled q state — debounced URL sync
  const [q, setQ] = useState(initial.q ?? '');

  // initial.q dış kaynaklı değişirse (geri/ileri tuş) sync et
  useEffect(() => {
    setQ(initial.q ?? '');
  }, [initial.q]);

  // q değişince 250ms sonra URL'i güncelle
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      const trimmed = q.trim();
      const current = sp.get('q') ?? '';
      if (trimmed === current) return; // gereksiz push'u önle
      if (trimmed) sp.set('q', trimmed);
      else sp.delete('q');
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `/glossary?${qs}` : '/glossary');
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function updateOther(k: string, v: string) {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    startTransition(() => {
      router.replace(`/glossary${sp.toString() ? `?${sp.toString()}` : ''}`);
    });
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Term ara… (term, kısaltma, tanım)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-white"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            type="button"
            aria-label="Aramayı temizle"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isPending && q && !((q ?? '').trim() === (initial.q ?? '')) && (
          <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" />
        )}
      </div>
      <select
        value={initial.category ?? ''}
        onChange={(e) => updateOther('category', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tüm kategoriler</option>
        {Object.entries(categories).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select
        value={initial.verified ?? ''}
        onChange={(e) => updateOther('verified', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tümü</option>
        <option value="true">Doğrulanmış</option>
        <option value="false">Doğrulanmamış</option>
      </select>
    </div>
  );
}
