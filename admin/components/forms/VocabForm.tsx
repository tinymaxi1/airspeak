'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Label, Select } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { AudioField } from '@/components/forms/AudioField';
import { createRow, updateRow } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { SubRolePicker } from '@/components/sub-roles/SubRolePicker';

const ROLES = [
  { id: 'all', label: 'Tüm roller' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'cabin', label: 'Kabin' },
  { id: 'technician', label: 'Teknisyen' },
  { id: 'ground', label: 'Yer hizmetleri' },
  { id: 'student', label: 'Öğrenci' },
];

const ALL_PARENT_ROLES_VOCAB = ['pilot','atc','cabin','technician','ground','student','dispatcher'];

interface VocabFormProps {
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}

function VocabForm({ mode, initial, onClose }: VocabFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    role: initial?.role ?? 'pilot',
    target_sub_roles: (initial?.target_sub_roles as string[] | undefined) ?? [],
    category: initial?.category ?? 'general',
    term: initial?.term ?? '',
    term_tr: initial?.term_tr ?? '',
    ipa: initial?.ipa ?? '',
    pos: initial?.pos ?? '',
    definition: initial?.definition ?? '',
    definition_tr: initial?.definition_tr ?? '',
    example: initial?.example ?? '',
    example_tr: initial?.example_tr ?? '',
    difficulty: initial?.difficulty ?? 2,
    is_premium: initial?.is_premium ?? false,
    audio_url: initial?.audio_url ?? '',
  });

  // SubRolePicker için parent listesini role'den derive et
  const subRoleParentRoles =
    form.role === 'all' ? ALL_PARENT_ROLES_VOCAB : [form.role];

  function setRoleAndResetSubRoles(newRole: string) {
    setForm({ ...form, role: newRole, target_sub_roles: [] });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.term || !form.term_tr) {
      toast.error('EN ve TR terim zorunlu');
      return;
    }
    startTransition(async () => {
      if (mode === 'create') {
        const r = await createRow(
          'vocab_terms',
          {
            slug: uniqueSlug(form.term, `vocab_${form.role}`),
            ...form,
            status: 'draft',
          },
          ['/vocab'],
        );
        if (r.ok) {
          toast.success('Terim eklendi (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow('vocab_terms', initial.id, form, ['/vocab']);
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
        <DialogTitle>{mode === 'create' ? 'Yeni Terim' : 'Terimi Düzenle'}</DialogTitle>
        <DialogDescription>Vocab havuzu — derslerde egzersizlerle birlikte kullanılır.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label required>Rol</Label>
            <Select value={form.role} onChange={(e) => setRoleAndResetSubRoles(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Kategori</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="cockpit"
            />
          </div>
          <div>
            <Label>Zorluk (1-5)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* FAZ 4 — Target sub-roles (opsiyonel granular filter) */}
        <div>
          <Label hint="Boş = parent role içeren tüm alt-rollere açık">
            Hedef alt-roller (opsiyonel)
          </Label>
          <SubRolePicker
            parentRoles={subRoleParentRoles}
            value={form.target_sub_roles}
            onChange={(next) => setForm({ ...form, target_sub_roles: next })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Terim (EN)</Label>
            <Input
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })}
              placeholder="squawk"
              required
            />
          </div>
          <div>
            <Label required>Terim (TR)</Label>
            <Input
              value={form.term_tr}
              onChange={(e) => setForm({ ...form, term_tr: e.target.value })}
              placeholder="transponder kodu girmek"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>IPA</Label>
            <Input
              value={form.ipa}
              onChange={(e) => setForm({ ...form, ipa: e.target.value })}
              placeholder="/skwɒk/"
            />
          </div>
          <div>
            <Label>Sözcük türü</Label>
            <Input
              value={form.pos}
              onChange={(e) => setForm({ ...form, pos: e.target.value })}
              placeholder="verb"
            />
          </div>
        </div>

        <div>
          <Label hint="Telaffuz sesi — IPA ile birlikte mobilde oynatılır">
            Telaffuz sesi
          </Label>
          <AudioField
            bucket="vocab-audio"
            pathPrefix={`vocab/${form.role}`}
            value={form.audio_url || null}
            onChange={(url) => setForm({ ...form, audio_url: url ?? '' })}
          />
        </div>

        <div>
          <Label>Tanım (EN)</Label>
          <Textarea
            value={form.definition}
            onChange={(e) => setForm({ ...form, definition: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label>Tanım (TR)</Label>
          <Textarea
            value={form.definition_tr}
            onChange={(e) => setForm({ ...form, definition_tr: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Örnek (EN)</Label>
            <Textarea
              value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })}
              rows={2}
              placeholder='Turkish 1, squawk 7421.'
            />
          </div>
          <div>
            <Label>Örnek (TR)</Label>
            <Textarea
              value={form.example_tr}
              onChange={(e) => setForm({ ...form, example_tr: e.target.value })}
              rows={2}
            />
          </div>
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

export function CreateVocabButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni terim
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <VocabForm mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditVocabButton({ term }: { term: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <VocabForm mode="edit" initial={term} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
