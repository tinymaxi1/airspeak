import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateListenSolveButton, EditListenSolveButton } from '@/components/forms/ListenSolveForm';
import { StatusActions } from '@/components/forms/StatusActions';

export default async function ListenSolvePage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('listen_solve_drills')
    .select('*')
    .order('target_role', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Dinle & Çöz</h1>
          <p className="text-muted-foreground mt-1">
            {(data ?? []).length} drill · listening + multi-choice
          </p>
        </div>
        <CreateListenSolveButton label="Yeni drill" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Seviye</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold">Audio + Soru</th>
              <th className="px-4 py-3 text-left font-semibold w-12">✓</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-56">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((d: any) => (
              <tr key={d.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{d.target_role}</td>
                <td className="px-4 py-3 text-xs font-mono">{d.level ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{d.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <p className="text-xs italic text-muted-foreground line-clamp-1">🔊 {d.audio_text}</p>
                  <p className="text-sm mt-0.5 line-clamp-1">{d.question_tr}</p>
                </td>
                <td className="px-4 py-3 text-xs font-mono uppercase">{d.correct_id}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditListenSolveButton row={d} />
                    <StatusActions
                      table="listen_solve_drills"
                      id={d.id}
                      status={d.status}
                      revalidate="/listen-solve"
                      label={d.question_tr?.slice(0, 60)}
                      canDelete
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz drill yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
