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
import { useAuthStore } from '@/stores/authStore';

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
  /**
   * Sub-role filter array. Migration 20260513000003 ile eklendi.
   * Boş = sadece target_roles ile filtre. Dolu = ek sub_role kısıtlaması.
   */
  target_sub_roles?: string[];
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
  // Role + sub_role queryKey'de — kullanıcı role/sub_role değiştirirse otomatik
  // refetch (cache miss). useUserDataSync server'dan role + sub_role hidrate
  // eder, store'a yazar → bu query yeni key ile fetch atar.
  //
  // RPC get_word_of_today() user_id üzerinden sub_role'ü auth.uid()'den okur
  // (FAZ 3 migration), param geçirmemiz gerekmez. queryKey sadece cache
  // invalidation için.
  const role = useAuthStore((s) => s.profile?.role ?? null);
  const subRole = useAuthStore((s) => s.profile?.sub_role ?? null);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  return useQuery({
    queryKey: ['word-of-today', userId, role, subRole],
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
    enabled: !!userId, // anonim kullanıcı için no-op
    staleTime: 1000 * 60 * 30, // 30 dk — gün içinde stabil ama rol değişimi hızlı yansır
    gcTime: 1000 * 60 * 60 * 12, // 12 saat memory cache
    retry: 1,
  });
}
