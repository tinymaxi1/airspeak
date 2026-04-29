import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Plus, Edit3, Volume2, Image } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

const EX_TYPE_LABEL: Record<string, string> = {
  'vocab-mc': '📝 Çoktan seçmeli',
  'fill-blank': '✏️ Boşluk doldur',
  'dialogue-fill': '💬 Diyalog',
  'listening-mc': '🎧 Dinleme',
  'pronunciation-record': '🎙 Telaffuz',
  match: '🔗 Eşleştir',
  order: '📋 Sırala',
  'drag-drop': '🎯 Sürükle-bırak',
  'open-text': '📖 Serbest',
};

export default async function LessonExercisesPage({
  params,
}: {
  params: Promise<{ role: string; moduleSlug: string; unitSlug: string; lessonSlug: string }>;
}) {
  const { role, moduleSlug, unitSlug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: lesson } = await (supabase as any)
    .from('lessons')
    .select('id, slug, number, title, title_tr, type, xp, estimated_minutes, is_premium, status')
    .eq('slug', lessonSlug)
    .single();

  if (!lesson) notFound();

  const { data: exercises } = await (supabase as any)
    .from('exercises')
    .select('id, slug, sort, type, prompt, prompt_tr, options, correct_id, audio_url, image_url, status, difficulty')
    .eq('lesson_id', lesson.id)
    .order('sort', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/tree/${role}/${moduleSlug}/${unitSlug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {unitSlug}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">DERS {lesson.number}</p>
            <h1 className="text-3xl font-bold text-airspeak-navy flex items-center gap-3">
              {lesson.title_tr ?? lesson.title}
              <StatusBadge status={lesson.status} />
            </h1>
            <p className="text-muted-foreground mt-1">
              {(exercises ?? []).length} egzersiz · ~{lesson.estimated_minutes} dk · +{lesson.xp} XP
            </p>
          </div>
          <div className="flex gap-2">
            <button
              disabled
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
              title="Faz 4"
            >
              <Edit3 className="w-4 h-4" /> Düzenle
            </button>
            <button
              disabled
              className="flex items-center gap-2 bg-airspeak-navy/40 text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
              title="Faz 4"
            >
              <Plus className="w-4 h-4" /> Egzersiz
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {(exercises ?? []).map((ex: any, idx: number) => (
          <div key={ex.id} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-airspeak-red text-white flex items-center justify-center text-sm font-bold tabular-nums shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs font-semibold text-airspeak-navy bg-secondary px-2 py-0.5 rounded">
                    {EX_TYPE_LABEL[ex.type] ?? ex.type}
                  </span>
                  <StatusBadge status={ex.status} />
                  {ex.audio_url && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> ses
                    </span>
                  )}
                  {ex.image_url && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Image className="w-3 h-3" /> görsel
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">zor: {ex.difficulty}/5</span>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {ex.prompt_tr ?? ex.prompt ?? '(içerik yok)'}
                </p>
                {Array.isArray(ex.options) && ex.options.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {ex.options.map((opt: any) => (
                      <div
                        key={opt.id}
                        className={`text-xs px-2 py-1.5 rounded border ${
                          opt.id === ex.correct_id
                            ? 'bg-airspeak-green/10 border-airspeak-green/40 text-emerald-800 font-semibold'
                            : 'bg-secondary border-border text-muted-foreground'
                        }`}
                      >
                        <span className="opacity-50 mr-1">{opt.id}.</span> {opt.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(exercises ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Henüz egzersiz yok.</div>
        )}
      </div>
    </div>
  );
}
