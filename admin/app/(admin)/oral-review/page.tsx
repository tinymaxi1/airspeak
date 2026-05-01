/**
 * /admin/oral-review — Manual review queue.
 *
 * oral_review_queue view: low_confidence + user_disputed.
 * Reviewer audio dinler, transcript okur, rubric override eder ya da AI sonucu onaylar.
 */
import { requireAdminRole } from '@/lib/auth/guard';
import { getOralReviewQueue } from '@/lib/oral-review/actions';
import { AudioPlayer } from '@/components/oral-review/AudioPlayer';
import { ConfirmReviewButton, OverrideButton } from '@/components/oral-review/RubricOverrideDialog';
import { Mic, Calendar } from 'lucide-react';

const QUEUE_REASON_LABEL: Record<string, { label: string; color: string }> = {
  user_disputed: { label: 'Kullanıcı itirazı', color: 'bg-red-100 text-red-700' },
  low_confidence: { label: 'Düşük güven', color: 'bg-amber-100 text-amber-700' },
  other: { label: 'Diğer', color: 'bg-gray-100 text-gray-700' },
};

export default async function OralReviewPage() {
  await requireAdminRole('reviewer');
  const rows = await getOralReviewQueue();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Mic className="w-5 h-5 text-purple-700" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Oral Review Queue</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {rows.length} attempt review bekliyor · low_confidence + user_disputed
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
          <Mic className="w-12 h-12 mx-auto mb-3 opacity-40" />
          Review kuyruğunda kayıt yok.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const meta = QUEUE_REASON_LABEL[r.queue_reason] ?? QUEUE_REASON_LABEL.other!;
            const rubric = r.rubric as Record<string, number> | null;
            return (
              <div
                key={r.id}
                className="bg-white border border-border rounded-xl p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      {r.confidence_score !== null && (
                        <span className="text-xs font-mono text-muted-foreground">
                          conf: {Number(r.confidence_score).toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs font-mono text-muted-foreground">
                        · {r.provider ?? '—'}
                      </span>
                    </div>
                    <div className="text-sm font-semibold">
                      {r.full_name ?? r.username ?? 'Anonim'} ·{' '}
                      <span className="font-mono text-xs text-muted-foreground">
                        @{r.username ?? '?'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.attempted_at).toLocaleString('tr-TR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                      {r.duration_seconds && ` · ${r.duration_seconds}sn`}
                    </div>
                    {r.review_reason && (
                      <div className="text-xs italic text-airspeak-red mt-2 bg-red-50 p-2 rounded">
                        ↪ {r.review_reason}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <ConfirmReviewButton attemptId={r.id} />
                    <OverrideButton
                      attemptId={r.id}
                      initialRubric={rubric}
                      initialBand={r.band_score}
                    />
                  </div>
                </div>

                {/* Rubric */}
                {rubric && (
                  <div className="grid grid-cols-6 gap-2 bg-secondary/40 rounded-lg p-3">
                    {Object.entries(rubric).map(([k, v]) => (
                      <div key={k} className="text-center">
                        <div className="text-xs font-mono text-muted-foreground uppercase">
                          {k.slice(0, 3)}
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            Number(v) >= 4 ? 'text-emerald-700' : 'text-airspeak-red'
                          }`}
                        >
                          {Number(v).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transcript */}
                {r.transcript && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      Transcript
                    </div>
                    <div className="text-sm bg-secondary/40 rounded-lg p-3 italic line-clamp-4">
                      "{r.transcript}"
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {r.feedback_tr && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      AI Feedback (TR)
                    </div>
                    <div className="text-sm">{r.feedback_tr}</div>
                  </div>
                )}

                {/* Audio */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    Band: <strong className="text-airspeak-navy">L{r.band_score ?? '?'}</strong>
                  </div>
                  <AudioPlayer audioPath={r.audio_path} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
