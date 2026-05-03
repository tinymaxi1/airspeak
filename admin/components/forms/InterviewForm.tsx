'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const ROLES = ['pilot', 'cabin', 'technician', 'ground', 'student'];
const CATEGORIES = [
  'motivational',
  'situational',
  'technical',
  'behavioral',
  'tricky',
  'english',
  'manager',
  'safety',
  'crm',
  'culture_knowledge',
  'role_specific',
];

interface Props {
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}

function InterviewForm({ mode, initial, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    role: initial?.role ?? 'pilot',
    airline_slug: initial?.airline_slug ?? '',
    category: initial?.category ?? 'motivational',
    difficulty: initial?.difficulty ?? 3,
    question: initial?.question ?? '',
    question_tr: initial?.question_tr ?? '',
    detailed_explanation_tr: initial?.detailed_explanation_tr ?? '',
    star_template_tr: initial?.star_template_tr ?? '',
    good_answer_points_tr: (initial?.good_answer_points_tr ?? []).join('\n'),
    red_flags_tr: (initial?.red_flags_tr ?? []).join('\n'),
    tips_tr: (initial?.tips_tr ?? []).join('\n'),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question) {
      toast.error('Soru zorunlu');
      return;
    }
    const payload = {
      role: form.role,
      airline_slug: form.airline_slug || null,
      category: form.category,
      difficulty: form.difficulty,
      question: form.question,
      question_tr: form.question_tr,
      detailed_explanation_tr: form.detailed_explanation_tr,
      star_template_tr: form.star_template_tr,
      good_answer_points_tr: form.good_answer_points_tr
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean),
      red_flags_tr: form.red_flags_tr
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean),
      tips_tr: form.tips_tr
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'interview_questions',
          {
            ...payload,
            slug: uniqueSlug(form.question, `iq_${form.role}_${form.category}`),
            status: 'draft',
          },
          ['/interviews'],
        );
        if (r.ok) {
          toast.success('Soru eklendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('interview_questions', initial.id, payload, ['/interviews']);
        if (r.ok) {
          toast.success('Güncellendi');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      }
    });
  }

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Mülakat Sorusu' : 'Soruyu Düzenle'}</DialogTitle>
        <DialogDescription>Havayolu mülakatları için soru bankası.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Rol</Label>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Kategori</Label>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Zorluk</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <Label hint="Boş bırakırsan tüm havayolları için geçerli">Havayolu slug (opsiyonel)</Label>
          <Input
            value={form.airline_slug}
            onChange={(e) => setForm({ ...form, airline_slug: e.target.value })}
            placeholder="turkish_airlines"
          />
        </div>

        <div>
          <Label required hint="İngilizce">Soru (EN)</Label>
          <Textarea
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            rows={2}
            placeholder="Why do you want to work for our airline?"
            required
          />
        </div>
        <div>
          <Label hint="Türkçe">Soru (TR)</Label>
          <Textarea
            value={form.question_tr ?? ''}
            onChange={(e) => setForm({ ...form, question_tr: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label hint="Her satıra bir madde">İyi cevap noktaları</Label>
          <Textarea
            value={form.good_answer_points_tr}
            onChange={(e) => setForm({ ...form, good_answer_points_tr: e.target.value })}
            rows={3}
            placeholder="Spesifik anekdot kullan&#10;Şirket değerlerine bağla"
          />
        </div>

        <div>
          <Label hint="Her satıra bir madde">Red flags (yapılmaması gerekenler)</Label>
          <Textarea
            value={form.red_flags_tr}
            onChange={(e) => setForm({ ...form, red_flags_tr: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label hint="Her satıra bir madde">İpuçları</Label>
          <Textarea
            value={form.tips_tr}
            onChange={(e) => setForm({ ...form, tips_tr: e.target.value })}
            rows={2}
          />
        </div>

        <div>
          <Label>STAR örneği</Label>
          <Textarea
            value={form.star_template_tr}
            onChange={(e) => setForm({ ...form, star_template_tr: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label hint="6-katmanlı format için zengin metin">Detaylı açıklama (TR)</Label>
          <Textarea
            value={form.detailed_explanation_tr}
            onChange={(e) => setForm({ ...form, detailed_explanation_tr: e.target.value })}
            rows={6}
            placeholder="**HR psikoloji perspektifi**: ..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateInterviewButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni soru
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <InterviewForm mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditInterviewButton({ q }: { q: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <InterviewForm mode="edit" initial={q} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
