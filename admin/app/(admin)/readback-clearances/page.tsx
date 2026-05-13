import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateReadbackButton, EditReadbackButton } from '@/components/forms/ReadbackForm';
import { StatusActions } from '@/components/forms/StatusActions';

export default async function ReadbackClearancesPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from('readback_clearances')
    .select('*')
    .order('target_role', { ascending: true })
    .order('sort', { ascending: true })
    .limit(500);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Telsiz Tekrarı</h1>
          <p className="text-muted-foreground mt-1">
            {(data ?? []).length} clearance · ATC read-back drill bank
          </p>
        </div>
        <CreateReadbackButton label="Yeni clearance" />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-20">Rol</th>
              <th className="px-4 py-3 text-left font-semibold w-16">Seviye</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Kategori</th>
              <th className="px-4 py-3 text-left font-semibold w-32">İstasyon · Freq</th>
              <th className="px-4 py-3 text-left font-semibold">ATC Utterance</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Durum</th>
              <th className="px-4 py-3 text-right font-semibold w-56">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{r.target_role}</td>
                <td className="px-4 py-3 text-xs font-mono">{r.level ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{r.category ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {r.station ? <span className="font-semibold">{r.station}</span> : '—'}
                  {r.freq ? ` · ${r.freq}` : ''}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm line-clamp-2">{r.atc_utterance}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <EditReadbackButton row={r} />
                    <StatusActions
                      table="readback_clearances"
                      id={r.id}
                      status={r.status}
                      revalidate="/readback-clearances"
                      label={r.atc_utterance?.slice(0, 60)}
                      canDelete
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz clearance yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
