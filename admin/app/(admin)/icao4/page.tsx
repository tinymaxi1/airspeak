import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';

export default async function Icao4Page() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('icao4_questions')
    .select('*')
    .order('set_no', { ascending: true })
    .limit(500);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">ICAO 4 Sınav Soruları</h1>
          <p className="text-muted-foreground mt-1">{(data ?? []).length} soru</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Yeni soru
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-16">Set</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Bölüm</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Sev.</th>
              <th className="px-4 py-3 text-left font-semibold">Soru</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((q: any) => (
              <tr key={q.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-semibold">SET {q.set_no}</td>
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{q.section}</td>
                <td className="px-4 py-3 text-xs">{q.level}</td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-xl">{q.question}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
