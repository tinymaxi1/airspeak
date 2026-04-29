'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { updateConfig } from '@/lib/content/config-actions';
import { toast } from 'sonner';
import { Save, Check } from 'lucide-react';

interface ConfigRow {
  key: string;
  value: any;
  description: string | null;
  category: string;
  data_type: 'boolean' | 'number' | 'string' | 'json' | 'array';
  updated_at: string;
}

export function ConfigField({ row }: { row: ConfigRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<any>(row.value);
  const [saved, setSaved] = useState(false);

  function save(newValue: any) {
    startTransition(async () => {
      const r = await updateConfig(row.key, newValue);
      if (r.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      } else {
        toast.error(r.error);
      }
    });
  }

  function handleSubmit() {
    save(value);
  }

  // ─── BOOLEAN: Toggle ───
  if (row.data_type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
        <div className="flex-1">
          <p className="font-mono text-xs text-muted-foreground">{row.key}</p>
          <p className="text-sm font-medium mt-0.5">{row.description ?? row.key}</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            const next = !value;
            setValue(next);
            save(next);
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            value ? 'bg-airspeak-green' : 'bg-secondary'
          } ${isPending ? 'opacity-50' : ''}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              value ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  // ─── NUMBER ───
  if (row.data_type === 'number') {
    return (
      <div className="py-3 border-b border-border last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-mono text-xs text-muted-foreground">{row.key}</p>
            <p className="text-sm font-medium mt-0.5">{row.description ?? row.key}</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-28"
            />
            <Button
              size="sm"
              variant={saved ? 'green' : 'outline'}
              disabled={isPending || value === row.value}
              onClick={handleSubmit}
            >
              {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STRING (kısa) ───
  if (row.data_type === 'string') {
    const isLong = typeof value === 'string' && value.length > 60;
    return (
      <div className="py-3 border-b border-border last:border-b-0">
        <p className="font-mono text-xs text-muted-foreground">{row.key}</p>
        <p className="text-sm font-medium mt-0.5 mb-2">{row.description ?? row.key}</p>
        <div className="flex items-end gap-2">
          {isLong ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={2}
              className="flex-1"
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1"
            />
          )}
          <Button
            size="sm"
            variant={saved ? 'green' : 'outline'}
            disabled={isPending || value === row.value}
            onClick={handleSubmit}
          >
            {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    );
  }

  // ─── ARRAY (string[]) ───
  if (row.data_type === 'array') {
    const text = Array.isArray(value) ? value.join('\n') : String(value);
    return (
      <div className="py-3 border-b border-border last:border-b-0">
        <p className="font-mono text-xs text-muted-foreground">{row.key}</p>
        <p className="text-sm font-medium mt-0.5 mb-2">{row.description ?? row.key}</p>
        <p className="text-xs text-muted-foreground mb-1">Her satıra bir madde</p>
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setValue(e.target.value.split('\n').filter(Boolean))}
            rows={4}
            className="flex-1"
          />
          <Button
            size="sm"
            variant={saved ? 'green' : 'outline'}
            disabled={isPending || JSON.stringify(value) === JSON.stringify(row.value)}
            onClick={handleSubmit}
          >
            {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    );
  }

  // ─── JSON (raw) ───
  return (
    <div className="py-3 border-b border-border last:border-b-0">
      <p className="font-mono text-xs text-muted-foreground">{row.key}</p>
      <p className="text-sm font-medium mt-0.5 mb-2">{row.description ?? row.key}</p>
      <div className="flex items-end gap-2">
        <Textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              setValue(JSON.parse(e.target.value));
            } catch {
              setValue(e.target.value);
            }
          }}
          rows={6}
          className="flex-1 font-mono text-xs"
        />
        <Button size="sm" variant="outline" disabled={isPending} onClick={handleSubmit}>
          <Save className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
