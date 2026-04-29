import { createClient } from '@/lib/supabase/server';
import {
  Users,
  BookOpen,
  GraduationCap,
  Mic,
  ClipboardList,
  Plane,
  TrendingUp,
} from 'lucide-react';

async function getCounts() {
  const supabase = await createClient();
  const tables = [
    'modules',
    'units',
    'lessons',
    'exercises',
    'vocab_terms',
    'interview_questions',
    'icao4_questions',
    'oral_prompts',
    'placement_questions',
    'airlines',
    'profiles',
  ] as const;
  const results = await Promise.all(
    tables.map(async (t) => {
      const { count } = await (supabase as any)
        .from(t)
        .select('*', { count: 'exact', head: true });
      return { table: t, count: count ?? 0 };
    }),
  );
  return Object.fromEntries(results.map((r) => [r.table, r.count]));
}

async function getPublishedCounts() {
  const supabase = await createClient();
  const tables = ['modules', 'lessons', 'exercises', 'vocab_terms', 'interview_questions'] as const;
  const results = await Promise.all(
    tables.map(async (t) => {
      const { count } = await (supabase as any)
        .from(t)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      return { table: t, count: count ?? 0 };
    }),
  );
  return Object.fromEntries(results.map((r) => [r.table, r.count]));
}

export default async function DashboardPage() {
  const counts = await getCounts();
  const published = await getPublishedCounts();

  const stats = [
    { label: 'Modül', count: counts.modules, icon: BookOpen, color: 'bg-airspeak-red/10 text-airspeak-red' },
    { label: 'Ders', count: counts.lessons, icon: GraduationCap, color: 'bg-airspeak-navy/10 text-airspeak-navy' },
    { label: 'Egzersiz', count: counts.exercises, icon: ClipboardList, color: 'bg-airspeak-gold/10 text-airspeak-gold' },
    { label: 'Kelime', count: counts.vocab_terms, icon: BookOpen, color: 'bg-airspeak-green/10 text-airspeak-green' },
    { label: 'Mülakat sorusu', count: counts.interview_questions, icon: ClipboardList, color: 'bg-purple-100 text-purple-700' },
    { label: 'ICAO 4 sorusu', count: counts.icao4_questions, icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
    { label: 'Sözlü prompt', count: counts.oral_prompts, icon: Mic, color: 'bg-pink-100 text-pink-700' },
    { label: 'Havayolu', count: counts.airlines, icon: Plane, color: 'bg-orange-100 text-orange-700' },
    { label: 'Kullanıcı', count: counts.profiles, icon: Users, color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Sistemdeki tüm içerikler ve hızlı durum.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border border-border rounded-xl p-5 hover:shadow-sm transition"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold tracking-tight">
                  {s.count.toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Yayın Durumu</h2>
        <div className="space-y-3">
          {Object.entries(published).map(([table, count]) => {
            const total = counts[table] ?? 0;
            const ratio = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
            return (
              <div key={table} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{table}</div>
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-airspeak-green h-full transition-all"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground tabular-nums">
                  {(count as number).toLocaleString('tr-TR')} / {total.toLocaleString('tr-TR')} (%{ratio})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
