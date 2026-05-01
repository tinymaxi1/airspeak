'use client';

/**
 * AI Senaryo — lobby kartı CRUD form.
 *
 * Branching turns/gauges DB'de tutulmuyor (Sprint 5 AI conversation'a ertelendi).
 * Bu form sadece lobby seviyesi: rol/kategori/başlık/setup/goal/intro audio.
 */
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
import { AudioField } from '@/components/forms/AudioField';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus, Crown } from 'lucide-react';

const ROLES = [
  { id: 'all', label: 'Tümü', emoji: '👥' },
  { id: 'pilot', label: 'Pilot', emoji: '👨‍✈️' },
  { id: 'cabin', label: 'Kabin', emoji: '✈️' },
  { id: 'technician', label: 'Teknisyen', emoji: '🔧' },
  { id: 'ground', label: 'Yer', emoji: '🛬' },
  { id: 'student', label: 'Öğrenci', emoji: '🎓' },
] as const;

const CATEGORIES = [
  { id: 'atc', label: 'ATC iletişim' },
  { id: 'cabin_emergency', label: 'Kabin acil durum' },
  { id: 'maintenance_call', label: 'Bakım çağrısı' },
  { id: 'gate_announcement', label: 'Kapı duyurusu' },
  { id: 'pre_flight', label: 'Uçuş öncesi' },
  { id: 'post_flight', label: 'Uçuş sonrası' },
  { id: 'irrops', label: 'IRROPS' },
  { id: 'medical', label: 'Tıbbi' },
  { id: 'security', label: 'Güvenlik' },
] as const;

type Role = (typeof ROLES)[number]['id'];
type Category = (typeof CATEGORIES)[number]['id'];

interface ScenarioFormInitial {
  id?: string;
  role?: string | null;
  category?: string | null;
  title?: string | null;
  title_tr?: string | null;
  setup?: string | null;
  setup_tr?: string | null;
  initial_message?: string | null;
  goal?: string | null;
  goal_tr?: string | null;
  difficulty?: number | null;
  estimated_minutes?: number | null;
  is_premium?: boolean | null;
  audio_intro_url?: string | null;
}

function ScenarioFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: ScenarioFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    role: (initial?.role as Role) ?? 'all',
    category: (initial?.category as Category) ?? 'atc',
    title: initial?.title ?? '',
    title_tr: initial?.title_tr ?? '',
    setup: initial?.setup ?? '',
    setup_tr: initial?.setup_tr ?? '',
    initial_message: initial?.initial_message ?? '',
    goal: initial?.goal ?? '',
    goal_tr: initial?.goal_tr ?? '',
    difficulty: initial?.difficulty ?? 3,
    estimated_minutes: initial?.estimated_minutes ?? 5,
    is_premium: initial?.is_premium ?? false,
    audio_intro_url: initial?.audio_intro_url ?? '',
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Başlık (EN) zorunlu');
      return;
    }

    const payload = {
      role: form.role,
      category: form.category,
      title: form.title.trim(),
      title_tr: form.title_tr.trim() || null,
      setup: form.setup.trim() || null,
      setup_tr: form.setup_tr.trim() || null,
      initial_message: form.initial_message.trim() || null,
      goal: form.goal.trim() || null,
      goal_tr: form.goal_tr.trim() || null,
      difficulty: Number(form.difficulty) || 3,
      estimated_minutes: Number(form.estimated_minutes) || 5,
      is_premium: form.is_premium,
      audio_intro_url: form.audio_intro_url.trim() || null,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'scenarios',
          {
            ...payload,
            slug: uniqueSlug(form.title, `scenario_${form.role}_${form.category}`),
            status: 'draft',
          },
          '/scenarios',
        );
        if (r.ok) {
          toast.success('Eklendi (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('scenarios', initial.id, payload, '/scenarios');
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
        <DialogTitle>{mode === 'create' ? 'Yeni AI Senaryo' : 'Senaryoyu Düzenle'}</DialogTitle>
        <DialogDescription>
          Lobby kartı bilgileri. Branching dialog (turns) Sprint 5'te AI ile entegre olacak —
          şu an sadece lobby seviyesi düzenleniyor.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Role chips */}
        <div>
          <Label required>Rol</Label>
          <div className="grid grid-cols-6 gap-2">
            {ROLES.map((r) => {
              const active = form.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setField('role', r.id)}
                  className={`px-2 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-airspeak-navy border-airspeak-navy text-white'
                      : 'bg-white border-border text-foreground hover:border-airspeak-navy/50'
                  }`}
                >
                  <div>{r.emoji}</div>
                  <div className="mt-0.5">{r.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category + Difficulty + Estimated min */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Kategori</Label>
            <Select
              value={form.category}
              onChange={(e) => setField('category', e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="1=kolay, 5=zor">Zorluk (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(e) => setField('difficulty', Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Tahmini süre (dk)</Label>
            <Input
              type="number"
              min={1}
              value={form.estimated_minutes}
              onChange={(e) => setField('estimated_minutes', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Title EN/TR */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Başlık (EN)</Label>
            <Input
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Holding pattern at VECON"
            />
          </div>
          <div>
            <Label>Başlık (TR)</Label>
            <Input
              value={form.title_tr}
              onChange={(e) => setField('title_tr', e.target.value)}
            />
          </div>
        </div>

        {/* Setup EN/TR */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label hint="Senaryonun durumu — pilot/co-pilot bağlamı">Kurulum (EN)</Label>
            <Textarea
              value={form.setup}
              onChange={(e) => setField('setup', e.target.value)}
              rows={3}
              placeholder="Turkish 1453 in holding pattern at VECON, FL240."
            />
          </div>
          <div>
            <Label>Kurulum (TR)</Label>
            <Textarea
              value={form.setup_tr}
              onChange={(e) => setField('setup_tr', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Initial message */}
        <div>
          <Label hint="AI co-pilot'un senaryoyu açan ilk cümlesi">İlk mesaj (EN)</Label>
          <Textarea
            value={form.initial_message}
            onChange={(e) => setField('initial_message', e.target.value)}
            rows={2}
            placeholder='"Turkish 1453, hold at VECON as published…"'
          />
        </div>

        {/* Goal EN/TR */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label hint="Kullanıcının başarması beklenen şey">Hedef (EN)</Label>
            <Textarea
              value={form.goal}
              onChange={(e) => setField('goal', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label>Hedef (TR)</Label>
            <Textarea
              value={form.goal_tr}
              onChange={(e) => setField('goal_tr', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Premium toggle */}
        <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-airspeak-gold" />
            <div>
              <p className="text-sm font-semibold">Premium senaryo</p>
              <p className="text-xs text-muted-foreground">
                Free kullanıcılar paywall görür
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setField('is_premium', !form.is_premium)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              form.is_premium ? 'bg-airspeak-gold' : 'bg-secondary border border-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                form.is_premium ? 'translate-x-5' : 'translate-x-0.5'
              } mt-0.5`}
            />
          </button>
        </div>

        {/* Intro audio (opsiyonel) */}
        <div>
          <Label hint="Opsiyonel — senaryo açılışında çalan ATC sesi">Intro ses (opsiyonel)</Label>
          <AudioField
            bucket="lesson-audio"
            pathPrefix={`scenarios/${form.role}`}
            value={form.audio_intro_url || null}
            onChange={(url) => setField('audio_intro_url', url ?? '')}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur (taslak)' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateScenarioButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni senaryo'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ScenarioFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditScenarioButton({ row }: { row: ScenarioFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ScenarioFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
