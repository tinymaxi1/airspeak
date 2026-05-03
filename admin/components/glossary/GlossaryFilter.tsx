'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export function GlossaryFilter({
  categories,
  initial,
}: {
  categories: Record<string, string>;
  initial: { q?: string; category?: string; verified?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(k: string, v: string) {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    router.push(`/glossary?${sp.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Term ara…"
          defaultValue={initial.q ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value);
          }}
          className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-white"
        />
      </div>
      <select
        value={initial.category ?? ''}
        onChange={(e) => update('category', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tüm kategoriler</option>
        {Object.entries(categories).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select
        value={initial.verified ?? ''}
        onChange={(e) => update('verified', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tümü</option>
        <option value="true">Doğrulanmış</option>
        <option value="false">Doğrulanmamış</option>
      </select>
    </div>
  );
}
