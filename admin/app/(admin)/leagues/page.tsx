import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Trophy } from 'lucide-react';
import { AdminLeaguesView } from '@/components/leagues/AdminLeaguesView';

export default async function AdminLeaguesPage() {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  // Aktif sezonlar (3 tip) + group/member counts
  const { data: seasonsRaw } = await (supabase as any)
    .from('league_seasons')
    .select('id, season_type, year, period_number, start_date, end_date, status')
    .eq('status', 'active');

  const activeSeasons = await Promise.all(
    ((seasonsRaw ?? []) as any[]).map(async (s) => {
      const { count: groupCount } = await (supabase as any)
        .from('league_groups')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', s.id);
      const { count: memberCount } = await (supabase as any)
        .from('league_memberships')
        .select('*, league_groups!inner(season_id)', { count: 'exact', head: true })
        .eq('league_groups.season_id', s.id);
      return { ...s, group_count: groupCount ?? 0, member_count: memberCount ?? 0 };
    }),
  );

  // Şampiyonlar (son 200)
  const { data: champsRaw } = await (supabase as any)
    .from('championships')
    .select(
      'id, championship_type, year, period_number, role, level_tier, user_id, snapshot_xp, awarded_at, profiles(username, full_name)',
    )
    .order('awarded_at', { ascending: false })
    .limit(200);

  const championships = ((champsRaw ?? []) as any[]).map((c) => ({
    id: c.id,
    championship_type: c.championship_type,
    year: c.year,
    period_number: c.period_number,
    role: c.role,
    level_tier: c.level_tier,
    user_id: c.user_id,
    username: c.profiles?.username ?? null,
    full_name: c.profiles?.full_name ?? null,
    snapshot_xp: c.snapshot_xp,
    awarded_at: c.awarded_at,
  }));

  // Ödüller (son 100)
  const { data: rewardsRaw } = await (supabase as any)
    .from('league_rewards')
    .select(
      'id, user_id, rank, reward_type, reward_value, granted_at, profiles(username)',
    )
    .order('granted_at', { ascending: false })
    .limit(100);

  const rewards = ((rewardsRaw ?? []) as any[]).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    username: r.profiles?.username ?? null,
    rank: r.rank,
    reward_type: r.reward_type,
    reward_value: r.reward_value,
    granted_at: r.granted_at,
  }));

  // Reward toplamları
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString();

  async function sumCoins(since: string) {
    const { data } = await (supabase as any)
      .from('league_rewards')
      .select('reward_value')
      .eq('reward_type', 'coin')
      .gte('granted_at', since);
    return ((data ?? []) as any[]).reduce(
      (s, r) => s + (Number(r.reward_value?.amount) || 0),
      0,
    );
  }

  const [totalRewardCoinsWeek, totalRewardCoinsMonth, totalRewardCoinsYear] =
    await Promise.all([sumCoins(weekAgo), sumCoins(monthAgo), sumCoins(yearAgo)]);

  // Premium gift count (revenue_events)
  const { count: premiumGiftCount } = await (supabase as any)
    .from('revenue_events')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'promo')
    .gte('created_at', yearAgo);

  // Şüpheli aktivite (view)
  const { data: suspiciousRaw } = await (supabase as any)
    .from('suspicious_xp_view')
    .select('*')
    .limit(50);

  const suspiciousRows = (suspiciousRaw ?? []) as any[];

  // Manuel flag'ler
  const { data: manualFlagsRaw } = await (supabase as any)
    .from('suspicious_flags')
    .select('id, user_id, reason, detail, flagged_at, reviewed_at, resolution, profiles(username)')
    .order('flagged_at', { ascending: false })
    .limit(50);

  const manualFlags = ((manualFlagsRaw ?? []) as any[]).map((f) => ({
    id: f.id,
    user_id: f.user_id,
    username: f.profiles?.username ?? null,
    reason: f.reason,
    detail: f.detail,
    flagged_at: f.flagged_at,
    reviewed_at: f.reviewed_at,
    resolution: f.resolution,
  }));

  // Config
  const { data: configRaw } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'league')
    .order('key');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-gold/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-airspeak-gold" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Lig Yönetimi</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Aktif sezonlar, şampiyonlar, ödüller, şüpheli aktivite, runtime config.
        </p>
      </div>

      <AdminLeaguesView
        activeSeasons={activeSeasons as any}
        championships={championships}
        rewards={rewards}
        suspiciousRows={suspiciousRows}
        manualFlags={manualFlags}
        config={(configRaw ?? []) as any}
        totalRewardCoinsWeek={totalRewardCoinsWeek}
        totalRewardCoinsMonth={totalRewardCoinsMonth}
        totalRewardCoinsYear={totalRewardCoinsYear}
        premiumGiftCount={premiumGiftCount ?? 0}
      />
    </div>
  );
}
