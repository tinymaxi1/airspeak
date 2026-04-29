import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CreateGenericButton,
  EditGenericButton,
} from '@/components/forms/GenericTableForm';
import { StatusActions } from '@/components/forms/StatusActions';
import { ICAO4_SCHEMA } from '@/lib/content/schemas';

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
        <CreateGenericButton schema={ICAO4_SCHEMA} label="Yeni soru" />
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
              <th className="px-4 py-3 text-right font-semibold w-72">Aksiyon</th>
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
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditGenericButton schema={ICAO4_SCHEMA} row={q} />
                    <StatusActions
                      table="icao4_questions"
                      id={q.id}
                      status={q.status}
                      revalidate="/icao4"
                      label={q.question.slice(0, 40)}
                      canDelete
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
