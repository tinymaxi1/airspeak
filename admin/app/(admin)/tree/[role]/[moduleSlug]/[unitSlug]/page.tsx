import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import { CreateLessonButton } from '@/components/forms/LessonActions';
import { StatusActions } from '@/components/forms/StatusActions';
import { LessonListWithPreview } from '@/components/preview/LessonListWithPreview';

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ role: string; moduleSlug: string; unitSlug: string }>;
}) {
  const { role, moduleSlug, unitSlug } = await params;
  const supabase = await createClient();

  const { data: unit } = await (supabase as any)
    .from('units')
    .select('id, slug, number, title, title_tr, description, status')
    .eq('slug', unitSlug)
    .single();

  if (!unit) notFound();

  const { data: lessons } = await (supabase as any)
    .from('lessons')
    .select('id, slug, number, title, title_tr, type, xp, estimated_minutes, is_premium, status, sort, exercises(id)')
    .eq('unit_id', unit.id)
    .order('sort', { ascending: true });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link
          href={`/tree/${role}/${moduleSlug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {moduleSlug}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              ÜNİTE {String(unit.number).padStart(2, '0')}
            </p>
            <h1 className="text-3xl font-bold text-airspeak-navy">{unit.title_tr ?? unit.title}</h1>
          </div>
          <CreateLessonButton
            unitId={unit.id}
            unitSlug={unitSlug}
            role={role}
            moduleSlug={moduleSlug}
          />
        </div>
        <div className="mt-3">
          <StatusActions
            table="units"
            id={unit.id}
            status={unit.status}
            revalidate={[`/tree/${role}/${moduleSlug}`, `/tree/${role}/${moduleSlug}/${unitSlug}`]}
            label={unit.title_tr ?? unit.title}
            canDelete
          />
        </div>
      </div>

      <LessonListWithPreview
        lessons={lessons ?? []}
        role={role}
        moduleSlug={moduleSlug}
        unitSlug={unitSlug}
      />
    </div>
  );
}
