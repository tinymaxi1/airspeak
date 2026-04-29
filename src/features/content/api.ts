/**
 * Content API — Supabase'den içerik çeken React Query hook'ları.
 *
 * Tüm hook'lar:
 * - status='published' satırları döndürür (RLS otomatik filtreliyor)
 * - MMKV cache fallback (offline mod)
 * - Realtime invalidation: admin yeni publish edince otomatik refresh
 */
import { useQuery } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
// İçerik tablolarının jenerasyonu Faz 0 sonrası yapılacak; şimdilik any cast.
const supabase: any = typedSupabase;
import type {
  ModuleRow,
  ModuleWithUnits,
  UnitRow,
  UnitWithLessons,
  LessonRow,
  LessonWithExercises,
  ExerciseRow,
  VocabTermRow,
  InterviewQuestionRow,
  Icao4QuestionRow,
  OralPromptRow,
  PlacementQuestionRow,
  AirlineRow,
  ScenarioRow,
  Role,
} from './types';

const FIVE_MIN = 5 * 60_000;
const ONE_HOUR = 60 * 60_000;

// ═══════════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════════

export function useModules(role: Role | null | undefined) {
  return useQuery({
    queryKey: ['content', 'modules', role],
    enabled: !!role,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<ModuleWithUnits[]> => {
      if (!role) return [];
      const { data, error } = await supabase
        .from('modules')
        .select(
          `
          *,
          units!inner(
            *,
            lessons!inner(*)
          )
        `,
        )
        .eq('role', role)
        .eq('status', 'published')
        .eq('units.status', 'published')
        .eq('units.lessons.status', 'published')
        .order('sort', { ascending: true });
      if (error) throw error;
      // Sub-orderly sort
      const modules = (data ?? []).map((m: any) => ({
        ...m,
        units: (m.units ?? [])
          .sort((a: any, b: any) => a.sort - b.sort)
          .map((u: any) => ({
            ...u,
            lessons: (u.lessons ?? []).sort((a: any, b: any) => a.sort - b.sort),
          })),
      })) as ModuleWithUnits[];
      return modules;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// UNIT (lessons ile)
// ═══════════════════════════════════════════════════════════════

export function useUnit(unitSlug: string | null | undefined) {
  return useQuery({
    queryKey: ['content', 'unit', unitSlug],
    enabled: !!unitSlug,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<UnitWithLessons | null> => {
      if (!unitSlug) return null;
      const { data, error } = await supabase
        .from('units')
        .select(`*, lessons!inner(*)`)
        .eq('slug', unitSlug)
        .eq('status', 'published')
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      const unit = data as any;
      unit.lessons = (unit.lessons ?? []).sort((a: any, b: any) => a.sort - b.sort);
      return unit as UnitWithLessons;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// LESSON + EXERCISES (KRİTİK — kaldığım yer için sıralı egzersizler)
// ═══════════════════════════════════════════════════════════════

export function useLesson(lessonSlug: string | null | undefined) {
  return useQuery({
    queryKey: ['content', 'lesson', lessonSlug],
    enabled: !!lessonSlug,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<LessonWithExercises | null> => {
      if (!lessonSlug) return null;
      const { data, error } = await supabase
        .from('lessons')
        .select(`*, exercises!inner(*)`)
        .eq('slug', lessonSlug)
        .eq('status', 'published')
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      const lesson = data as any;
      lesson.exercises = (lesson.exercises ?? [])
        .filter((ex: any) => ex.status === 'published')
        .sort((a: any, b: any) => a.sort - b.sort);
      return lesson as LessonWithExercises;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// VOCAB
// ═══════════════════════════════════════════════════════════════

export function useVocab(role: Role | null | undefined, category?: string) {
  return useQuery({
    queryKey: ['content', 'vocab', role, category ?? null],
    enabled: !!role,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<VocabTermRow[]> => {
      if (!role) return [];
      let q = supabase
        .from('vocab_terms')
        .select('*')
        .eq('status', 'published')
        .or(`role.eq.${role},role.eq.all`);
      if (category) q = q.eq('category', category);
      const { data, error } = await q.order('difficulty', { ascending: true }).limit(2000);
      if (error) throw error;
      return (data ?? []) as VocabTermRow[];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// INTERVIEW QUESTIONS
// ═══════════════════════════════════════════════════════════════

export function useInterviewQuestions(role: Role | null | undefined, airlineSlug?: string | null) {
  return useQuery({
    queryKey: ['content', 'interview', role, airlineSlug ?? null],
    enabled: !!role,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<InterviewQuestionRow[]> => {
      if (!role) return [];
      let q = supabase
        .from('interview_questions')
        .select('*')
        .eq('role', role)
        .eq('status', 'published');
      if (airlineSlug) {
        q = q.or(`airline_slug.eq.${airlineSlug},airline_slug.is.null`);
      }
      const { data, error } = await q.order('difficulty', { ascending: true }).limit(500);
      if (error) throw error;
      return (data ?? []) as InterviewQuestionRow[];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ICAO 4
// ═══════════════════════════════════════════════════════════════

export function useIcao4Set(setNo: number | null | undefined) {
  return useQuery({
    queryKey: ['content', 'icao4', setNo],
    enabled: setNo !== null && setNo !== undefined,
    staleTime: FIVE_MIN,
    gcTime: ONE_HOUR,
    queryFn: async (): Promise<Icao4QuestionRow[]> => {
      if (setNo === null || setNo === undefined) return [];
      const { data, error } = await supabase
        .from('icao4_questions')
        .select('*')
        .eq('set_no', setNo)
        .eq('status', 'published')
        .order('section', { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Icao4QuestionRow[];
    },
  });
}

export function useIcao4Section(section: string) {
  return useQuery({
    queryKey: ['content', 'icao4_section', section],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<Icao4QuestionRow[]> => {
      const { data, error } = await supabase
        .from('icao4_questions')
        .select('*')
        .eq('section', section)
        .eq('status', 'published')
        .order('set_no', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Icao4QuestionRow[];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ORAL PROMPTS
// ═══════════════════════════════════════════════════════════════

export function useOralPrompts(taskType?: OralPromptRow['task_type']) {
  return useQuery({
    queryKey: ['content', 'oral', taskType ?? 'all'],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<OralPromptRow[]> => {
      let q = supabase.from('oral_prompts').select('*').eq('status', 'published');
      if (taskType) q = q.eq('task_type', taskType);
      const { data, error } = await q.limit(200);
      if (error) throw error;
      return (data ?? []) as OralPromptRow[];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// PLACEMENT
// ═══════════════════════════════════════════════════════════════

export function usePlacementBatch(dimension?: string, level?: string) {
  return useQuery({
    queryKey: ['content', 'placement', dimension ?? 'all', level ?? 'all'],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<PlacementQuestionRow[]> => {
      let q = supabase.from('placement_questions').select('*').eq('status', 'published');
      if (dimension) q = q.eq('dimension', dimension);
      if (level) q = q.eq('level', level);
      const { data, error } = await q.order('weight', { ascending: false }).limit(500);
      if (error) throw error;
      return (data ?? []) as PlacementQuestionRow[];
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// AIRLINES
// ═══════════════════════════════════════════════════════════════

export function useAirlines(region?: string | null) {
  return useQuery({
    queryKey: ['content', 'airlines', region ?? 'all'],
    staleTime: ONE_HOUR,
    queryFn: async (): Promise<AirlineRow[]> => {
      let q = supabase.from('airlines').select('*').eq('status', 'published');
      if (region) q = q.eq('region', region);
      const { data, error } = await q.order('prestige', { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as AirlineRow[];
    },
  });
}

export function useAirline(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['content', 'airline', slug],
    enabled: !!slug,
    staleTime: ONE_HOUR,
    queryFn: async (): Promise<AirlineRow | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('airlines')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as AirlineRow;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SCENARIOS
// ═══════════════════════════════════════════════════════════════

export function useScenarios(role: Role | null | undefined) {
  return useQuery({
    queryKey: ['content', 'scenarios', role],
    enabled: !!role,
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<ScenarioRow[]> => {
      if (!role) return [];
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('status', 'published')
        .or(`role.eq.${role},role.eq.all`)
        .order('difficulty', { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as ScenarioRow[];
    },
  });
}

export function useScenario(slug: string | null | undefined) {
  return useQuery({
    queryKey: ['content', 'scenario', slug],
    enabled: !!slug,
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<ScenarioRow | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as ScenarioRow;
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Bir sonraki tamamlanmamış lesson
// ═══════════════════════════════════════════════════════════════

/**
 * useNextLesson — Home Daily Flight Plan card için.
 * Tamamlanmamış ilk lesson'ı döndürür (rol bazlı tüm modülleri tarayarak).
 */
export function useNextLesson(role: Role | null | undefined, completedSlugs: Set<string>) {
  return useQuery({
    queryKey: ['content', 'next_lesson', role, [...completedSlugs].sort().join(',')],
    enabled: !!role,
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<LessonRow | null> => {
      if (!role) return null;
      // Modülleri sort'la çek, lesson level'a kadar inerek ilk tamamlanmamışı bul
      const { data, error } = await supabase
        .from('lessons')
        .select('*, unit:units!inner(module:modules!inner(role, sort), sort), sort')
        .eq('status', 'published')
        .eq('units.modules.role', role);
      if (error) throw error;
      const sorted = (data ?? []).sort((a: any, b: any) => {
        const ms = (a.unit?.module?.sort ?? 0) - (b.unit?.module?.sort ?? 0);
        if (ms !== 0) return ms;
        const us = (a.unit?.sort ?? 0) - (b.unit?.sort ?? 0);
        if (us !== 0) return us;
        return (a.sort ?? 0) - (b.sort ?? 0);
      });
      const next = sorted.find((l: any) => !completedSlugs.has(l.slug));
      return (next ?? null) as LessonRow | null;
    },
  });
}
