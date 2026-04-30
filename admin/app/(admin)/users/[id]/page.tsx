import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import {
  UserDetailView,
  type UserProfile,
  type ExperienceRow,
  type EducationRow,
  type CertificationRow,
  type TypeRatingRow,
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
    { data: experiences },
    { data: education },
    { data: certifications },
    { data: typeRatings },
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
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy"
      >
        <ChevronLeft className="w-4 h-4" /> Kullanıcılar
      </Link>

      <UserDetailView
        profile={profile as UserProfile}
        experiences={(experiences ?? []) as ExperienceRow[]}
        education={(education ?? []) as EducationRow[]}
        certifications={(certifications ?? []) as CertificationRow[]}
        typeRatings={(typeRatings ?? []) as TypeRatingRow[]}
        currentAdminRole={adminProfile.admin_role}
      />
    </div>
  );
}
