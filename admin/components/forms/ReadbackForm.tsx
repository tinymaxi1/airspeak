'use client';

/**
 * Read-back Clearance CRUD form (Sprint C2).
 *
 * Fields: level, target_role, sub_roles, category, station, freq,
 *   atc_utterance, expected_readback, key_phrases (JSON), icao_ref, hint
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
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { SubRolePicker } from '@/components/sub-roles/SubRolePicker';

const ROLES = ['all', 'pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'] as const;
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const CATEGORIES = ['taxi', 'departure', 'cruise', 'approach', 'landing', 'emergency', 'frequency'] as const;
const ALL_PARENT_ROLES = ['pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'];

export interface ReadbackFormInitial {
  id?: string;
  level?: string | null;
  target_role?: string | null;
  target_sub_roles?: string[] | null;
  category?: string | null;
  station?: string | null;
  freq?: string | null;
  atc_utterance?: string | null;
  expected_readback?: string | null;
  key_phrases?: any;
  icao_ref?: string | null;
  hint_tr?: string | null;
  hint_en?: string | null;
}

function ReadbackFormBody({
  mode,
  initial,
  onClose,
}: {
  mode: 'create' | 'edit';
  initial?: ReadbackFormInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    level: (initial?.level as any) ?? 'B1',
    target_role: (initial?.target_role as any) ?? 'pilot',
    target_sub_roles: initial?.target_sub_roles ?? [],
    category: (initial?.category as any) ?? 'taxi',
    station: initial?.station ?? '',
    freq: initial?.freq ?? '',
    atc_utterance: initial?.atc_utterance ?? '',
    expected_readback: initial?.expected_readback ?? '',
    key_phrases_json: JSON.stringify(initial?.key_phrases ?? [[]], null, 2),
    icao_ref: initial?.icao_ref ?? '',
    hint_tr: initial?.hint_tr ?? '',
    hint_en: initial?.hint_en ?? '',
  });

  const subRoleParentRoles =
    form.target_role === 'all' ? ALL_PARENT_ROLES : [form.target_role];

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.atc_utterance.trim() || !form.expected_readback.trim()) {
      toast.error('ATC utterance + Expected read-back zorunlu');
      return;
    }
    let keyPhrases;
    try {
      keyPhrases = JSON.parse(form.key_phrases_json);
      if (!Array.isArray(keyPhrases)) throw new Error('array değil');
    } catch (err) {
      toast.error('Key phrases JSON geçersiz (string[][] olmalı)');
      return;
    }

    const payload = {
      level: form.level,
      target_role: form.target_role,
      target_sub_roles: form.target_sub_roles,
      category: form.category,
      station: form.station.trim() || null,
      freq: form.freq.trim() || null,
      atc_utterance: form.atc_utterance.trim(),
      expected_readback: form.expected_readback.trim(),
      key_phrases: keyPhrases,
      icao_ref: form.icao_ref.trim() || null,
      hint_tr: form.hint_tr.trim() || null,
      hint_en: form.hint_en.trim() || null,
    };

    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'readback_clearances',
          {
            ...payload,
            slug: uniqueSlug(form.atc_utterance, `rb_${form.target_role}_${form.category}`),
            status: 'draft',
          },
          '/readback-clearances',
        );
        if (r.ok) {
          toast.success('Oluşturuldu (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('readback_clearances', initial.id, payload, '/readback-clearances');
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
        <DialogTitle>{mode === 'create' ? 'Yeni Read-back' : 'Read-back Düzenle'}</DialogTitle>
        <DialogDescription>
          ATC clearance + beklenen read-back + key phrases (string match için).
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Rol</Label>
            <Select
              value={form.target_role}
              onChange={(e) => setForm({ ...form, target_role: e.target.value as any, target_sub_roles: [] })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label required>Seviye</Label>
            <Select value={form.level} onChange={(e) => set('level', e.target.value as any)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div>
            <Label required>Kategori</Label>
            <Select value={form.category} onChange={(e) => set('category', e.target.value as any)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <Label hint="Boş = parent role'ün tüm sub'larına açık">Hedef alt-roller (opsiyonel)</Label>
          <SubRolePicker
            parentRoles={subRoleParentRoles}
            value={form.target_sub_roles}
            onChange={(next) => set('target_sub_roles', next)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>İstasyon</Label>
            <Input value={form.station} onChange={(e) => set('station', e.target.value)} placeholder="IST GROUND" />
          </div>
          <div>
            <Label>Frekans</Label>
            <Input value={form.freq} onChange={(e) => set('freq', e.target.value)} placeholder="129.6" />
          </div>
        </div>

        <div>
          <Label required>ATC Utterance (TTS okur)</Label>
          <Textarea
            value={form.atc_utterance}
            onChange={(e) => set('atc_utterance', e.target.value)}
            placeholder="Turkish 1453, taxi to runway 35 left via Echo Six."
            rows={2}
            required
          />
        </div>

        <div>
          <Label required>Expected Read-back</Label>
          <Textarea
            value={form.expected_readback}
            onChange={(e) => set('expected_readback', e.target.value)}
            placeholder="Taxi to runway 35 left via Echo Six, Turkish 1453."
            rows={2}
            required
          />
        </div>

        <div>
          <Label hint="string[][] — her grup en az 1 varyantla eşleşmeli">Key Phrases (JSON)</Label>
          <Textarea
            value={form.key_phrases_json}
            onChange={(e) => set('key_phrases_json', e.target.value)}
            placeholder='[["taxi"], ["35l", "three five left"]]'
            rows={4}
            className="font-mono text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>ICAO Ref</Label>
            <Input value={form.icao_ref} onChange={(e) => set('icao_ref', e.target.value)} placeholder="Doc 9432" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>İpucu (TR)</Label>
            <Textarea value={form.hint_tr} onChange={(e) => set('hint_tr', e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Hint (EN)</Label>
            <Textarea value={form.hint_en} onChange={(e) => set('hint_en', e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} disabled={isPending}>Vazgeç</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Kaydediliyor…' : mode === 'create' ? 'Oluştur (taslak)' : 'Güncelle'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateReadbackButton({ label }: { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni Read-back'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ReadbackFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditReadbackButton({ row }: { row: ReadbackFormInitial }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Düzenle</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <ReadbackFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
