import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';

export default async function ScenariosPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('scenarios')
    .select('*')
    .order('role', { ascending: true })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">AI Senaryolar</h1>
          <p className="text-muted-foreground mt-1">{(data ?? []).length} senaryo</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Yeni senaryo
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-24">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Başlık</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Zor</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s: any) => (
              <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{s.role ?? 'all'}</td>
                <td className="px-4 py-3 text-xs">{s.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold line-clamp-1">{s.title_tr ?? s.title}</p>
                </td>
                <td className="px-4 py-3 text-xs">{s.difficulty}/5</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz senaryo yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
