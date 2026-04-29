/**
 * Admin auth guard — server-side cookie + profiles.is_admin kontrolü.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AdminProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  is_admin: boolean;
  admin_role: 'super_admin' | 'editor' | 'reviewer' | null;
}

/**
 * Admin sayfalarında çağır — login değilse /login'e, admin değilse 403'e atar.
 * Geri admin profili döndürür.
 */
export async function requireAdmin(): Promise<AdminProfile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect('/login');
  }

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, username, full_name, is_admin, admin_role')
    .eq('id', user!.id)
    .single();

  if (profErr || !profile || !(profile as any).is_admin) {
    redirect('/403');
  }

  return profile as AdminProfile;
}

/**
 * Belirli bir minimum admin rolü gerektiren sayfalar için.
 * Hiyerarşi: super_admin > editor > reviewer.
 */
export async function requireAdminRole(
  minRole: 'super_admin' | 'editor' | 'reviewer',
): Promise<AdminProfile> {
  const profile = await requireAdmin();
  const lvl = (r: string | null) =>
    r === 'super_admin' ? 3 : r === 'editor' ? 2 : r === 'reviewer' ? 1 : 0;
  if (lvl(profile.admin_role) < lvl(minRole)) {
    redirect('/403');
  }
  return profile;
}
