'use client';

/**
 * CompetitionForm — yarışma create/edit.
 *
 * Tema · Tip · Tarih · Hedef filtreler · Premium · Banner · Ödül havuzu.
 * Ödül havuzu inline editor: rank/rank_from/rank_to + type + amount/code/days.
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
import {
  createCompetition,
  updateCompetition,
  type CompetitionPayload,
  type PrizeRow,
  type CompetitionTheme,
  type CompetitionType,
} from '@/lib/competitions/actions';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const THEMES: { id: CompetitionTheme; label: string }[] = [
  { id: 'icao_focus', label: 'ICAO Odak' },
  { id: 'phraseology', label: 'Frazeoloji' },
  { id: 'vocabulary_blast', label: 'Kelime Patlaması' },
  { id: 'maintenance', label: 'Bakım' },
  { id: 'cabin_safety', label: 'Kabin Güvenlik' },
  { id: 'seasonal', label: 'Sezonluk' },
  { id: 'company_event', label: 'Şirket Etkinliği' },
  { id: 'other', label: 'Diğer' },
];

const TYPES: { id: CompetitionType; label: string; help: string }[] = [
  { id: 'xp_race', label: 'XP Yarışı', help: 'Süre içinde en çok XP kazanan' },
  { id: 'lesson_count', label: 'Ders Sayısı', help: 'En çok ders tamamlayan' },
  { id: 'perfect_score', label: 'Hatasız', help: 'En çok 100% skor' },
  { id: 'streak', label: 'Streak', help: 'Süre içinde streak' },
  { id: 'specific_content', label: 'Spesifik İçerik', help: 'Belirli ders ID listesi' },
];

const ROLE_OPTIONS = [
  { id: '', label: 'Filtre yok' },
  { id: 'all', label: 'Tüm roller' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'cabin', label: 'Kabin' },
  { id: 'technician', label: 'Teknisyen' },
  { id: 'ground', label: 'Yer hizmetleri' },
  { id: 'student', label: 'Öğrenci' },
] as const;

const LEVEL_OPTIONS = [
  { id: '', label: 'Filtre yok' },
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
] as const;

interface FormState {
  slug: string;
  name: string;
  name_tr: string;
  description: string;
  description_tr: string;
  theme: CompetitionTheme;
  type: CompetitionType;
  rules: string; // JSON string
  target_role: string;
  target_level_tier: string;
  start_date: string; // YYYY-MM-DDTHH:mm
  end_date: string;
  is_premium: boolean;
  entry_cost_coin: number;
  prize_pool: PrizeRow[];
  banner_url: string;
  icon_emoji: string;
}

function emptyForm(): FormState {
  const now = new Date();
  const startIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const endIso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  return {
    slug: '',
    name: '',
    name_tr: '',
    description: '',
    description_tr: '',
    theme: 'icao_focus',
    type: 'xp_race',
    rules: '{}',
    target_role: '',
    target_level_tier: '',
    start_date: startIso,
    end_date: endIso,
    is_premium: false,
    entry_cost_coin: 0,
    prize_pool: [
      { rank: 1, type: 'coin', amount: 1000 },
      { rank: 2, type: 'coin', amount: 500 },
      { rank: 3, type: 'coin', amount: 250 },
    ],
    banner_url: '',
    icon_emoji: '🏁',
  };
}

function rowToForm(row: any): FormState {
  return {
    slug: row.slug ?? '',
    name: row.name ?? '',
    name_tr: row.name_tr ?? '',
    description: row.description ?? '',
    description_tr: row.description_tr ?? '',
    theme: row.theme,
    type: row.type,
    rules: JSON.stringify(row.rules ?? {}, null, 2),
    target_role: row.target_role ?? '',
    target_level_tier: row.target_level_tier ?? '',
    start_date: new Date(row.start_date).toISOString().slice(0, 16),
    end_date: new Date(row.end_date).toISOString().slice(0, 16),
    is_premium: !!row.is_premium,
    entry_cost_coin: row.entry_cost_coin ?? 0,
    prize_pool: row.prize_pool ?? [],
    banner_url: row.banner_url ?? '',
    icon_emoji: row.icon_emoji ?? '🏁',
  };
}

function CompetitionFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    initial ? rowToForm(initial) : emptyForm(),
  );
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function addPrize() {
    setForm((s) => ({
      ...s,
      prize_pool: [...s.prize_pool, { rank_from: 4, rank_to: 10, type: 'coin', amount: 100 }],
    }));
  }

  function removePrize(idx: number) {
    setForm((s) => ({
      ...s,
      prize_pool: s.prize_pool.filter((_, i) => i !== idx),
    }));
  }

  function updatePrize(idx: number, patch: Partial<PrizeRow>) {
    setForm((s) => ({
      ...s,
      prize_pool: s.prize_pool.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.slug.trim() || !/^[a-z0-9_-]+$/.test(form.slug)) {
      toast.error('Slug zorunlu (a-z, 0-9, _, -)');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Ad zorunlu');
      return;
    }

    let rulesObj: Record<string, unknown> = {};
    try {
      rulesObj = JSON.parse(form.rules || '{}');
    } catch {
      toast.error('Rules JSON geçersiz');
      return;
    }

    const payload: CompetitionPayload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      name_tr: form.name_tr.trim() || null,
      description: form.description.trim() || null,
      description_tr: form.description_tr.trim() || null,
      theme: form.theme,
      type: form.type,
      rules: rulesObj,
      target_role: form.target_role || null,
      target_level_tier: form.target_level_tier || null,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_premium: form.is_premium,
      entry_cost_coin: Number(form.entry_cost_coin) || 0,
      prize_pool: form.prize_pool,
      banner_url: form.banner_url.trim() || null,
      icon_emoji: form.icon_emoji.trim() || '🏁',
    };

    startTransition(async () => {
      const r = mode === 'create'
        ? await createCompetition(payload)
        : await updateCompetition(initial.id, payload);
      if (r.ok) {
        toast.success(mode === 'create' ? 'Yarışma oluşturuldu (taslak)' : 'Güncellendi');
        onClose();
        router.refresh();
        if (mode === 'create' && (r as any).id) {
          router.push(`/competitions/${(r as any).id}`);
        }
      } else toast.error(r.error ?? 'Hata');
    });
  }

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle>
          {mode === 'create' ? 'Yeni Yarışma' : 'Yarışmayı Düzenle'}
        </DialogTitle>
        <DialogDescription>
          Tarihler UTC. Ödül havuzu rank veya rank_from/rank_to ile aralık.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required hint="snake-case unique">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="icao_week_apr"
              disabled={mode === 'edit'}
            />
          </div>
          <div>
            <Label required>Ad (EN)</Label>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="ICAO Week"
            />
          </div>
          <div>
            <Label>Ad (TR)</Label>
            <Input
              value={form.name_tr}
              onChange={(e) => setField('name_tr', e.target.value)}
              placeholder="ICAO Haftası"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Açıklama (EN)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label>Açıklama (TR)</Label>
            <Textarea
              value={form.description_tr}
              onChange={(e) => setField('description_tr', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Tema</Label>
            <Select
              value={form.theme}
              onChange={(e) => setField('theme', e.target.value as CompetitionTheme)}
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Tip</Label>
            <Select
              value={form.type}
              onChange={(e) => setField('type', e.target.value as CompetitionType)}
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {TYPES.find((t) => t.id === form.type)?.help}
            </p>
          </div>
          <div>
            <Label>Emoji</Label>
            <Input
              value={form.icon_emoji}
              onChange={(e) => setField('icon_emoji', e.target.value)}
              placeholder="🏁"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required hint="UTC">Başlangıç</Label>
            <Input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => setField('start_date', e.target.value)}
            />
          </div>
          <div>
            <Label required hint="UTC">Bitiş</Label>
            <Input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => setField('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label hint="Boş = filtre yok">Hedef rol</Label>
            <Select
              value={form.target_role}
              onChange={(e) => setField('target_role', e.target.value)}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="Boş = filtre yok">Hedef seviye</Label>
            <Select
              value={form.target_level_tier}
              onChange={(e) => setField('target_level_tier', e.target.value)}
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Katılım coin</Label>
            <Input
              type="number"
              min={0}
              value={form.entry_cost_coin}
              onChange={(e) => setField('entry_cost_coin', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label hint="Storage URL">Banner URL</Label>
          <Input
            value={form.banner_url}
            onChange={(e) => setField('banner_url', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center justify-between bg-secondary/30 rounded-lg p-3 border border-border">
          <div>
            <p className="text-sm font-semibold">Premium yarışma</p>
            <p className="text-xs text-muted-foreground">Free kullanıcılar paywall görür</p>
          </div>
          <button
            type="button"
            onClick={() => setField('is_premium', !form.is_premium)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              form.is_premium ? 'bg-airspeak-gold' : 'bg-secondary border border-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition mt-0.5 ${
                form.is_premium ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Prize pool */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="mb-0">Ödül havuzu</Label>
            <Button type="button" size="sm" variant="outline" onClick={addPrize}>
              <Plus className="w-3 h-3" /> Ödül ekle
            </Button>
          </div>
          <div className="space-y-2">
            {form.prize_pool.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Henüz ödül yok.</p>
            )}
            {form.prize_pool.map((p, idx) => (
              <PrizeRow
                key={idx}
                prize={p}
                onChange={(patch) => updatePrize(idx, patch)}
                onRemove={() => removePrize(idx)}
              />
            ))}
          </div>
        </div>

        {/* Rules JSON (advanced) */}
        <details>
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Gelişmiş — Rules JSON (specific_content için target_lesson_ids)
          </summary>
          <Textarea
            value={form.rules}
            onChange={(e) => setField('rules', e.target.value)}
            rows={4}
            className="font-mono text-xs mt-2"
            placeholder='{ "target_lesson_ids": ["uuid1", "uuid2"] }'
          />
        </details>
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

