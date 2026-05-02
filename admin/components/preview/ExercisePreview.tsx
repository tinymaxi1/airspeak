'use client';

import { Mic, Volume2 } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  matching: 'Eşleştir',
  ordering: 'Sırala',
  true_false: 'Doğru / Yanlış',
  fill_blank: 'Boşluk doldur',
  'fill-blank': 'Boşluk doldur',
  listening: 'Dinleme',
  'listening-mc': 'Dinleme',
  speaking: 'Konuşma',
  'pronunciation-record': 'Telaffuz',
  'vocab-mc': 'Çoktan seçmeli',
  'dialogue-fill': 'Diyalog',
  match: 'Eşleştir',
  order: 'Sırala',
  'drag-drop': 'Sürükle bırak',
  'open-text': 'Serbest',
};

export function ExercisePreview({
  exercise: ex,
  index,
  total,
}: {
  exercise: any;
  index: number;
  total: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#DCE0E8] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono text-[#8A93A6]">
          {index}/{total}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0F1E47]/10 text-[#0F1E47] font-semibold">
          {TYPE_LABEL[ex.type] ?? ex.type}
        </span>
      </div>

      {/* Prompt — tüm tiplere ortak */}
      {(ex.prompt_tr || ex.prompt) && (
        <p className="text-[12px] text-[#0E1116] font-medium leading-snug mb-2">
          {ex.prompt_tr ?? ex.prompt}
        </p>
      )}

      {/* Tipe-özel content */}
      {ex.type === 'matching' && <MatchingPreview pairs={ex.pairs ?? []} />}
      {(ex.type === 'ordering' || ex.type === 'order') && (
        <OrderingPreview options={ex.options ?? []} correctOrder={ex.correct_order ?? []} />
      )}
      {ex.type === 'true_false' && <TrueFalsePreview isTrue={ex.is_true} />}
      {(ex.type === 'fill_blank' || ex.type === 'fill-blank') && (
        <OptionsPreview options={ex.options ?? []} correctId={ex.correct_id} />
      )}
      {(ex.type === 'listening' || ex.type === 'listening-mc') && (
        <ListeningPreview
          audioUrl={ex.audio_url}
          transcript={ex.transcript}
          options={ex.options ?? []}
          correctId={ex.correct_id}
        />
      )}
      {(ex.type === 'speaking' || ex.type === 'pronunciation-record') && (
        <SpeakingPreview targetText={ex.target_text ?? ex.prompt} />
      )}
      {(ex.type === 'vocab-mc' || ex.type === 'dialogue-fill') && (
        <OptionsPreview options={ex.options ?? []} correctId={ex.correct_id} />
      )}

      {ex.explanation_tr && (
        <p className="mt-2 text-[10px] text-[#5A6478] italic leading-snug">
          💡 {ex.explanation_tr}
        </p>
      )}
    </div>
  );
}

