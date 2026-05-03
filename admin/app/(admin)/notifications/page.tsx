/**
 * /admin/notifications — log liste + delivery özet + sub-nav
 */
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Bell, BarChart3, Megaphone } from 'lucide-react';

export default async function NotificationsPage() {
  await requireAdminRole('reviewer');
  const supabase = createServiceClient();

  const { data } = await (supabase as any)
    .from('notification_log')
    .select(
      `id, user_id, type, title, body, channel, sent_at, read_at, tapped_at, error,
       profile:profiles!notification_log_user_id_fkey(username, full_name)`,
    )
    .order('sent_at', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as any[];

  const sinceMs = Date.now() - 7 * 86400e3;
  const recent = rows.filter((r) => new Date(r.sent_at).getTime() >= sinceMs);
  const sent7d = recent.length;
  const read7d = recent.filter((r) => r.read_at).length;
  const tapped7d = recent.filter((r) => r.tapped_at).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-airspeak-navy" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Bildirimler</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {rows.length} kayıt (son 200) · push delivery + in-app log
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/notifications/analytics"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border hover:bg-secondary text-sm font-semibold"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          <Link
            href="/notifications/broadcast"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-airspeak-red text-white hover:bg-airspeak-red/90 text-sm font-semibold"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Gönder
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Gönderilen (7g)" value={sent7d} />
        <Stat
          label="Okuma oranı"
          value={sent7d ? `${Math.round((read7d / sent7d) * 100)}%` : '—'}
          sub={`${read7d} okundu`}
        />
        <Stat
          label="Tap oranı"
          value={sent7d ? `${Math.round((tapped7d / sent7d) * 100)}%` : '—'}
          sub={`${tapped7d} tıklandı`}
        />
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-44">Tarih</th>
              <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-semibold w-36">Tip</th>
              <th className="px-4 py-3 text-left font-semibold">Başlık · İçerik</th>
              <th className="px-4 py-3 text-center font-semibold w-32">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(row.sent_at).toLocaleString('tr-TR')}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="font-semibold">
                    {row.profile?.full_name ?? row.profile?.username ?? '—'}
                  </div>
                  <div className="font-mono text-muted-foreground">{row.user_id.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block text-xs px-2 py-0.5 rounded bg-airspeak-navy/10 font-mono">
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold line-clamp-1">{row.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{row.body}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <DeliveryBadge row={row} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz log kaydı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold text-airspeak-navy mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function DeliveryBadge({ row }: { row: any }) {
  if (row.error) {
    return (
      <span className="inline-block text-xs px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
        Hata
      </span>
    );
  }
  if (row.tapped_at) {
    return (
      <span className="inline-block text-xs px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">
        Tap ✓
      </span>
    );
  }
  if (row.read_at) {
    return (
      <span className="inline-block text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-700">
        Okundu
      </span>
    );
  }
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-700">
      Gönderildi
    </span>
  );
}
