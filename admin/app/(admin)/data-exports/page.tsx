/**
 * /admin/data-exports — KVKK/GDPR data export queue.
 *
 * super_admin manuel "İşle" → kullanıcı verisini JSON oluştur,
 * admin browser'dan indirir, destek ekibi email gönderir.
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { FileJson } from 'lucide-react';
import { DataExportRowActions } from '@/components/dataExports/DataExportRowActions';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  processing: 'İşleniyor',
  ready: 'Hazır',
  sent: 'Gönderildi',
  failed: 'Hata',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  ready: 'bg-emerald-100 text-emerald-700',
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

export default async function DataExportsPage() {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { data } = await (supabase as any)
    .from('data_export_requests')
    .select(
      `
      id, user_id, status, requested_at, completed_at, file_url, error,
      profile:profiles!data_export_requests_user_id_fkey(username, full_name)
      `,
    )
    .order('requested_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as any[];
  const pending = rows.filter((r) => r.status === 'pending' || r.status === 'processing');
  const completed = rows.filter((r) => r.status === 'sent' || r.status === 'ready');
  const failed = rows.filter((r) => r.status === 'failed');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-airspeak-navy" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Veri Export Talepleri</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {rows.length} talep · KVKK md.11/h + GDPR md.20 (data portability)
          </p>
        </div>
      </div>

      {pending.length > 0 && (
        <Section title="Bekleyen / İşleniyor" rows={pending} />
      )}
      {completed.length > 0 && <Section title="Gönderildi" rows={completed} />}
      {failed.length > 0 && <Section title="Hata" rows={failed} />}

      {rows.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
          Henüz talep yok. Kullanıcılar Settings → Privacy üzerinden talep ediyor.
        </div>
      )}

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">📋 Akış</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Kullanıcı mobile'dan Settings → Gizlilik → "Verilerimi indir" der.</li>
          <li>RPC <code>request_data_export</code> talebi pending olarak yaratır (24h rate limit).</li>
          <li>Burada <strong>İşle</strong> butonu kullanıcının tüm public verisini JSON'a çevirir.</li>
          <li>Browser dosyayı otomatik indirir; destek ekibi email ile kullanıcıya iletir.</li>
          <li>Status <em>sent</em> olur, kullanıcı yeniden talep edebilir.</li>
        </ul>
      </section>
    </div>
  );

  function Section({ title, rows }: { title: string; rows: any[] }) {
    return (
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-muted-foreground">
          {title} ({rows.length})
        </h2>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
                <th className="px-4 py-3 text-left font-semibold w-44">İstek tarihi</th>
                <th className="px-4 py-3 text-left font-semibold w-28">Durum</th>
                <th className="px-4 py-3 text-left font-semibold w-44">Tamamlandı</th>
                <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {row.profile?.full_name ?? row.profile?.username ?? '—'}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{row.user_id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(row.requested_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-bold ${STATUS_COLOR[row.status] ?? ''}`}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                    {row.error && (
                      <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={row.error}>
                        {row.error}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.completed_at ? new Date(row.completed_at).toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <DataExportRowActions row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
