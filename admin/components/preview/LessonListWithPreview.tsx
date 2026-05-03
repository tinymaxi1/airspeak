'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Crown, Eye, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StatusActions } from '@/components/forms/StatusActions';
import { LessonPreviewPanel } from './LessonPreviewPanel';

const TYPE_ICON: Record<string, string> = {
  vocabulary: '📖',
  dialogue: '💬',
  listening: '🎧',
  pronunciation: '🎙',
  quiz: '⭐',
  reading: '📰',
  speaking: '🗣',
};

interface Lesson {
  id: string;
  slug: string;
  number: number;
  title: string | null;
  title_tr: string | null;
  type: string;
  xp: number;
  estimated_minutes: number;
  is_premium: boolean;
  status: string;
  sort: number;
  exercises: Array<{ id: string }>;
}

interface Props {
  lessons: Lesson[];
  role: string;
  moduleSlug: string;
  unitSlug: string;
}

export function LessonListWithPreview({ lessons, role, moduleSlug, unitSlug }: Props) {
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    lesson: Lesson | null;
    exercises: any[];
    loading: boolean;
  }>({ lesson: null, exercises: [], loading: false });

  const closePreview = useCallback(() => setPreviewLessonId(null), []);

  // ESC key kapatır
  useEffect(() => {
    if (!previewLessonId) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [previewLessonId, closePreview]);

  // Lesson seçildiğinde exercise'ları çek
  useEffect(() => {
    if (!previewLessonId) {
      setPreviewData({ lesson: null, exercises: [], loading: false });
      return;
    }
    const lesson = lessons.find((l) => l.id === previewLessonId) ?? null;
    setPreviewData({ lesson, exercises: [], loading: true });

    void (async () => {
      const supabase = createClient();
      const { data } = await (supabase as any)
        .from('exercises')
        .select(
          'id, sort, type, prompt, prompt_tr, context, options, correct_id, audio_url, image_url, pairs, correct_order, is_true, transcript, target_text, explanation_tr',
        )
        .eq('lesson_id', previewLessonId)
        .order('sort', { ascending: true });
      setPreviewData({ lesson, exercises: data ?? [], loading: false });
    })();
  }, [previewLessonId, lessons]);

  const open = !!previewLessonId;

  return (
    <div className="relative">
      <div
        className={`grid gap-4 transition-all ${
          open ? 'grid-cols-1 lg:grid-cols-[2fr_3fr]' : 'grid-cols-1'
        }`}
      >
        {/* SOL: Lesson list */}
        <div className="space-y-2">
          {lessons.map((l) => (
            <div
              key={l.id}
              className={`bg-white border rounded-xl p-4 hover:shadow-sm transition flex items-center gap-3 ${
                previewLessonId === l.id
                  ? 'border-airspeak-red shadow-md ring-2 ring-airspeak-red/20'
                  : 'border-border hover:border-airspeak-red'
              }`}
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
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewLessonId(l.id)}
                  className={`px-2 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1 ${
                    previewLessonId === l.id
                      ? 'bg-airspeak-red text-white'
                      : 'text-airspeak-red hover:bg-airspeak-red/10 border border-airspeak-red/30'
                  }`}
                  title="Mobil önizleme"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Önizle
                </button>
                <StatusActions
                  table="lessons"
                  id={l.id}
                  status={l.status as 'draft' | 'review' | 'published' | 'archived'}
                  revalidate={[`/tree/${role}/${moduleSlug}/${unitSlug}`]}
                  label={l.title_tr ?? l.title ?? undefined}
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
          {lessons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Henüz ders yok.</div>
          )}
        </div>

        {/* SAĞ: Preview panel — desktop sticky, mobile overlay */}
        {open && (
          <>
            {/* Mobile overlay backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={closePreview}
            />
            <div className="lg:sticky lg:top-4 lg:self-start fixed lg:relative inset-x-4 top-4 bottom-4 lg:inset-auto z-50 bg-white rounded-xl border border-border shadow-xl lg:shadow-none overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-airspeak-navy text-white">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-white/60">
                    📱 MOBİL ÖNİZLEME
                  </div>
                  <div className="font-semibold text-sm truncate">
                    {previewData.lesson?.title_tr ?? previewData.lesson?.title ?? 'Yükleniyor…'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="p-1 hover:bg-white/10 rounded"
                  title="Kapat (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-secondary/30">
                <LessonPreviewPanel
                  lesson={previewData.lesson}
                  exercises={previewData.exercises}
                  loading={previewData.loading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
