'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AdminProfile } from '@/lib/auth/guard';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  editor: 'Editör',
  reviewer: 'İnceleyici',
} as const;

const ROLE_COLOR = {
  super_admin: 'bg-airspeak-red text-white',
  editor: 'bg-airspeak-gold text-airspeak-navy',
  reviewer: 'bg-secondary text-secondary-foreground',
} as const;

export function Header({ profile }: { profile: AdminProfile }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Çıkış yapıldı');
    router.push('/login');
    router.refresh();
  }

  const role = profile.admin_role;
  const initials = (profile.full_name ?? profile.username ?? 'A')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-8">
      <div>
        <h1 className="text-sm font-semibold text-airspeak-navy">İçerik Yönetimi</h1>
      </div>
      <div className="flex items-center gap-4">
        {role && (
          <span
            className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${ROLE_COLOR[role]}`}
          >
            {ROLE_LABEL[role]}
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-airspeak-navy text-white flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
          <div className="text-sm">
            <div className="font-semibold">{profile.full_name ?? profile.username ?? 'Admin'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground p-2"
          title="Çıkış"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
