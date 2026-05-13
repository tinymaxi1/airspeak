import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateModuleButton } from '@/components/forms/ModuleActions';
import { StatusActions } from '@/components/forms/StatusActions';

const VALID_ROLES = ['pilot', 'atc', 'cabin', 'technician', 'ground', 'student', 'dispatcher'] as const;
const ROLE_LABELS: Record<string, string> = {
  pilot: 'Pilot',
  atc: 'Hava Trafik Kontrol',
  cabin: 'Kabin Ekibi',
  technician: 'Teknisyen',
  ground: 'Yer Hizmetleri',
  student: 'Öğrenci',
  dispatcher: 'Uçuş Dispeçeri',
};

export default async function ModulesPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!VALID_ROLES.includes(role as any)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: modules } = await (supabase as any)
    .from('modules')
    .select('id, slug, number, title, title_tr, description, status, sort, units(id, lessons(id))')
    .eq('role', role)
    .order('sort', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/tree"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Tüm roller
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-airspeak-navy">{ROLE_LABELS[role]}</h1>
            <p className="text-muted-foreground mt-1">
              {(modules ?? []).length} modül · sürükle-bırak sıralama (yakında)
            </p>
          </div>
          <CreateModuleButton role={role} />
        </div>
      </div>

      <div className="space-y-3">
        {(modules ?? []).map((m: any) => (
          <div
            key={m.id}
            className="bg-white border border-border rounded-xl p-5 hover:border-airspeak-red hover:shadow-sm transition flex items-center gap-4"
          >
            <Link href={`/tree/${role}/${m.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-airspeak-navy text-white flex items-center justify-center text-sm font-bold tabular-nums">
                {String(m.number).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-airspeak-navy">{m.title_tr ?? m.title}</h3>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {(m.units?.length ?? 0)} ünite ·{' '}
                  {(m.units ?? []).reduce((acc: number, u: any) => acc + (u.lessons?.length ?? 0), 0)}{' '}
                  ders
                </p>
                {m.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.description}</p>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2 shrink-0">
              <StatusActions
                table="modules"
                id={m.id}
                status={m.status}
                revalidate={[`/tree/${role}`, '/tree']}
                label={m.title_tr ?? m.title}
                canDelete
              />
              <Link
                href={`/tree/${role}/${m.slug}`}
                className="p-2 text-muted-foreground hover:text-airspeak-red"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
        {(modules ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Bu rol için henüz modül yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
