import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, ChevronRight, Crown } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateLessonButton } from '@/components/forms/LessonActions';
import { StatusActions } from '@/components/forms/StatusActions';

const TYPE_ICON: Record<string, string> = {
  vocabulary: '📖',
  dialogue: '💬',
  listening: '🎧',
  pronunciation: '🎙',
  quiz: '⭐',
  reading: '📰',
  speaking: '🗣',
};

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
    <div className="max-w-5xl mx-auto space-y-6">
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

      <div className="space-y-2">
        {(lessons ?? []).map((l: any) => (
          <div
            key={l.id}
            className="bg-white border border-border rounded-xl p-4 hover:border-airspeak-red hover:shadow-sm transition flex items-center gap-3"
          >
            <Link
              href={`/tree/${role}/${moduleSlug}/${unitSlug}/${l.slug}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-10 h-10 rounded-full bg-airspeak-red/10 flex items-center justify-center text-xl">
                {TYPE_ICON[l.type] ?? '✈'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-airspeak-navy">{l.title_tr ?? l.title}</h3>
                  <StatusBadge status={l.status} />
                  {l.is_premium && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-airspeak-gold/20 text-amber-800">
                      <Crown className="w-3 h-3" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(l.exercises?.length ?? 0)} egzersiz · ~{l.estimated_minutes} dk · +{l.xp} XP
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <StatusActions
                table="lessons"
                id={l.id}
                status={l.status}
                revalidate={[`/tree/${role}/${moduleSlug}/${unitSlug}`]}
                label={l.title_tr ?? l.title}
                canDelete
              />
              <Link
                href={`/tree/${role}/${moduleSlug}/${unitSlug}/${l.slug}`}
                className="p-2 text-muted-foreground hover:text-airspeak-red"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
        {(lessons ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Henüz ders yok.</div>
        )}
      </div>
    </div>
  );
}
