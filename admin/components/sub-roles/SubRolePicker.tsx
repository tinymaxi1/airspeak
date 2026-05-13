'use client';

/**
 * SubRolePicker — Multi-select picker for target_sub_roles array.
 *
 * Shared component, içerik admin sayfalarında kullanılır (word-of-day,
 * scenarios, vocab vb.). target_roles ile sub_roles tablosu birlikte sorgulanır:
 * sadece seçili parent role'ların altındaki active sub_role'ler gösterilir.
 *
 * Boş array = "tüm alt-rollere açık" (fallback DB filter target_roles üzerinden).
 *
 * Props:
 *  - parentRoles: 'pilot' | 'atc' | ... [] — hangi parent role'ların sub'ları gösterilsin
 *  - value: string[] — seçili sub_role.id'leri
 *  - onChange: (newValue: string[]) => void
 *  - disabled?: boolean
 */
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface SubRoleOption {
  id: string;
  parent_role: string;
  display_order: number;
  active: boolean;
  icon: string | null;
  names: Record<string, string>;
}

interface Props {
  parentRoles: string[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

const PARENT_LABELS: Record<string, { label: string; emoji: string }> = {
  pilot: { label: 'Pilot', emoji: '✈️' },
  atc: { label: 'ATC', emoji: '🗼' },
  cabin: { label: 'Kabin', emoji: '🎧' },
  technician: { label: 'Teknisyen', emoji: '⚙️' },
  ground: { label: 'Yer', emoji: '💼' },
  student: { label: 'Öğrenci', emoji: '📖' },
  dispatcher: { label: 'Dispatcher', emoji: '📊' },
};

export function SubRolePicker({ parentRoles, value, onChange, disabled }: Props) {
  const [options, setOptions] = useState<SubRoleOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { data } = await (supabase as any)
        .from('sub_roles')
        .select('id, parent_role, display_order, active, icon, names')
        .eq('active', true)
        .order('parent_role', { ascending: true })
        .order('display_order', { ascending: true });
      if (!cancelled) {
        setOptions((data ?? []) as SubRoleOption[]);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter to selected parent_roles (or all if parentRoles is empty)
  const filtered =
    parentRoles.length === 0
      ? options
      : options.filter((o) => parentRoles.includes(o.parent_role));

  // Group by parent_role for visual segmentation
  const grouped: Record<string, SubRoleOption[]> = {};
  for (const opt of filtered) {
    (grouped[opt.parent_role] ??= []).push(opt);
  }

  function toggle(id: string) {
    if (disabled) return;
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
  }

  function selectAll() {
    if (disabled) return;
    onChange(filtered.map((o) => o.id));
  }

  if (loading) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Alt-roller yükleniyor...
      </div>
    );
  }

  if (parentRoles.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Önce hedef rol(ler) seç — alt-rol seçenekleri açılacak.
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Seçili rol(ler) için tanımlı alt-rol yok.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {value.length === 0
            ? 'Boş = parent role içeren tüm alt-rollere açık'
            : `${value.length} alt-rol seçili`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-blue-600 hover:underline disabled:opacity-50"
          >
            Tümünü seç
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled || value.length === 0}
            className="text-muted-foreground hover:underline disabled:opacity-50"
          >
            Temizle
          </button>
        </div>
      </div>

      {Object.entries(grouped).map(([parent, opts]) => {
        const label = PARENT_LABELS[parent] ?? { label: parent, emoji: '•' };
        return (
          <div key={parent} className="border rounded-lg p-3 bg-secondary/30">
            <div className="text-xs font-semibold mb-2 text-airspeak-navy">
              {label.emoji} {label.label}
              <span className="text-muted-foreground font-normal ml-1">({opts.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {opts.map((opt) => {
                const selected = value.includes(opt.id);
                const name = opt.names?.tr ?? opt.names?.en ?? opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    disabled={disabled}
                    className={`px-2.5 py-1 rounded-md text-xs border-2 transition disabled:opacity-50 ${
                      selected
                        ? 'bg-airspeak-navy text-white border-airspeak-navy'
                        : 'bg-white text-airspeak-navy border-border hover:border-airspeak-navy/50'
                    }`}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
