import { createClient } from '@/lib/supabase/server';
import { relativeTime } from '@/lib/utils';

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  create: { label: 'Oluştur', color: 'bg-airspeak-green/15 text-emerald-800' },
  update: { label: 'Güncelle', color: 'bg-blue-100 text-blue-700' },
  delete: { label: 'Sil', color: 'bg-destructive/15 text-destructive' },
  publish: { label: 'Yayınla', color: 'bg-airspeak-green/15 text-emerald-800' },
  unpublish: { label: 'Yayından kaldır', color: 'bg-amber-100 text-amber-700' },
  archive: { label: 'Arşivle', color: 'bg-secondary text-muted-foreground' },
  restore: { label: 'Geri yükle', color: 'bg-blue-100 text-blue-700' },
  set_premium: { label: '👑 Premium ver', color: 'bg-airspeak-gold/20 text-amber-800' },
  unset_premium: { label: 'Premium kaldır', color: 'bg-secondary' },
  ban_user: { label: '⛔ Yasakla', color: 'bg-destructive/15 text-destructive' },
  unban_user: { label: 'Yasağı kaldır', color: 'bg-airspeak-green/15 text-emerald-800' },
  set_admin_role: { label: 'Admin ata', color: 'bg-airspeak-red/15 text-airspeak-red' },
  unset_admin_role: { label: 'Admin kaldır', color: 'bg-secondary' },
};

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: actions } = await (supabase as any)
    .from('admin_actions_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Audit Log</h1>
        <p className="text-muted-foreground mt-1">Son 200 admin aksiyonu (immutable)</p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-32">Yapan</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Aksiyon</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Tablo</th>
              <th className="px-4 py-3 text-left font-semibold">Hedef</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Zaman</th>
            </tr>
          </thead>
          <tbody>
            {(actions ?? []).map((a: any) => {
              const cfg = ACTION_LABEL[a.action] ?? { label: a.action, color: 'bg-secondary' };
              return (
                <tr key={a.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-xs">{a.actor_username ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{a.table_name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {a.target_username ? `→ ${a.target_username}` : a.row_id ? a.row_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{relativeTime(a.created_at)}</td>
                </tr>
              );
            })}
            {(actions ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz admin aksiyonu yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
