import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ConfigField } from '@/components/config/ConfigField';
import { Crown, Lock, Zap } from 'lucide-react';

export default async function FreemiumPage() {
  await requireAdminRole('editor');
  const supabase = await createClient();

  const { data: limits } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'freemium')
    .order('key');

  const { data: features } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'feature_flag')
    .order('key');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Freemium Ayarları</h1>
        <p className="text-muted-foreground mt-1">
          Free kullanıcı limitleri + Pro ayrıcalıkları. Mobil app her açılışta okur, değişiklik
          5 saniyede yansır.
        </p>
      </div>

      {/* FREE LİMİTLER */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-5 h-5 text-airspeak-navy" />
          <h2 className="font-bold text-lg">Ücretsiz Kullanıcı Limitleri</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {(limits ?? []).map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Limit aşılınca mobil app otomatik paywall sheet açar. Premium kullanıcı bu
          limitleri görmez (sınırsız).
        </p>
      </section>

      {/* PRO AYRICALIKLAR */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-airspeak-gold" />
          <h2 className="font-bold text-lg">Pro Ayrıcalıkları</h2>
        </div>
        <div className="bg-airspeak-gold/5 border border-airspeak-gold/30 rounded-xl p-4">
          {(features ?? []).map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          ⚡ Aktif edilen feature'lar Pro kullanıcılara açılır. Kapatırsan o feature mobil app'te
          herkesten saklanır.
        </p>
      </section>

      <section className="bg-airspeak-red/5 border border-airspeak-red/30 rounded-xl p-5">
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-airspeak-red shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-airspeak-red mb-1">Anlık etki</p>
            <p className="text-foreground">
              Her toggle/limit değişikliği <strong>realtime</strong> olarak mobile app cache'ini
              invalidate eder. Kullanıcı bir sonraki ekran geçişinde yeni limiti görür. Push
              notification gönderilmez (sessiz güncelleme).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
