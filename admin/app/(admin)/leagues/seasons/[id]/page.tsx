import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Trophy } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { GroupRow } from '@/components/leagues/GroupRow';

const CLASS_LABEL: Record<string, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  sapphire: 'Safir',
  ruby: 'Yakut',
  emerald: 'Zümrüt',
  diamond: 'Elmas',
};

const CLASS_ORDER = [
  'bronze',
  'silver',
  'gold',
  'sapphire',
  'ruby',
  'emerald',
  'diamond',
] as const;

export default async function SeasonGroupsPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data: season } = await (supabase as any)
    .from('league_seasons')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!season) notFound();

  const { data: groupsRaw } = await (supabase as any)
    .from('league_groups')
    .select('*')
    .eq('season_id', params.id)
    .order('class_tier', { ascending: false })
    .order('member_count', { ascending: false });

  // Class bazlı grupla (UI için)
  const groupsByClass: Record<string, any[]> = {};
  for (const g of (groupsRaw ?? []) as any[]) {
    if (!groupsByClass[g.class_tier]) groupsByClass[g.class_tier] = [];
    groupsByClass[g.class_tier]!.push(g);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link
        href="/leagues"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy"
      >
        <ChevronLeft className="w-4 h-4" /> Lig Yönetimi
      </Link>

      <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4">
        <Trophy className="w-8 h-8 text-airspeak-gold" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-airspeak-navy">
            {(season as any).season_type.toUpperCase()} · {(season as any).year}
            {(season as any).season_type === 'weekly' && ` W${(season as any).period_number}`}
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            {(season as any).start_date} → {(season as any).end_date} · {(season as any).status}
          </p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded font-bold uppercase ${
            (season as any).status === 'active'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {(season as any).status}
        </span>
      </div>

      <div className="space-y-6">
        {[...CLASS_ORDER].reverse().map((cls) => {
          const groups = groupsByClass[cls] ?? [];
          if (groups.length === 0) return null;
          return (
            <div key={cls}>
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span>{CLASS_LABEL[cls]}</span>
                <span className="text-xs text-muted-foreground">({groups.length} grup)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groups.map((g) => (
                  <GroupRow key={g.id} group={g} />
                ))}
              </div>
            </div>
          );
        })}
        {(groupsRaw ?? []).length === 0 && (
          <p className="text-muted-foreground text-center py-8">Bu sezona ait grup yok.</p>
        )}
      </div>
    </div>
  );
}
