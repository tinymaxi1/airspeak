import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, ChevronRight, Plus, Crown } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

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
          <button
            disabled
            className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
            title="Faz 4"
          >
            <Plus className="w-4 h-4" /> Yeni ders
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(lessons ?? []).map((l: any) => (
          <Link
            key={l.id}
            href={`/tree/${role}/${moduleSlug}/${unitSlug}/${l.slug}`}
            className="group bg-white border border-border rounded-xl p-4 hover:border-airspeak-red hover:shadow-sm transition flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-airspeak-red/10 flex items-center justify-center text-xl">
              {TYPE_ICON[l.type] ?? '✈'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-airspeak-navy">
                  {l.title_tr ?? l.title}
                </h3>
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
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-airspeak-red group-hover:translate-x-1 transition" />
          </Link>
        ))}
        {(lessons ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Henüz ders yok.</div>
        )}
      </div>
    </div>
  );
}
