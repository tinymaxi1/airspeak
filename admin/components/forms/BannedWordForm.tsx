'use client';

/**
 * BannedWordForm — banned word create/edit Dialog.
 */
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Label, Select } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import {
  createBannedWord,
  updateBannedWord,
  type BannedWordSeverity,
  type BannedWordCategory,
} from '@/lib/moderation/actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const SEVERITIES: { id: BannedWordSeverity; label: string; help: string }[] = [
  { id: 'block', label: 'Block', help: 'Post/yorum hiç yayınlanmaz, kullanıcıya hata döner' },
  { id: 'warn', label: 'Warn', help: 'Sessizce hidden olur, mod queue\'sunda görünür' },
];

const CATEGORIES: { id: BannedWordCategory; label: string }[] = [
  { id: 'profanity', label: 'Profanity (küfür)' },
  { id: 'spam', label: 'Spam' },
  { id: 'hate', label: 'Hate speech' },
  { id: 'pii', label: 'Kişisel bilgi (PII)' },
  { id: 'other', label: 'Diğer' },
];

interface FormState {
  word: string;
  severity: BannedWordSeverity;
  category: BannedWordCategory;
}

function emptyForm(): FormState {
  return { word: '', severity: 'block', category: 'profanity' };
}

function rowToForm(row: any): FormState {
  return {
    word: row.word ?? '',
    severity: (row.severity as BannedWordSeverity) ?? 'block',
    category: (row.category as BannedWordCategory) ?? 'other',
  };
}

interface BodyProps {
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}

function BannedWordFormBody({ mode, initial, onClose }: BodyProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    mode === 'edit' && initial ? rowToForm(initial) : emptyForm(),
  );
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((s) => ({ ...s, [key]: val }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const word = form.word.trim().toLowerCase();
    if (word.length < 2 || word.length > 80) {
      toast.error('word: 2-80 karakter');
      return;
    }
    startTransition(async () => {
      const r =
        mode === 'create'
          ? await createBannedWord({ word, severity: form.severity, category: form.category })
          : await updateBannedWord(initial.id, { word, severity: form.severity, category: form.category });
      if (r.ok) {
        toast.success(mode === 'create' ? 'Eklendi' : 'Güncellendi');
        onClose();
        router.refresh();
      } else {
        toast.error(r.error ?? 'Hata');
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Yeni Yasaklı Kelime' : 'Yasaklı Kelime Düzenle'}</DialogTitle>
        <DialogDescription>
          Word-boundary regex ile match edilir, case-insensitive. Lowercase saklanır.
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label required>Word</Label>
        <Input
          value={form.word}
          onChange={(e) => setField('word', e.target.value)}
          placeholder="örn küfür"
          autoCapitalize="none"
          disabled={mode === 'edit'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Severity</Label>
          <Select
            value={form.severity}
            onChange={(e) => setField('severity', e.target.value as BannedWordSeverity)}
          >
            {SEVERITIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {SEVERITIES.find((s) => s.id === form.severity)?.help}
          </p>
        </div>
        <div>
          <Label required>Category</Label>
          <Select
            value={form.category}
            onChange={(e) => setField('category', e.target.value as BannedWordCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          İptal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Kaydediliyor…' : mode === 'create' ? 'Ekle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );
}

export function CreateBannedWordButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> Yeni kelime
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <BannedWordFormBody mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditBannedWordButton({ row }: { row: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <BannedWordFormBody mode="edit" initial={row} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
