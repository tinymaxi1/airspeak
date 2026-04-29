import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ConfigField } from '@/components/config/ConfigField';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';

export default async function PaywallPage() {
  await requireAdminRole('editor');
  const supabase = await createClient();

  const { data } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'paywall')
    .order('key');

  const rows = data ?? [];
  const pricing = rows.filter((r: any) => r.key.includes('price') || r.key.includes('savings') || r.key.includes('trial'));
  const copy = rows.filter((r: any) => r.key.includes('headline') || r.key.includes('subhead') || r.key.includes('benefits'));
  const display = rows.filter((r: any) => r.key.includes('show_') || r.key.includes('recommended_'));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Paywall & Fiyatlandırma</h1>
        <p className="text-muted-foreground mt-1">
          Pro fiyatlandırma, deneme süresi, paywall kopyaları. Mobil app paywall ekranı bu
          değerleri okur.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-airspeak-red" />
          <h2 className="font-bold text-lg">Fiyatlandırma</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {pricing.map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💰 TL cinsinden. Yıllık fiyat aylık × 12 değil, indirimli — savings_percent kadar.
          Mobil app App Store/Play Store IAP ile bu fiyatları gösterir.
        </p>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-airspeak-gold" />
          <h2 className="font-bold text-lg">Paywall Kopyası</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {copy.map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-airspeak-navy" />
          <h2 className="font-bold text-lg">Görüntüleme</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {display.map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
      </section>

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5">
        <div className="text-sm space-y-2">
          <p className="font-semibold">📋 Paywall önizleme nasıl olur</p>
          <p className="text-foreground">
            Mobil app paywall sheet açıldığında:
          </p>
          <ul className="list-disc pl-5 text-foreground space-y-1 text-xs">
            <li>Üst kısım: <strong>headline_tr</strong></li>
            <li>Alt yazı: <strong>subhead_tr</strong></li>
            <li>3 fiyat kartı: aylık / yıllık (RECOMMENDED rozeti) / lifetime</li>
            <li>Yıllık altında "<strong>%savings</strong> tasarruf" yazar</li>
            <li>Liste: <strong>benefits_tr</strong> (her satır ✓ ile)</li>
            <li>CTA: "<strong>trial_days</strong> gün ücretsiz dene"</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
