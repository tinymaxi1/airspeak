'use server';

/**
 * Admin lig yönetim server actions.
 *
 * Hepsi super_admin yetkisi (yıkıcı potansiyel).
 * Audit: log_admin_action her aksiyona.
 */
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';

type LeagueClass =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'diamond';

async function logAdmin(
  supabase: ReturnType<typeof createServiceClient>,
  action: string,
  meta: Record<string, unknown>,
) {
  await (supabase as any).rpc('log_admin_action', {
    p_action: action,
    p_table_name: meta.table ?? null,
    p_target_user_id: meta.target_user_id ?? null,
    p_metadata: meta,
  });
}

// ─── Manuel rotation ──────────────────────────────────────────────────────
async function callEdgeOrRpc(
  edgeFn: string,
  rpcName: string,
): Promise<{ ok: boolean; result?: unknown; error?: string }> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${edgeFn}`;
  const token = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const json = await res.json();
    if (!res.ok) {
      return { ok: false, error: json?.error ?? `edge ${res.status}` };
    }
    return { ok: true, result: json };
  } catch {
    // Fallback SQL RPC
    const supabase = createServiceClient();
    const { data, error } = await (supabase as any).rpc(rpcName);
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: { ...data, fallback: 'sql_rpc' } };
  }
}

export async function manualRotateWeekly(): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  await requireAdminRole('super_admin');
  const r = await callEdgeOrRpc('league-weekly-rotation', 'rotate_active_weekly_league');
  const supabase = createServiceClient();
  await logAdmin(supabase, 'bulk_update', {
    table: 'league_seasons',
    source: 'admin_manual_rotate_weekly',
    result: r.result,
  });
  revalidatePath('/leagues');
  return r;
}

export async function manualRotateMonthly(): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  await requireAdminRole('super_admin');
  const r = await callEdgeOrRpc('league-monthly-rotation', 'rotate_monthly_championships');
  const supabase = createServiceClient();
  await logAdmin(supabase, 'bulk_update', {
    table: 'championships',
    source: 'admin_manual_rotate_monthly',
    result: r.result,
  });
  revalidatePath('/leagues');
  return r;
}

export async function manualRotateYearly(): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  await requireAdminRole('super_admin');
  const r = await callEdgeOrRpc('league-yearly-rotation', 'rotate_yearly_championships');
  const supabase = createServiceClient();
  await logAdmin(supabase, 'bulk_update', {
    table: 'championships',
    source: 'admin_manual_rotate_yearly',
    result: r.result,
  });
  revalidatePath('/leagues');
  return r;
}

// ─── Manuel ödül ──────────────────────────────────────────────────────────
export async function manualGrantReward(args: {
  userId: string;
  amount: number;
  rewardType: 'coin' | 'badge' | 'promotion';
  reason: string;
  rewardValue?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  // Aktif weekly season — manual reward'lar ona iliştirilir (audit izi için)
  const { data: season } = await (supabase as any)
    .from('league_seasons')
    .select('id')
    .eq('season_type', 'weekly')
    .eq('status', 'active')
    .maybeSingle();

  if (!season?.id) {
    return { ok: false, error: 'Aktif weekly season yok' };
  }

  const { error } = await (supabase as any).from('league_rewards').insert({
    user_id: args.userId,
    season_id: season.id,
    reward_type: args.rewardType,
    reward_value: {
      ...(args.rewardValue ?? {}),
      amount: args.amount,
      reason: args.reason,
      manual: true,
    },
  });
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'set_premium', {
    table: 'league_rewards',
    target_user_id: args.userId,
    action_subtype: 'manual_grant_reward',
    amount: args.amount,
    reason: args.reason,
  });
  revalidatePath('/leagues');
  return { ok: true };
}

// ─── Sınıf değiştir / grup taşı ──────────────────────────────────────────
export async function changeUserLeagueClass(args: {
  userId: string;
  newClass: LeagueClass;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error: profErr } = await (supabase as any)
    .from('profiles')
    .update({ current_league_class: args.newClass })
    .eq('id', args.userId);
  if (profErr) return { ok: false, error: profErr.message };

  // Mevcut weekly membership'i kaldır, lazy assign yeni class ile yeniden atar
  const { data: oldMembership } = await (supabase as any)
    .from('league_memberships')
    .select(
      'id, group_id, league_groups!inner(season_id, league_seasons!inner(season_type, status))',
    )
    .eq('user_id', args.userId)
    .eq('league_groups.league_seasons.season_type', 'weekly')
    .eq('league_groups.league_seasons.status', 'active')
    .maybeSingle();

  if (oldMembership) {
    await (supabase as any)
      .from('league_memberships')
      .delete()
      .eq('id', (oldMembership as any).id);
    await (supabase as any)
      .from('league_groups')
      .update({ member_count: 0 })
      .eq('id', (oldMembership as any).group_id);
  }

  await (supabase as any).rpc('assign_user_to_league', {
    p_user_id: args.userId,
    p_default_class: args.newClass,
  });

  await logAdmin(supabase, 'update', {
    table: 'profiles',
    target_user_id: args.userId,
    action_subtype: 'change_league_class',
    new_class: args.newClass,
  });
  revalidatePath('/leagues');
  revalidatePath(`/users/${args.userId}`);
  return { ok: true };
}

export async function moveUserToGroup(args: {
  userId: string;
  newGroupId: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { data: existing } = await (supabase as any)
    .from('league_memberships')
    .select('id, group_id')
    .eq('user_id', args.userId)
    .maybeSingle();

  if (existing) {
    await (supabase as any)
      .from('league_memberships')
      .update({ group_id: args.newGroupId })
      .eq('id', (existing as any).id);
  } else {
    await (supabase as any)
      .from('league_memberships')
      .insert({ user_id: args.userId, group_id: args.newGroupId });
  }

  await logAdmin(supabase, 'update', {
    table: 'league_memberships',
    target_user_id: args.userId,
    action_subtype: 'move_to_group',
    new_group_id: args.newGroupId,
  });
  revalidatePath('/leagues');
  return { ok: true };
}

// ─── XP düzelt ────────────────────────────────────────────────────────────
export async function adjustUserXp(args: {
  userId: string;
  delta: number;
  reason: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { data: current } = await (supabase as any)
    .from('user_xp_summary')
    .select('total_xp, week_xp, month_xp, year_xp')
    .eq('user_id', args.userId)
    .maybeSingle();

  if (!current) {
    return { ok: false, error: 'user_xp_summary kaydı yok' };
  }

  const newTotal = Math.max(0, (current as any).total_xp + args.delta);
  const newWeek = Math.max(0, (current as any).week_xp + args.delta);
  const newMonth = Math.max(0, (current as any).month_xp + args.delta);
  const newYear = Math.max(0, (current as any).year_xp + args.delta);

  const { error } = await (supabase as any)
    .from('user_xp_summary')
    .update({
      total_xp: newTotal,
      week_xp: newWeek,
      month_xp: newMonth,
      year_xp: newYear,
    })
    .eq('user_id', args.userId);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'update', {
    table: 'user_xp_summary',
    target_user_id: args.userId,
    action_subtype: 'adjust_xp',
    delta: args.delta,
    reason: args.reason,
  });
  revalidatePath('/leagues');
  revalidatePath(`/users/${args.userId}`);
  return { ok: true };
}

// ─── Şüpheli işaretle ─────────────────────────────────────────────────────
export async function flagSuspiciousUser(args: {
  userId: string;
  reason: string;
  detail?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any).from('suspicious_flags').insert({
    user_id: args.userId,
    reason: args.reason,
    detail: args.detail ?? null,
  });
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'update', {
    table: 'suspicious_flags',
    target_user_id: args.userId,
    action_subtype: 'flag',
    reason: args.reason,
  });
  revalidatePath('/leagues');
  return { ok: true };
}

export async function resolveSuspiciousFlag(args: {
  flagId: string;
  resolution: 'cleared' | 'banned' | 'warned';
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('suspicious_flags')
    .update({
      reviewed_at: new Date().toISOString(),
      resolution: args.resolution,
    })
    .eq('id', args.flagId);
  if (error) return { ok: false, error: error.message };

  await logAdmin(supabase, 'update', {
    table: 'suspicious_flags',
    action_subtype: 'resolve_flag',
    flag_id: args.flagId,
    resolution: args.resolution,
  });
  revalidatePath('/leagues');
  return { ok: true };
}

// ─── Lig'den çıkar ────────────────────────────────────────────────────────
export async function removeUserFromLeague(args: {
  userId: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('league_memberships')
    .delete()
    .eq('user_id', args.userId);
  if (error) return { ok: false, error: error.message };

  await (supabase as any)
    .from('profiles')
    .update({ current_league_class: null })
    .eq('id', args.userId);

  await logAdmin(supabase, 'delete', {
    table: 'league_memberships',
    target_user_id: args.userId,
    action_subtype: 'remove_from_league',
  });
  revalidatePath('/leagues');
  revalidatePath(`/users/${args.userId}`);
  return { ok: true };
}
