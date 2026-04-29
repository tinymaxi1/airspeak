import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus } from 'lucide-react';

const TASK_LABEL: Record<string, string> = {
  picture_description: 'Resim tasviri',
  story_telling: 'Hikâye anlatma',
  problem_solving: 'Problem çözme',
  common_topics: 'Genel konular',
};

export default async function OralPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('oral_prompts')
    .select('*')
    .order('task_type', { ascending: true })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Sözlü Sınav Promptları</h1>
          <p className="text-muted-foreground mt-1">{(data ?? []).length} prompt</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Yeni prompt
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-44">Görev tipi</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Sev.</th>
              <th className="px-4 py-3 text-left font-semibold">Prompt</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs">{TASK_LABEL[p.task_type] ?? p.task_type}</td>
                <td className="px-4 py-3 text-xs">{p.level}</td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-2xl">{p.prompt}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
