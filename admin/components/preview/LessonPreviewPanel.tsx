'use client';

import { ExercisePreview } from './ExercisePreview';
import { Loader2 } from 'lucide-react';

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  vocabulary: { label: 'KELIME', color: 'bg-blue-100 text-blue-800' },
  dialogue: { label: 'DİYALOG', color: 'bg-purple-100 text-purple-800' },
  listening: { label: 'DİNLEME', color: 'bg-emerald-100 text-emerald-800' },
  pronunciation: { label: 'TELAFFUZ', color: 'bg-rose-100 text-rose-800' },
  quiz: { label: 'QUIZ', color: 'bg-amber-100 text-amber-800' },
  reading: { label: 'OKUMA', color: 'bg-sky-100 text-sky-800' },
  speaking: { label: 'KONUŞMA', color: 'bg-pink-100 text-pink-800' },
};

export function LessonPreviewPanel({
  lesson,
  exercises,
  loading,
}: {
  lesson: any | null;
  exercises: any[];
  loading: boolean;
}) {
  if (!lesson) {
    return (
      <div className="p-8 text-center text-muted-foreground">Ders seçilmedi</div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex justify-center">
      {/* iPhone frame — scale 0.7 */}
      <div
        className="relative bg-black rounded-[44px] shadow-2xl"
        style={{
          width: 390 * 0.7,
          padding: 8,
        }}
      >
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div
          className="bg-[#FAFAF7] rounded-[36px] overflow-hidden"
          style={{
            width: '100%',
            height: 844 * 0.7,
          }}
        >
          {/* Status bar (sahte) */}
          <div className="h-7 flex items-center justify-between px-5 text-[10px] font-bold pt-2">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span>●●●</span>
              <span>•</span>
              <span>📶</span>
              <span>🔋</span>
            </span>
          </div>

          {/* Lesson header */}
          <div className="px-4 pt-2 pb-3 border-b border-[#EDEFF3] bg-white">
            <div className="flex items-center justify-between">
              <button className="text-xs text-[#5A6478]">← Geri</button>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                  TYPE_BADGE[lesson.type]?.color ?? 'bg-gray-100'
                }`}
              >
                {TYPE_BADGE[lesson.type]?.label ?? lesson.type}
              </span>
            </div>
            <h1 className="text-[15px] font-bold text-[#0E1116] mt-2 leading-tight">
              {lesson.title_tr ?? lesson.title}
            </h1>
            <p className="text-[10px] text-[#8A93A6] mt-1">
              {exercises.length} egzersiz · ~{lesson.estimated_minutes} dk · +{lesson.xp} XP
            </p>
          </div>

          {/* Scrollable content */}
          <div
            className="overflow-y-auto p-3 space-y-3"
            style={{ height: 844 * 0.7 - 28 - 90 }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-32 text-[#8A93A6]">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-xs">Yükleniyor…</span>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 text-[#8A93A6] text-xs">
                Bu derste henüz egzersiz yok.
              </div>
            ) : (
              exercises.map((ex, i) => (
                <div key={ex.id}>
                  <ExercisePreview exercise={ex} index={i + 1} total={exercises.length} />
                  {i < exercises.length - 1 && (
                    <div className="my-3 h-px bg-[#EDEFF3]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
