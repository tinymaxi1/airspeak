import { requireAdmin } from '@/lib/auth/guard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-airspeak-background">
      <Sidebar adminRole={profile.admin_role} />
      <div className="flex-1 flex flex-col">
        <Header profile={profile} />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
