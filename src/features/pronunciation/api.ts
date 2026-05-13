/**
 * Pronunciation Sentences API — DB-driven, TS fallback.
 *
 * Sprint C2:
 * - DB tablo: pronunciation_sentences
 * - TS fallback: src/features/pronunciation/sentences.ts
 */
import { useQuery } from '@tanstack/react-query';
import { supabase as typedSupabase } from '@/lib/supabase';
import { PRONUNCIATION_SENTENCES as TS_FALLBACK, type PronunciationSentence } from './sentences';

const supabase: any = typedSupabase;
const FIVE_MIN = 5 * 60_000;

export interface PronunciationSentenceRow {
  id: string;
  slug: string;
  text_en: string;
  text_tr: string | null;
  ipa: string | null;
  phonemes: string[] | null;
  level: string | null;
  target_role: string;
  target_sub_roles: string[] | null;
  category: string | null;
  hint_tr: string | null;
  hint_en: string | null;
  audio_url: string | null;
  sort: number;
}

function rowToSentence(r: PronunciationSentenceRow): PronunciationSentence {
  return {
    id: r.slug,
    text: r.text_en,
    category: (r.category as any) ?? 'phraseology',
    level: (r.level as any) ?? 'A2',
    hint: r.hint_tr ?? undefined,
  };
}

export function usePronunciationSentences(
  role: string | null | undefined,
  subRole?: string | null,
  level?: string | null,
) {
  return useQuery({
    queryKey: ['pronunciation-sentences', role ?? 'any', subRole ?? 'any', level ?? 'any'],
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<PronunciationSentence[]> => {
      try {
        let query = supabase
          .from('pronunciation_sentences')
          .select('*')
          .eq('status', 'published');
        if (role) query = query.in('target_role', [role, 'all']);
        if (level) query = query.eq('level', level);
        const { data, error } = await query.order('sort', { ascending: true }).limit(50);
        if (error) throw error;
        // DB boş → fallback KULLANMA (rol için içerik yok). Sadece error → fallback
        if (!data || data.length === 0) return [];

        let rows = data as PronunciationSentenceRow[];
        if (subRole) {
          const subFiltered = rows.filter(
            (r) => !r.target_sub_roles || r.target_sub_roles.length === 0 || r.target_sub_roles.includes(subRole),
          );
          if (subFiltered.length >= 2) rows = subFiltered;
        }
        return rows.map(rowToSentence);
      } catch (e) {
        if (__DEV__) console.warn('pronunciation fetch failed, fallback:', e);
        return TS_FALLBACK;
      }
    },
  });
}

/** Tek sentence by slug — fallback'te de id'ye göre arar. */
export function usePronunciationSentence(slug: string | undefined) {
  return useQuery({
    queryKey: ['pronunciation-sentence', slug ?? ''],
    enabled: !!slug,
    staleTime: FIVE_MIN,
    queryFn: async (): Promise<PronunciationSentence | null> => {
      if (!slug) return null;
      try {
        const { data, error } = await supabase
          .from('pronunciation_sentences')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();
        if (error) throw error;
        if (data) return rowToSentence(data as PronunciationSentenceRow);
        // DB'de yok → null (TS fallback YOK — empty state UI gösterilir)
        return null;
      } catch (e) {
        if (__DEV__) console.warn('pronunciation single fetch failed:', e);
        // Sadece error → TS fallback (network sorun olabilir)
        return TS_FALLBACK.find((s) => s.id === slug) ?? null;
      }
    },
  });
}
