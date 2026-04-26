export type UserRole = 'pilot' | 'cabin' | 'technician' | 'ground' | 'student';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  level: Level | null;
  daily_goal_minutes: number;
  timezone: string;
  active_hours: number[];
  is_student: boolean;
  created_at: string;
  updated_at: string;
}
