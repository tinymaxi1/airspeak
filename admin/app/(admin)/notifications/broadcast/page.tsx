/**
 * /admin/notifications/broadcast — manuel push gönder.
 * super_admin only.
 */
import Link from 'next/link';
import { requireAdminRole } from '@/lib/auth/guard';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { BroadcastForm } from '@/components/notifications/BroadcastForm';

export default async function BroadcastPage() {
  await requireAdminRole('super_admin');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-airspeak-navy mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Bildirimler
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-airspeak-red/15 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-airspeak-red" />
          </div>
          <h1 className="text-3xl font-bold text-airspeak-navy">Broadcast Gönder</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Audience seç, push gönder. Otomatik notification_log + audit kaydı.
        </p>
      </div>

      <BroadcastForm />

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">⚠ Dikkat</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Tüm aktif token'lara gerçek push gönderir.</li>
          <li>app_config: <code>notifications.edge_url</code> ve <code>service_token</code> dolu olmalı.</li>
          <li>Test için önce küçük audience (örn role:student) ile dene.</li>
          <li>Gönderim sonrası geri alınamaz — kullanıcılar push'u görür.</li>
        </ul>
      </section>
    </div>
  );
}
