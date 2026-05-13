import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guard';
import { CreateListenSolveButton, EditListenSolveButton } from '@/components/forms/ListenSolveForm';
import { StatusActions } from '@/components/forms/StatusActions';
import { BulkPracticePanel, type PracticeRow } from '@/components/forms/BulkPracticePanel';

export default async function ListenSolvePage() {
  const me = await requireAdmin();
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('listen_solve_drills')
    .select('*')
    .order('target_role', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  const rows: PracticeRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    level: r.level,
    target_role: r.target_role,
    status: r.status,
    summary: `🔊 ${r.audio_text?.slice(0, 60) ?? ''}  →  ${r.question_tr ?? ''}`,
    meta: `${r.category ?? ''} · ✓ ${r.correct_id?.toUpperCase() ?? '—'}`,
    raw: r,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Dinle & Çöz</h1>
          <p className="text-muted-foreground mt-1">
            {rows.length} drill · listening + multi-choice
          </p>
        </div>
        <CreateListenSolveButton label="Yeni drill" />
      </div>

      <BulkPracticePanel
        table="listen_solve_drills"
        revalidate="/listen-solve"
        rows={rows}
        columnHeaders={{ summary: 'Audio + Soru', meta: 'Kategori · Cevap' }}
        canDelete={me.admin_role === 'super_admin'}
        renderActions={(row) => (
          <>
            <EditListenSolveButton row={row.raw} />
            <StatusActions
              table="listen_solve_drills"
              id={row.id}
              status={row.status}
              revalidate="/listen-solve"
              label={row.summary?.slice(0, 60)}
              canDelete={me.admin_role === 'super_admin'}
            />
          </>
        )}
      />
    </div>
  );
}
