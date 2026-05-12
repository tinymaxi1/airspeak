'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

const ROLES = [
  { id: 'pilot', label: '✈ Pilot' },
  { id: 'atc', label: '🗼 ATC' },
  { id: 'cabin', label: '🎧 Kabin' },
  { id: 'technician', label: '⚙ Teknisyen' },
  { id: 'ground', label: '💼 Yer' },
  { id: 'student', label: '📖 Öğrenci' },
];

const DIFFICULTIES = ['basic', 'intermediate', 'advanced'];

export function WordOfDayFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  function update(key: string, val: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`/word-of-day?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          defaultValue={sp.get('q') ?? ''}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Kelime ara..."
          className="w-full pl-9 pr-3 py-2 border rounded text-sm"
        />
      </div>

      <select
        value={sp.get('role') ?? ''}
        onChange={(e) => update('role', e.target.value || null)}
        className="px-3 py-2 border rounded text-sm"
      >
        <option value="">Tüm roller</option>
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      <select
        value={sp.get('difficulty') ?? ''}
        onChange={(e) => update('difficulty', e.target.value || null)}
        className="px-3 py-2 border rounded text-sm"
      >
        <option value="">Tüm zorluklar</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={sp.get('active') ?? ''}
        onChange={(e) => update('active', e.target.value || null)}
        className="px-3 py-2 border rounded text-sm"
      >
        <option value="">Aktif + Pasif</option>
        <option value="true">Sadece aktif</option>
        <option value="false">Sadece pasif</option>
      </select>
    </div>
  );
}
