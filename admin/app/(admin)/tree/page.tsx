import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plane, Users, Wrench, Headphones, GraduationCap, ChevronRight } from 'lucide-react';

const ROLES = [
  { id: 'pilot', label: 'Pilot', icon: Plane, color: 'bg-airspeak-red/10 text-airspeak-red border-airspeak-red/20' },
  { id: 'cabin', label: 'Kabin Ekibi', icon: Users, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'technician', label: 'Teknisyen', icon: Wrench, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'ground', label: 'Yer Hizmetleri', icon: Headphones, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'student', label: 'Öğrenci', icon: GraduationCap, color: 'bg-blue-100 text-blue-700 border-blue-200' },
] as const;

async function getRoleStats() {
  const supabase = await createClient();
  const stats: Record<string, { modules: number; lessons: number }> = {};
  for (const role of ROLES) {
    const [{ count: modCount }, { count: lessonCount }] = await Promise.all([
      (supabase as any).from('modules').select('*', { count: 'exact', head: true }).eq('role', role.id),
      (supabase as any)
        .from('lessons')
        .select('*, units!inner(modules!inner(role))', { count: 'exact', head: true })
        .eq('units.modules.role', role.id),
    ]);
    stats[role.id] = { modules: modCount ?? 0, lessons: lessonCount ?? 0 };
  }
  return stats;
}

export default async function TreeRolesPage() {
  const stats = await getRoleStats();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Modül Ağacı</h1>
        <p className="text-muted-foreground mt-1">
          Bir rol seç — modülleri, üniteleri, dersleri ve egzersizleri yönet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const s = stats[role.id] ?? { modules: 0, lessons: 0 };
          return (
            <Link
              key={role.id}
              href={`/tree/${role.id}`}
              className="group bg-white border border-border rounded-xl p-5 hover:border-airspeak-red hover:shadow-sm transition-all"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${role.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-airspeak-navy">{role.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.modules} modül · {s.lessons} ders
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-airspeak-red group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
