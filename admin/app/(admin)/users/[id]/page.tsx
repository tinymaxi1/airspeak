import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import {
  UserDetailView,
  type UserProfile,
  type ExperienceRow,
  type EducationRow,
  type CertificationRow,
  type TypeRatingRow,
  type AuditEntry,
} from '@/components/users/UserDetailView';

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const adminProfile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!profile) notFound();

  const [
    experiencesRes,
    educationRes,
    certificationsRes,
    typeRatingsRes,
    badgeCountRes,
    auditRes,
    authUserRes,
  ] = await Promise.all([
    (supabase as any)
      .from('user_experiences')
      .select('*')
      .eq('user_id', params.id)
      .order('start_date', { ascending: false }),
    (supabase as any)
      .from('user_education')
      .select('*')
      .eq('user_id', params.id)
      .order('graduation_year', { ascending: false, nullsFirst: false }),
    (supabase as any)
      .from('user_certifications')
      .select('*')
      .eq('user_id', params.id)
      .order('issue_date', { ascending: false, nullsFirst: false }),
    (supabase as any)
      .from('user_type_ratings')
      .select('*')
      .eq('user_id', params.id)
      .order('hours', { ascending: false, nullsFirst: false }),
    (supabase as any)
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', params.id),
    (supabase as any)
      .from('admin_actions')
      .select('id, action, table_name, diff, metadata, created_at')
      .eq('target_user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(50),
    (supabase as any).auth.admin.getUserById(params.id),
  ]);

  const lastSignInAt: string | null =
    authUserRes?.data?.user?.last_sign_in_at ?? null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy"
      >
        <ChevronLeft className="w-4 h-4" /> Kullanıcılar
      </Link>

      <UserDetailView
        profile={profile as UserProfile}
        experiences={(experiencesRes.data ?? []) as ExperienceRow[]}
        education={(educationRes.data ?? []) as EducationRow[]}
        certifications={(certificationsRes.data ?? []) as CertificationRow[]}
        typeRatings={(typeRatingsRes.data ?? []) as TypeRatingRow[]}
        badgeCount={badgeCountRes.count ?? 0}
        lastSignInAt={lastSignInAt}
        auditEntries={(auditRes.data ?? []) as AuditEntry[]}
        currentAdminRole={adminProfile.admin_role}
      />
    </div>
  );
}
