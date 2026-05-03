/**
 * /admin/notifications/analytics — delivery breakdown by type + günlük trend
 */
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default async function NotificationAnalyticsPage() {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();

  const since = new Date(Date.now() - 30 * 86400e3).toISOString();
  const { data } = await (supabase as any)
    .from('notification_log')
    .select('type, sent_at, read_at, tapped_at, error')
    .gte('sent_at', since);

  const rows = (data ?? []) as any[];

  // Tip bazlı breakdown
  const byType = new Map<string, { sent: number; read: number; tapped: number; errors: number }>();
  for (const r of rows) {
    const cur = byType.get(r.type) ?? { sent: 0, read: 0, tapped: 0, errors: 0 };
    cur.sent++;
    if (r.read_at) cur.read++;
    if (r.tapped_at) cur.tapped++;
    if (r.error) cur.errors++;
    byType.set(r.type, cur);
  }
  const typeRows = Array.from(byType.entries())
    .map(([type, m]) => ({ type, ...m }))
    .sort((a, b) => b.sent - a.sent);

  // Günlük trend (son 14 gün)
  const days: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400e3).toISOString().slice(0, 10);
    days[d] = 0;
  }
  for (const r of rows) {
    const d = (r.sent_at as string).slice(0, 10);
    if (d in days) days[d] = (days[d] ?? 0) + 1;
  }
  const dayEntries = Object.entries(days);
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Bildirimler
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-airspeak-navy" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Notification Analytics</h1>
        </div>
        <p className="text-muted-foreground mt-2">Son 30 gün · {rows.length} kayıt</p>
      </div>

      {/* Günlük trend bar chart */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3 text-muted-foreground">
          Son 14 gün — günlük gönderim
        </h2>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-end gap-1 h-32">
            {dayEntries.map(([d, v]) => (
              <div key={d} className="flex-1 flex flex-col items-center gap-1" title={`${d}: ${v}`}>
                <div className="w-full flex items-end" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-airspeak-red/80 rounded-t"
                    style={{ height: `${(v / maxDay) * 100}%`, minHeight: v ? 2 : 0 }}
                  />
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">{d.slice(8, 10)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tip bazlı breakdown */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3 text-muted-foreground">
          Tip bazlı dağılım
        </h2>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tip</th>
                <th className="px-4 py-3 text-right font-semibold w-24">Gönderilen</th>
                <th className="px-4 py-3 text-right font-semibold w-32">Okuma %</th>
                <th className="px-4 py-3 text-right font-semibold w-32">Tap %</th>
                <th className="px-4 py-3 text-right font-semibold w-24">Hata</th>
              </tr>
            </thead>
            <tbody>
              {typeRows.map((r) => (
                <tr key={r.type} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs">{r.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{r.sent}</td>
                  <td className="px-4 py-3 text-right">
                    {r.sent ? `${Math.round((r.read / r.sent) * 100)}%` : '—'}
                    <span className="text-xs text-muted-foreground ml-1">({r.read})</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.sent ? `${Math.round((r.tapped / r.sent) * 100)}%` : '—'}
                    <span className="text-xs text-muted-foreground ml-1">({r.tapped})</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.errors > 0 ? (
                      <span className="text-red-600 font-semibold">{r.errors}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {typeRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Veri yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
