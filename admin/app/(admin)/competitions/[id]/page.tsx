import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { CompetitionDetailView } from '@/components/competitions/CompetitionDetailView';

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const adminProfile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data: comp } = await (supabase as any)
    .from('competitions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!comp) notFound();

  const [entriesRes, rewardsRes] = await Promise.all([
    (supabase as any)
      .from('competition_entries')
      .select('id, user_id, score, rank, joined_at, profiles(username, full_name)')
      .eq('competition_id', params.id)
      .order('score', { ascending: false })
      .order('joined_at', { ascending: true })
      .limit(200),
    (supabase as any)
      .from('competition_rewards')
      .select('*')
      .eq('competition_id', params.id)
      .order('rank', { ascending: true }),
  ]);

  const entries = ((entriesRes.data ?? []) as any[]).map((e) => ({
    id: e.id,
    user_id: e.user_id,
    username: e.profiles?.username ?? null,
    full_name: e.profiles?.full_name ?? null,
    score: e.score,
    rank: e.rank,
    joined_at: e.joined_at,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <CompetitionDetailView
        competition={comp}
        entries={entries}
        rewards={(rewardsRes.data ?? []) as any[]}
        canSuper={adminProfile.admin_role === 'super_admin'}
      />
    </div>
  );
}
