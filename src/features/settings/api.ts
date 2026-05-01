/**
 * Settings feature API — user_settings okuma/yazma helpers.
 * Sprint 4.D
 */
import { supabase } from '@/lib/supabase';

export interface UserSettings {
  user_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notif_streak: boolean;
  notif_league: boolean;
  notif_community: boolean;
  notif_offers: boolean;
  notif_oral: boolean;
  notif_placement: boolean;
  study_reminder_hour: number | null;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;
  tts_speed: number;
  tts_auto_play: boolean;
}

export type SettingsPatch = Partial<Omit<UserSettings, 'user_id'>>;

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await (supabase as any)
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserSettings;
}

export async function updateUserSettings(
  userId: string,
  patch: SettingsPatch,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await (supabase as any)
    .from('user_settings')
    .update(patch)
    .eq('user_id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateDailyGoalMinutes(
  userId: string,
  minutes: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ daily_goal_minutes: minutes })
    .eq('id', userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
