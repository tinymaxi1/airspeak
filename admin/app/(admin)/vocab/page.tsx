import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';

export default async function VocabPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;
  const supabase = await createClient();

  let query = (supabase as any).from('vocab_terms').select('*').order('term', { ascending: true }).limit(200);
  if (role) query = query.eq('role', role);
  if (q) query = query.or(`term.ilike.%${q}%,term_tr.ilike.%${q}%`);

  const { data: terms } = await query;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Kelime Hazinesi</h1>
          <p className="text-muted-foreground mt-1">{(terms ?? []).length} terim listeleniyor (max 200)</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Yeni terim
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">EN</th>
              <th className="px-4 py-3 text-left font-semibold">TR</th>
              <th className="px-4 py-3 text-left font-semibold">Rol</th>
              <th className="px-4 py-3 text-left font-semibold">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Zor</th>
              <th className="px-4 py-3 text-left font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody>
            {(terms ?? []).map((t: any) => (
              <tr key={t.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-semibold">{t.term}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.term_tr}</td>
                <td className="px-4 py-3 text-xs">{t.role}</td>
                <td className="px-4 py-3 text-xs">{t.category}</td>
                <td className="px-4 py-3 text-xs">{t.difficulty}/5</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
            {(terms ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Sonuç yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
