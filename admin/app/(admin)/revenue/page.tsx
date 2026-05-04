import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Crown, TrendingUp, Users, Calendar, DollarSign, Settings } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getIapConfig } from '@/lib/iap/actions';
import { IapSettingsForm } from '@/components/iap/IapSettingsForm';

interface PremiumUser {
  id: string;
  username: string | null;
  full_name: string | null;
  premium_until: string;
  days_remaining: number;
  last_event: string | null;
  current_tier: string | null;
}

interface RevenueEvent {
  id: string;
  user_id: string;
  event_type: string;
  tier: string | null;
  amount_try: number | null;
  source: string | null;
  created_at: string;
}

async function getMetrics() {
  const supabase = await createClient();

  const [
    { data: activeUsers },
    { data: recentEvents },
    { count: totalUsers },
    { count: activePremium },
  ] = await Promise.all([
    (supabase as any).from('active_premium_users').select('*').order('days_remaining', { ascending: false }).limit(50),
    (supabase as any).from('revenue_events').select('*').order('created_at', { ascending: false }).limit(50),
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }).gt('premium_until', new Date().toISOString()),
  ]);

  // Aylık tahmini gelir (active premium × ortalama tier fiyatı)
  const tierCounts = {
    monthly: 0,
    yearly: 0,
    lifetime: 0,
  };
  for (const u of (activeUsers ?? []) as PremiumUser[]) {
    if (u.current_tier === 'monthly') tierCounts.monthly++;
    else if (u.current_tier === 'yearly') tierCounts.yearly++;
    else if (u.current_tier === 'lifetime') tierCounts.lifetime++;
  }

  // 30 gün içinde dolacak premium
  const expiringSoon = (activeUsers ?? []).filter((u: PremiumUser) => u.days_remaining <= 30).length;

  return {
    totalUsers: totalUsers ?? 0,
    activePremium: activePremium ?? 0,
    expiringSoon,
    tierCounts,
    activeUsers: (activeUsers ?? []) as PremiumUser[],
    recentEvents: (recentEvents ?? []) as RevenueEvent[],
  };
}

export default async function RevenuePage() {
  await requireAdminRole('editor');
  const [m, iapRows] = await Promise.all([getMetrics(), getIapConfig()]);

  const conversionRate = m.totalUsers > 0
    ? ((m.activePremium / m.totalUsers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Premium / Revenue</h1>
        <p className="text-muted-foreground mt-1">
          Aktif premium kullanıcılar, tier dağılımı, son revenue events.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Toplam kullanıcı" value={m.totalUsers} color="text-airspeak-navy" />
        <Stat icon={Crown} label="Aktif Premium" value={m.activePremium} color="text-airspeak-gold" />
        <Stat icon={TrendingUp} label="Conversion" value={`%${conversionRate}`} color="text-airspeak-red" isString />
        <Stat icon={Calendar} label="30g içinde dolacak" value={m.expiringSoon} color="text-amber-600" />
      </div>

      {/* Tier dağılımı */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-bold text-lg mb-4">Tier Dağılımı</h2>
        <div className="space-y-3">
          {[
            { id: 'monthly', label: 'Aylık', count: m.tierCounts.monthly, color: 'bg-airspeak-red' },
            { id: 'yearly', label: 'Yıllık', count: m.tierCounts.yearly, color: 'bg-airspeak-gold' },
            { id: 'lifetime', label: 'Lifetime', count: m.tierCounts.lifetime, color: 'bg-airspeak-navy' },
          ].map((t) => {
            const total = m.tierCounts.monthly + m.tierCounts.yearly + m.tierCounts.lifetime;
            const pct = total > 0 ? (t.count / total) * 100 : 0;
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium">{t.label}</div>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${t.color}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-20 text-right text-sm tabular-nums">
                  {t.count} <span className="text-muted-foreground">(%{pct.toFixed(0)})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aktif premium tablosu */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">Aktif Premium Kullanıcılar</h2>
          <p className="text-xs text-muted-foreground mt-1">{m.activeUsers.length} kayıt — kalan gün'e göre sıralı</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-semibold w-28">Tier</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Bitiş</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Kalan</th>
              <th className="px-4 py-3 text-left font-semibold w-32">Son event</th>
            </tr>
          </thead>
          <tbody>
            {m.activeUsers.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-semibold">{u.full_name ?? u.username ?? '—'}</td>
                <td className="px-4 py-3 text-xs uppercase tracking-wider">{u.current_tier ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{formatDate(u.premium_until)}</td>
                <td className="px-4 py-3 text-xs">
                  <span className={u.days_remaining < 7 ? 'text-airspeak-red font-bold' : ''}>
                    {u.days_remaining} gün
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{u.last_event ?? '—'}</td>
              </tr>
            ))}
            {m.activeUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz aktif premium kullanıcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Son revenue events */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">Son Revenue Events</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold w-44">Event</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Tier</th>
              <th className="px-4 py-3 text-left font-semibold w-24">Tutar</th>
              <th className="px-4 py-3 text-left font-semibold w-20">Kaynak</th>
              <th className="px-4 py-3 text-left font-semibold">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {m.recentEvents.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs">{e.event_type}</td>
                <td className="px-4 py-3 text-xs">{e.tier ?? '—'}</td>
                <td className="px-4 py-3 text-xs tabular-nums">
                  {e.amount_try ? `₺${e.amount_try}` : '—'}
                </td>
                <td className="px-4 py-3 text-xs">{e.source ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(e.created_at)}</td>
              </tr>
            ))}
            {m.recentEvents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  Henüz revenue event yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sprint 13.A.7 — RevenueCat / IAP yapılandırması */}
      <section className="bg-secondary/30 border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-airspeak-navy" />
          <h2 className="font-bold text-lg">RevenueCat / IAP Yapılandırması</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          API key'leri RevenueCat dashboard'dan alıp buraya gir. Boş olduğu sürece mobil uygulamada
          paywall "Yakında aktif" gösterir; uygulama çökmez (mock-first).
        </p>
        <IapSettingsForm rows={iapRows} />
        <div className="text-xs text-muted-foreground bg-white border border-border rounded-lg p-3 space-y-1">
          <p className="font-semibold">Webhook kurulumu</p>
          <p>1. RevenueCat → Integrations → Webhooks → New webhook</p>
          <p>2. URL: <code className="bg-secondary px-1 rounded">https://&lt;project-ref&gt;.supabase.co/functions/v1/revenuecat-webhook</code></p>
          <p>3. Authorization header: <code className="bg-secondary px-1 rounded">Bearer &lt;webhook_secret&gt;</code></p>
          <p>4. Edge function deploy: <code className="bg-secondary px-1 rounded">supabase functions deploy revenuecat-webhook --project-ref &lt;ref&gt;</code></p>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
  isString,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  isString?: boolean;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <Icon className={`w-6 h-6 ${color}`} />
      <div className="mt-3 text-2xl font-bold tabular-nums">
        {isString ? value : (value as number).toLocaleString('tr-TR')}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
