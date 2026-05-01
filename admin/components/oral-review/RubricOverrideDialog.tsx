'use client';

/**
 * RubricOverrideDialog — 6 descriptor 1-6 + band + note.
 *
 * Action 'confirm' → AI sonucu bırak, status='confirmed'.
 * Action 'override' → manuel rubric/band yaz, status='overridden'.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { resolveOralReview } from '@/lib/oral-review/actions';
import { toast } from 'sonner';
import { Check, Edit3 } from 'lucide-react';

const DESCRIPTORS: { key: string; code: string; name: string }[] = [
  { key: 'pronunciation', code: 'PRO', name: 'Pronunciation' },
  { key: 'structure', code: 'STR', name: 'Structure' },
  { key: 'vocabulary', code: 'VOC', name: 'Vocabulary' },
  { key: 'fluency', code: 'FLU', name: 'Fluency' },
  { key: 'comprehension', code: 'CMP', name: 'Comprehension' },
  { key: 'interactions', code: 'INT', name: 'Interactions' },
];

interface Props {
  attemptId: string;
  initialRubric: Record<string, number> | null;
  initialBand: number | null;
}

export function ConfirmReviewButton({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await resolveOralReview({ attemptId, action: 'confirm' });
          if (r.ok) {
            toast.success('AI sonucu onaylandı');
            router.refresh();
          } else toast.error(r.error ?? 'Hata');
        })
      }
      title="AI sonucunu onayla (değiştirme)"
    >
      <Check className="w-4 h-4" />
    </Button>
  );
}

export function OverrideButton({ attemptId, initialRubric, initialBand }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setOpen(true)}
        title="Rubric override et"
      >
        <Edit3 className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <OverrideForm
            attemptId={attemptId}
            initialRubric={initialRubric}
            initialBand={initialBand}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function OverrideForm({
  attemptId,
  initialRubric,
  initialBand,
  onClose,
}: Props & { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rubric, setRubric] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const d of DESCRIPTORS) {
      o[d.key] = String(initialRubric?.[d.key] ?? 4);
    }
    return o;
  });
  const [band, setBand] = useState<string>(String(initialBand ?? 4));
  const [note, setNote] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const newRubric: Record<string, number> = {};
    for (const d of DESCRIPTORS) {
      const v = Number(rubric[d.key] ?? 4);
      if (v < 1 || v > 6) {
        toast.error(`${d.code} 1-6 arası olmalı`);
        return;
      }
      newRubric[d.key] = v;
    }
    const b = Number(band);
    if (b < 1 || b > 6) {
      toast.error('Band 1-6 arası olmalı');
      return;
    }
    startTransition(async () => {
      const r = await resolveOralReview({
        attemptId,
        action: 'override',
        newRubric,
        newBand: b,
        note: note.trim() || undefined,
      });
      if (r.ok) {
        toast.success('Override kaydedildi');
        onClose();
        router.refresh();
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Rubric override</DialogTitle>
        <DialogDescription>
          AI band'i: <strong>L{initialBand ?? '?'}</strong>. Yeni rubric kaydedilince
          kullanıcıya 'MOD ONAYLI' badge görünür.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3">
        {DESCRIPTORS.map((d) => (
          <div key={d.key}>
            <Label hint={d.name}>{d.code}</Label>
            <Input
              type="number"
              min={1}
              max={6}
              step={0.5}
              value={rubric[d.key]}
              onChange={(e) => setRubric((s) => ({ ...s, [d.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div>
        <Label hint="ICAO holistic min — düşük descriptor band'i belirler">Band</Label>
        <Input
          type="number"
          min={1}
          max={6}
          value={band}
          onChange={(e) => setBand(e.target.value)}
        />
      </div>

      <div>
        <Label>Reviewer notu (opsiyonel)</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </div>

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          İptal
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? 'Kaydediliyor…' : 'Override et'}
        </Button>
      </DialogFooter>
    </form>
  );
}
