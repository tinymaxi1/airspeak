import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateInterviewButton, EditInterviewButton } from '@/components/forms/InterviewForm';
import { StatusActions } from '@/components/forms/StatusActions';

export default async function InterviewsPage() {
  const supabase = await createClient();
  const { data: questions } = await (supabase as any)
    .from('interview_questions')
    .select('*')
    .order('role', { ascending: true })
    .limit(300);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Mülakat Soruları</h1>
          <p className="text-muted-foreground mt-1">{(questions ?? []).length} soru</p>
        </div>
        <CreateInterviewButton />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-24">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Soru</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Zor</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-72">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(questions ?? []).map((q: any) => (
              <tr key={q.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs uppercase tracking-wider font-bold">{q.role}</td>
                <td className="px-4 py-3 text-xs">{q.category}</td>
                <td className="px-4 py-3">
                  <p className="line-clamp-2 max-w-xl">{q.question}</p>
                  {q.airline_slug && (
                    <span className="text-xs text-muted-foreground">→ {q.airline_slug}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{q.difficulty}/5</td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditInterviewButton q={q} />
                    <StatusActions
                      table="interview_questions"
                      id={q.id}
                      status={q.status}
                      revalidate="/interviews"
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
