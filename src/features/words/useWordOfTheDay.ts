/**
 * useWordOfTheDay — Home screen "Günün İçeriği" hook.
 *
 * get_word_of_today() RPC çağrısı — kullanıcının profile.role'üne göre
 * bugünün rol bazlı içeriği (word/phrase/sentence/dialogue/tip).
 *
 * Cache: 6 saat staleTime (gün içinde aynı içerik kalır), 24 saat gcTime.
 * Locale: i18n.language ile TR/EN render seçimi (data döner her ikisi de).
 *
 * Sprint 14.D — Faz D mobile bağlantı.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type WordOfDayContentType = 'word' | 'phrase' | 'sentence' | 'dialogue' | 'tip';
export type WordOfDayWordType =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'abbr' | 'dialogue' | 'tip';
export type WordOfDayDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface WordOfDayRow {
  id: string;
  content_type: WordOfDayContentType;
  word_or_phrase: string;
  ipa: string | null;
  word_type: WordOfDayWordType | null;
  target_roles: string[];
  definition_en: string;
  definition_tr: string;
  example_en: string;
  example_tr: string;
  category: string;
  difficulty: WordOfDayDifficulty;
  word_audio_url: string | null;
  example_audio_url: string | null;
  is_active: boolean;
}

export function useWordOfTheDay() {
  return useQuery({
    queryKey: ['word-of-today'],
    queryFn: async (): Promise<WordOfDayRow | null> => {
      const { data, error } = await (supabase as any).rpc('get_word_of_today');
      if (error) {
        // Hata varsa null döner — UI bunu graceful handle eder
        return null;
      }
      // RPC SETOF döner → array; ilk satır (LIMIT 1 zaten RPC içinde)
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as WordOfDayRow;
      }
      return null;
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 saat: gün içinde aynı içerik
    gcTime: 1000 * 60 * 60 * 24, // 24 saat memory
    retry: 1,
  });
}