function PrizeRow({
  prize,
  onChange,
  onRemove,
}: {
  prize: PrizeRow;
  onChange: (patch: Partial<PrizeRow>) => void;
  onRemove: () => void;
}) {
  const isRange = prize.rank_from != null;
  return (
    <div className="border border-border rounded-lg p-3 bg-secondary/30">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-2">
          <Label className="text-[10px]">Rank</Label>
          <Input
            type="number"
            min={1}
            value={prize.rank ?? prize.rank_from ?? 1}
            onChange={(e) =>
              isRange
                ? onChange({ rank_from: Number(e.target.value), rank: undefined })
                : onChange({ rank: Number(e.target.value), rank_from: undefined, rank_to: undefined })
            }
            className="text-xs"
          />
        </div>
        {isRange && (
          <div className="col-span-2">
            <Label className="text-[10px]">Bitiş</Label>
            <Input
              type="number"
              min={prize.rank_from ?? 1}
              value={prize.rank_to ?? 10}
              onChange={(e) => onChange({ rank_to: Number(e.target.value) })}
              className="text-xs"
            />
          </div>
        )}
        <div className="col-span-1">
          <Label className="text-[10px]">Aralık</Label>
          <button
            type="button"
            onClick={() =>
              isRange
                ? onChange({ rank: prize.rank_from ?? 1, rank_from: undefined, rank_to: undefined })
                : onChange({
                    rank_from: prize.rank ?? 1,
                    rank_to: (prize.rank ?? 1) + 5,
                    rank: undefined,
                  })
            }
            className="w-full text-xs px-2 py-1.5 rounded border border-border bg-white"
          >
            {isRange ? '↔' : '#'}
          </button>
        </div>
        <div className="col-span-3">
          <Label className="text-[10px]">Tip</Label>
          <Select
            value={prize.type}
            onChange={(e) => onChange({ type: e.target.value as PrizeRow['type'] })}
          >
            <option value="coin">Coin</option>
            <option value="badge">Badge</option>
            <option value="premium_days">Premium (gün)</option>
            <option value="certificate">Sertifika</option>
            <option value="custom">Özel</option>
          </Select>
        </div>
        <div className="col-span-3">
          <Label className="text-[10px]">
            {prize.type === 'coin'
              ? 'Miktar'
              : prize.type === 'badge'
                ? 'Code'
                : prize.type === 'premium_days'
                  ? 'Gün'
                  : 'Değer'}
          </Label>
          {prize.type === 'badge' ? (
            <Input
              value={prize.code ?? ''}
              onChange={(e) => onChange({ code: e.target.value })}
              placeholder="weekly_champion"
              className="text-xs"
            />
          ) : prize.type === 'premium_days' ? (
            <Input
              type="number"
              min={1}
              value={prize.days ?? 30}
              onChange={(e) => onChange({ days: Number(e.target.value) })}
              className="text-xs"
            />
          ) : (
            <Input
              type="number"
              min={0}
              value={prize.amount ?? 0}
              onChange={(e) => onChange({ amount: Number(e.target.value) })}
              className="text-xs"
            />
          )}
        </div>
        <div className="col-span-1 flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-airspeak-red hover:bg-red-50 p-1 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CreateCompetitionButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni yarışma'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <CompetitionFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditCompetitionButton({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <CompetitionFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
