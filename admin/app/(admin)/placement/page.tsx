import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CreatePlacementButton,
  EditPlacementButton,
} from '@/components/forms/PlacementForm';
import { StatusActions } from '@/components/forms/StatusActions';
import { FileWarning } from 'lucide-react';

const DIM_LABEL: Record<string, string> = {
  general_english: 'Genel İngilizce',
  aviation_english: 'Havacılık İngilizcesi',
  aviation_knowledge: 'Havacılık Bilgisi',
  communication: 'İletişim',
  generalEnglish: 'Genel İngilizce',
  aviationEnglish: 'Havacılık İngilizcesi',
  aviationKnowledge: 'Havacılık Bilgisi',
};

export default async function PlacementPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('placement_questions')
    .select('*')
    .order('dimension', { ascending: true })
    .limit(300);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Placement Test Soruları</h1>
          <p className="text-muted-foreground mt-1">{(data ?? []).length} soru · 4 boyutta seviye ölçümü</p>
        </div>
        <CreatePlacementButton label="Yeni soru" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-44">Boyut</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Sev.</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Soru</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-72">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((q: any) => {
              const missingContext =
                (q.format === 'passage' || q.format === 'scenario') && !q.context;
              return (
                <tr key={q.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-xs">{DIM_LABEL[q.dimension] ?? q.dimension}</td>
                  <td className="px-4 py-3 text-xs">{q.level}</td>
                  <td className="px-4 py-3 text-xs">{q.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      {missingContext && (
                        <span
                          title={`${q.format} — ${q.format === 'passage' ? 'pasaj' : 'senaryo'} eksik, yayına çıkamaz`}
                          className="shrink-0 mt-0.5 text-airspeak-red"
                        >
                          <FileWarning className="w-4 h-4" />
                        </span>
                      )}
                      <p className="line-clamp-2 max-w-xl">{q.question}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <EditPlacementButton row={q} />
                      <StatusActions
                        table="placement_questions"
                        id={q.id}
                        status={q.status}
                        revalidate="/placement"
                        label={q.question.slice(0, 40)}
                        canDelete
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
