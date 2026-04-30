'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TreePine,
  BookOpen,
  GraduationCap,
  Mic,
  ClipboardList,
  Plane,
  MessageSquare,
  Users,
  History,
  BarChart3,
  Settings,
  Volume2,
  Crown,
  Megaphone,
  Lock,
  TrendingUp,
  FileJson,
  Award,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Bu rol veya üstü görür */
  minRole?: 'super_admin' | 'editor' | 'reviewer';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, minRole: 'reviewer' },
  { href: '/tree', label: 'Modül Ağacı', icon: TreePine, minRole: 'reviewer' },
  { href: '/vocab', label: 'Kelime Hazinesi', icon: BookOpen, minRole: 'reviewer' },
  { href: '/icao4', label: 'ICAO 4 Sınav', icon: GraduationCap, minRole: 'reviewer' },
  { href: '/oral', label: 'Sözlü Sınav', icon: Mic, minRole: 'reviewer' },
  { href: '/interviews', label: 'Mülakat', icon: ClipboardList, minRole: 'reviewer' },
  { href: '/airlines', label: 'Havayolları', icon: Plane, minRole: 'reviewer' },
  { href: '/scenarios', label: 'AI Senaryolar', icon: MessageSquare, minRole: 'reviewer' },
  { href: '/placement', label: 'Placement Test', icon: ClipboardList, minRole: 'reviewer' },
  { href: '/badges', label: 'Rozetler', icon: Award, minRole: 'editor' },
  { href: '/audio', label: 'Ses Kütüphanesi', icon: Volume2, minRole: 'editor' },
  { href: '/users', label: 'Kullanıcılar', icon: Users, minRole: 'editor' },
  { href: '/revenue', label: 'Revenue / Premium', icon: TrendingUp, minRole: 'editor' },
  { href: '/freemium', label: 'Freemium / Limitler', icon: Lock, minRole: 'editor' },
  { href: '/ads', label: 'Reklamlar', icon: Megaphone, minRole: 'editor' },
  { href: '/paywall', label: 'Paywall / Fiyat', icon: Crown, minRole: 'editor' },
  { href: '/import', label: 'Bulk Import', icon: FileJson, minRole: 'super_admin' },
  { href: '/audit', label: 'Audit Log', icon: History, minRole: 'reviewer' },
  { href: '/analytics', label: 'Analitik', icon: BarChart3, minRole: 'reviewer' },
];

const ROLE_LEVEL = { super_admin: 3, editor: 2, reviewer: 1 } as const;

export function Sidebar({
  adminRole,
}: {
  adminRole: 'super_admin' | 'editor' | 'reviewer' | null;
}) {
  const pathname = usePathname();
  const userLevel = adminRole ? ROLE_LEVEL[adminRole] : 0;

  return (
    <aside className="w-64 bg-airspeak-navy text-white flex flex-col border-r border-airspeak-navy/50">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="block">
          <div className="text-xl font-bold tracking-tight">AirSpeak</div>
          <div className="text-xs text-white/60 uppercase tracking-widest mt-1">
            Admin Panel
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const allowed = !item.minRole || userLevel >= ROLE_LEVEL[item.minRole];
          if (!allowed) return null;

          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-airspeak-red text-white'
                  : 'text-white/80 hover:bg-white/10',
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10"
        >
          <Settings className="w-4 h-4" />
          Ayarlar
        </Link>
      </div>
    </aside>
  );
}
