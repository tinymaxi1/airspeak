import { createClient } from '@/lib/supabase/server';
import { Users, BookOpenCheck, Crown, Clock } from 'lucide-react';

async function getStats() {
  const supabase = await createClient();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: activeWeek },
    { count: premiumUsers },
    { count: adminUsers },
  ] = await Promise.all([
    (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
    (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('updated_at', weekAgo),
    (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('premium_until', now.toISOString()),
    (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    activeWeek: activeWeek ?? 0,
    premiumUsers: premiumUsers ?? 0,
    adminUsers: adminUsers ?? 0,
  };
}

export default async function AnalyticsPage() {
  const s = await getStats();
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Analitik</h1>
        <p className="text-muted-foreground mt-1">Hızlı genel bakış</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Toplam kullanıcı" value={s.totalUsers} color="text-airspeak-navy" />
        <Stat icon={Clock} label="7 günde aktif" value={s.activeWeek} color="text-blue-700" />
        <Stat icon={Crown} label="Premium" value={s.premiumUsers} color="text-amber-700" />
        <Stat icon={BookOpenCheck} label="Admin" value={s.adminUsers} color="text-airspeak-red" />
      </div>

      <div className="bg-airspeak-gold/10 border border-airspeak-gold/30 rounded-xl p-6">
        <p className="text-sm text-amber-900">
          📊 Detaylı analitik (DAU/WAU/MAU grafikleri, ders tamamlama oranı, ICAO 4 başarı oranı)
          Faz 7'de eklenecek. Şu an temel sayım gösteriliyor.
        </p>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <Icon className={`w-6 h-6 ${color}`} />
      <div className="mt-3 text-2xl font-bold tabular-nums">{value.toLocaleString('tr-TR')}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