// ─── Matching ─────────────────────────────────────────────
function MatchingPreview({ pairs }: { pairs: any[] }) {
  if (pairs.length === 0) {
    return <em className="text-[10px] text-[#8A93A6]">(eşleştirme çiftleri yok)</em>;
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1.5">
        <p className="text-[8px] font-bold uppercase text-[#8A93A6]">Sol</p>
        {pairs.map((p) => (
          <div
            key={`L-${p.id}`}
            className="px-2 py-1.5 bg-[#FAFAF7] border border-[#DCE0E8] rounded text-[11px] text-center"
          >
            {p.left}
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <p className="text-[8px] font-bold uppercase text-[#8A93A6]">Sağ</p>
        {pairs.map((p) => (
          <div
            key={`R-${p.id}`}
            className="px-2 py-1.5 bg-[#FAFAF7] border border-[#DCE0E8] rounded text-[11px] text-center"
          >
            {p.right}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Ordering ─────────────────────────────────────────────
function OrderingPreview({
  options,
  correctOrder,
}: {
  options: any[];
  correctOrder: any[];
}) {
  if (options.length === 0) {
    return <em className="text-[10px] text-[#8A93A6]">(sıralama öğeleri yok)</em>;
  }
  // correct_order'a göre sırala (id eşleşmesiyle)
  const ordered =
    Array.isArray(correctOrder) && correctOrder.length > 0
      ? correctOrder.map((id) => options.find((o) => o.id === id)).filter(Boolean)
      : options;
  return (
    <div className="space-y-1.5">
      {ordered.map((o: any, i: number) => (
        <div
          key={o.id}
          className="flex items-center gap-2 px-2 py-1.5 bg-[#FAFAF7] border border-[#DCE0E8] rounded"
        >
          <span className="w-5 h-5 rounded-full bg-[#0F1E47] text-white text-[9px] font-bold flex items-center justify-center">
            {i + 1}
          </span>
          <span className="text-[11px] text-[#0E1116]">{o.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── True/False ───────────────────────────────────────────
function TrueFalsePreview({ isTrue }: { isTrue: boolean | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-1">
      <button
        disabled
        className={`px-3 py-2 rounded border text-[11px] font-semibold ${
          isTrue === true
            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
            : 'bg-[#FAFAF7] border-[#DCE0E8] text-[#8A93A6]'
        }`}
      >
        ✓ Doğru
      </button>
      <button
        disabled
        className={`px-3 py-2 rounded border text-[11px] font-semibold ${
          isTrue === false
            ? 'bg-rose-50 border-rose-500 text-rose-700'
            : 'bg-[#FAFAF7] border-[#DCE0E8] text-[#8A93A6]'
        }`}
      >
        ✗ Yanlış
      </button>
    </div>
  );
}

// ─── Options (vocab-mc / fill-blank / fill_blank) ─────────
function OptionsPreview({
  options,
  correctId,
}: {
  options: any[];
  correctId: string | null;
}) {
  if (options.length === 0) {
    return <em className="text-[10px] text-[#8A93A6]">(şık yok)</em>;
  }
  return (
    <div className="space-y-1.5 mt-1">
      {options.map((o) => {
        const isCorrect = o.id === correctId;
        return (
          <div
            key={o.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[11px] ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold'
                : 'bg-[#FAFAF7] border-[#DCE0E8] text-[#0E1116]'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white border border-current text-[9px] font-bold flex items-center justify-center">
              {String(o.id).toUpperCase()}
            </span>
            <span className="flex-1">{o.text}</span>
            {isCorrect && <span className="text-[10px]">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Listening ────────────────────────────────────────────
function ListeningPreview({
  audioUrl,
  transcript,
  options,
  correctId,
}: {
  audioUrl: string | null;
  transcript: string | null;
  options: any[];
  correctId: string | null;
}) {
  return (
    <div className="space-y-2">
      {/* Audio player */}
      <div className="flex items-center gap-2 px-2 py-2 bg-[#0F1E47] rounded text-white">
        <button
          disabled
          className="w-7 h-7 rounded-full bg-[#FFD56B] text-[#0F1E47] flex items-center justify-center"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 h-1 bg-white/20 rounded-full">
          <div className="h-full w-0 bg-white rounded-full" />
        </div>
        <span className="text-[9px] font-mono">0:00</span>
      </div>
      {transcript && (
        <details className="text-[10px] bg-[#FAFAF7] border border-[#DCE0E8] rounded p-2">
          <summary className="cursor-pointer font-semibold text-[#5A6478]">
            Transcript
          </summary>
          <p className="mt-1 text-[#0E1116] leading-snug">{transcript}</p>
        </details>
      )}
      {options.length > 0 && (
        <OptionsPreview options={options} correctId={correctId} />
      )}
      {!audioUrl && (
        <p className="text-[9px] text-amber-700 italic">⚠ audio_url henüz yok (TTS bekleniyor)</p>
      )}
    </div>
  );
}

// ─── Speaking ─────────────────────────────────────────────
function SpeakingPreview({ targetText }: { targetText: string | null }) {
  return (
    <div className="space-y-2">
      {targetText ? (
        <div className="px-3 py-2 bg-[#FFF6E0] border border-[#F2C14E] rounded">
          <p className="text-[10px] font-bold uppercase text-[#704800] mb-1">Bunu oku:</p>
          <p className="text-[12px] text-[#0E1116] leading-snug font-medium">
            {targetText}
          </p>
        </div>
      ) : (
        <em className="text-[10px] text-[#8A93A6]">(target_text yok)</em>
      )}
      <div className="flex flex-col items-center py-2">
        <button
          disabled
          className="w-12 h-12 rounded-full bg-[#E63946] text-white flex items-center justify-center shadow-lg"
        >
          <Mic className="w-5 h-5" />
        </button>
        <span className="text-[9px] text-[#8A93A6] mt-1">Kayıt için bas</span>
      </div>
    </div>
  );
}
