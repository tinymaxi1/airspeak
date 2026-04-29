import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CreateUnitButton } from '@/components/forms/UnitActions';
import { EditModuleButton } from '@/components/forms/ModuleActions';
import { StatusActions } from '@/components/forms/StatusActions';

export default async function UnitsPage({
  params,
}: {
  params: Promise<{ role: string; moduleSlug: string }>;
}) {
  const { role, moduleSlug } = await params;
  const supabase = await createClient();

  const { data: module } = await (supabase as any)
    .from('modules')
    .select('id, slug, number, title, title_tr, description, status, role')
    .eq('slug', moduleSlug)
    .single();

  if (!module) notFound();

  const { data: units } = await (supabase as any)
    .from('units')
    .select('id, slug, number, title, title_tr, description, status, sort, lessons(id)')
    .eq('module_id', module.id)
    .order('sort', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/tree/${role}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {role}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              MODÜL {String(module.number).padStart(2, '0')}
            </p>
            <h1 className="text-3xl font-bold text-airspeak-navy">
              {module.title_tr ?? module.title}
            </h1>
            {module.description && (
              <p className="text-muted-foreground mt-1">{module.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <EditModuleButton role={role} module={module} />
            <CreateUnitButton moduleId={module.id} moduleSlug={moduleSlug} role={role} />
          </div>
        </div>
        <div className="mt-3">
          <StatusActions
            table="modules"
            id={module.id}
            status={module.status}
            revalidate={[`/tree/${role}`, `/tree/${role}/${moduleSlug}`]}
            label={module.title_tr ?? module.title}
            canDelete
          />
        </div>
      </div>

      <div className="space-y-3">
        {(units ?? []).map((u: any) => (
          <Link
            key={u.id}
            href={`/tree/${role}/${moduleSlug}/${u.slug}`}
            className="group bg-white border border-border rounded-xl p-5 hover:border-airspeak-red hover:shadow-sm transition flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-airspeak-gold/20 text-airspeak-navy flex items-center justify-center text-sm font-bold tabular-nums">
              {String(u.number).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-airspeak-navy">
                  {u.title_tr ?? u.title}
                </h3>
                <StatusBadge status={u.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {(u.lessons?.length ?? 0)} ders
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-airspeak-red group-hover:translate-x-1 transition" />
          </Link>
        ))}
        {(units ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Henüz ünite yok.</div>
        )}
      </div>
    </div>
  );
}
