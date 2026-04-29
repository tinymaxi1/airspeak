'use client';

/**
 * Generic Table Form — JSON tabanlı CRUD diyalog.
 *
 * Tablo şemasına göre dinamik form oluşturur. Tüm "küçük" tablolar
 * (ICAO 4, Oral, Placement, Scenarios, Airlines) için kullanılır.
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
import { createRow, updateRow, type ContentTable } from '@/lib/content/actions';
import { uniqueSlug } from '@/lib/content/slug';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'json' | 'options' | 'list';
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { id: string; label: string }[];
  rows?: number;
  /** Sadece json/list için */
  defaultValue?: any;
}

export interface TableSchema {
  table: ContentTable;
  title: string;
  description?: string;
  /** slug üretmek için kullanılan field key */
  slugFromKey: string;
  /** slug prefix template — {role} gibi placeholder destekler */
  slugPrefix?: string;
  fields: FieldDef[];
  revalidate: string;
}

function buildSlugPrefix(template: string | undefined, form: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, k) => form[k] ?? '');
}

function GenericForm({
  schema,
  mode,
  initial,
  onClose,
}: {
  schema: TableSchema;
  mode: 'create' | 'edit';
  initial?: any;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    for (const f of schema.fields) {
      init[f.key] = initial?.[f.key] ?? f.defaultValue ?? '';
    }
    return init;
  });

  function setField(key: string, value: any) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Required check
    for (const f of schema.fields) {
      if (f.required && !form[f.key]) {
        toast.error(`${f.label} zorunlu`);
        return;
      }
    }
    // Payload normalize
    const payload: Record<string, any> = {};
    for (const f of schema.fields) {
      let v = form[f.key];
      if (f.type === 'list') {
        v = typeof v === 'string'
          ? v.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : v;
      } else if (f.type === 'json') {
        try {
          v = typeof v === 'string' && v ? JSON.parse(v) : v;
        } catch {
          toast.error(`${f.label} geçerli JSON değil`);
          return;
        }
      } else if (f.type === 'number') {
        v = Number(v);
      }
      payload[f.key] = v === '' ? null : v;
    }

    startTransition(async () => {
      if (mode === 'create') {
        const slugBase = form[schema.slugFromKey] ?? 'item';
        const slugPrefix = buildSlugPrefix(schema.slugPrefix, form);
        const r = await createRow(
          schema.table,
          { ...payload, slug: uniqueSlug(slugBase, slugPrefix), status: 'draft' },
          schema.revalidate,
        );
        if (r.ok) {
          toast.success('Eklendi (taslak)');
          onClose();
          router.refresh();
        } else toast.error(r.error);
      } else if (initial?.id) {
        const r = await updateRow(schema.table, initial.id, payload, schema.revalidate);
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
        <DialogTitle>
          {mode === 'create' ? `Yeni: ${schema.title}` : `Düzenle: ${schema.title}`}
        </DialogTitle>
        {schema.description && <DialogDescription>{schema.description}</DialogDescription>}
      </DialogHeader>

      <div className="space-y-4">
        {schema.fields.map((f) => {
          if (f.type === 'select') {
            return (
              <div key={f.key}>
                <Label required={f.required} hint={f.hint}>
                  {f.label}
                </Label>
                <Select value={form[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)}>
                  {(f.options ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            );
          }
          if (f.type === 'textarea') {
            return (
              <div key={f.key}>
                <Label required={f.required} hint={f.hint}>
                  {f.label}
                </Label>
                <Textarea
                  value={form[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={f.rows ?? 3}
                  placeholder={f.placeholder}
                />
              </div>
            );
          }
          if (f.type === 'list') {
            const valueAsText =
              Array.isArray(form[f.key])
                ? (form[f.key] as string[]).join('\n')
                : form[f.key] ?? '';
            return (
              <div key={f.key}>
                <Label required={f.required} hint={f.hint ?? 'Her satıra bir madde'}>
                  {f.label}
                </Label>
                <Textarea
                  value={valueAsText}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={f.rows ?? 3}
                  placeholder={f.placeholder}
                />
              </div>
            );
          }
          if (f.type === 'json') {
            const valueAsText =
              typeof form[f.key] === 'string'
                ? form[f.key]
                : JSON.stringify(form[f.key] ?? '', null, 2);
            return (
              <div key={f.key}>
                <Label required={f.required} hint={f.hint ?? 'JSON format'}>
                  {f.label}
                </Label>
                <Textarea
                  value={valueAsText}
                  onChange={(e) => setField(f.key, e.target.value)}
                  rows={f.rows ?? 4}
                  placeholder={f.placeholder ?? '[{"id":"a","text":"..."}]'}
                  className="font-mono text-xs"
                />
              </div>
            );
          }
          // text + number
          return (
            <div key={f.key}>
              <Label required={f.required} hint={f.hint}>
                {f.label}
              </Label>
              <Input
                type={f.type === 'number' ? 'number' : 'text'}
                value={form[f.key] ?? ''}
                onChange={(e) => setField(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          );
        })}
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

export function CreateGenericButton({ schema, label }: { schema: TableSchema; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Plus className="w-4 h-4" /> {label ?? 'Yeni'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <GenericForm schema={schema} mode="create" onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function EditGenericButton({
  schema,
  row,
}: {
  schema: TableSchema;
  row: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        Düzenle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <GenericForm
            schema={schema}
            mode="edit"
            initial={row}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
