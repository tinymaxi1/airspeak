import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateVocabButton, EditVocabButton } from '@/components/forms/VocabForm';
import { StatusActions } from '@/components/forms/StatusActions';

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
        <CreateVocabButton />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">EN</th>
              <th className="px-4 py-3 text-left font-semibold">TR</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Zor</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-72">Aksiyon</th>
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
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditVocabButton term={t} />
                    <StatusActions
                      table="vocab_terms"
                      id={t.id}
                      status={t.status}
                      revalidate="/vocab"
                      label={t.term_tr ?? t.term}
                      canDelete
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(terms ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
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
