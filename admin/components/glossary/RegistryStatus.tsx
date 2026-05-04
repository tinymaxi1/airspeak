/**
 * RegistryStatus — /admin/glossary üst bilgi kartı.
 *
 * ~/airspeak/glossary/term_registry.json (filesystem) ile
 * aviation_glossary DB count'ını karşılaştırır.
 *
 * Local dev'de çalışır. Production'da home dir yoksa "registry yok" durumu.
 * Server Component — async fs + service role count.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { ShieldCheck, ShieldAlert, ShieldX, FileWarning } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/server';

export async function RegistryStatus() {
  const registryPath = resolve(homedir(), 'airspeak/glossary/term_registry.json');

  let registryCount = 0;
  let registryMtime: Date | null = null;
  let registryExists = existsSync(registryPath);
  let registryError: string | null = null;
  let sourceCount = 0;

  if (registryExists) {
    try {
      const raw = readFileSync(registryPath, 'utf-8');
      const data = JSON.parse(raw);
      registryCount = data.total_terms ?? (data.terms?.length ?? 0);
      sourceCount = data.source_count ?? 0;
      registryMtime = statSync(registryPath).mtime;
    } catch (e: any) {
      registryError = e.message ?? 'parse error';
      registryExists = false;
    }
  }

  // DB count
  const supabase = createServiceClient();
  let dbCount = 0;
  try {
    const { count } = await (supabase as any)
      .from('aviation_glossary')
      .select('id', { count: 'exact', head: true });
    dbCount = count ?? 0;
  } catch {
    /* ignore */
  }

  const drift = dbCount - registryCount;
  const inSync = registryExists && drift === 0;
  const ageMin = registryMtime
    ? Math.floor((Date.now() - registryMtime.getTime()) / 60000)
    : null;

  // Status decision
  let icon: React.ReactNode;
  let bg: string;
  let border: string;
  let iconColor: string;
  let label: string;
  let detail: string;

  if (!registryExists) {
    icon = <ShieldX className="w-5 h-5" />;
    bg = 'bg-red-50';
    border = 'border-red-300';
    iconColor = 'text-red-700';
    label = 'Registry yok';
    detail = registryError
      ? `~/airspeak/glossary/term_registry.json okunamadı: ${registryError}`
      : '~/airspeak/glossary/term_registry.json bulunamadı. Local dev gerek: glossary-build çalıştır.';
  } else if (inSync) {
    icon = <ShieldCheck className="w-5 h-5" />;
    bg = 'bg-emerald-50';
    border = 'border-emerald-300';
    iconColor = 'text-emerald-700';
    label = 'Sync — duplicate detection aktif';
    detail = `Registry ${registryCount} terim · DB ${dbCount} terim · ${sourceCount} batch · ${ageMin === null ? '' : ageMin === 0 ? 'şimdi' : `${ageMin} dk önce`} güncellendi`;
  } else {
    icon = <ShieldAlert className="w-5 h-5" />;
    bg = 'bg-amber-50';
    border = 'border-amber-300';
    iconColor = 'text-amber-700';
    label = 'Drift — registry güncel değil';
    detail = `Registry ${registryCount} · DB ${dbCount} (fark ${drift > 0 ? '+' : ''}${drift}) · Terminal'de glossary-build çalıştır`;
  }

  return (
    <section
      className={`flex items-start gap-3 ${bg} ${border} border rounded-xl px-4 py-3`}
      aria-label="Registry status"
    >
      <div className={`mt-0.5 ${iconColor}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${iconColor}`}>🛡 {label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
      </div>
      <div className="text-right text-xs text-muted-foreground shrink-0 hidden sm:block">
        <div className="font-mono">
          ~/airspeak/glossary/
          <br />
          term_registry.json
        </div>
      </div>
    </section>
  );
}
