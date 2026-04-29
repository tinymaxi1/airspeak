import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ConfigField } from '@/components/config/ConfigField';
import { Megaphone, Smartphone, Eye, Heart } from 'lucide-react';

export default async function AdsPage() {
  await requireAdminRole('editor');
  const supabase = await createClient();

  const { data } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'ads')
    .order('key');

  const rows = data ?? [];
  const placement = rows.filter((r: any) =>
    r.key.startsWith('ads.banner') ||
    r.key.startsWith('ads.interstitial') ||
    r.key.startsWith('ads.rewarded') ||
    r.key === 'ads.enabled' ||
    r.key === 'ads.cta_text_tr',
  );
  const admob = rows.filter((r: any) => r.key.startsWith('ads.admob'));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Reklam Yönetimi</h1>
        <p className="text-muted-foreground mt-1">
          Reklam yerleşimleri, sıklık ve AdMob entegrasyon ayarları. Premium kullanıcı reklam görmez.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-5 h-5 text-airspeak-red" />
          <h2 className="font-bold text-lg">Yerleşim & Sıklık</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {placement.map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-airspeak-navy" />
          <h2 className="font-bold text-lg">AdMob Konfig</h2>
        </div>
        <div className="bg-white border border-border rounded-xl p-4">
          {admob.map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
        </div>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-amber-900 mb-1">📱 AdMob nasıl alınır?</p>
          <ol className="list-decimal pl-5 text-amber-900 text-xs space-y-1">
            <li>
              <a className="underline" href="https://admob.google.com" target="_blank">
                admob.google.com
              </a>{' '}
              → Google hesabınla giriş yap
            </li>
            <li>App ekle (iOS + Android için ayrı app oluştur)</li>
            <li>Ad units oluştur: 1 banner, 1 interstitial, 1 rewarded</li>
            <li>App ID + her unit ID'yi yukarıdaki form alanlarına yapıştır</li>
            <li>
              Mobile app'te Faz 9'da react-native-google-mobile-ads SDK eklenecek (şu an config
              hazır, SDK bekleniyor)
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-airspeak-green/5 border border-airspeak-green/30 rounded-xl p-5">
        <div className="flex gap-3">
          <Heart className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-900 mb-1">Reklam → Kalp formülü</p>
            <p className="text-foreground">
              Kullanıcının kalpleri biterse "Reklam izle, 1 kalp kazan" CTA gösterilir
              (rewarded_heart_refill aktifse). Bu ücretsiz kullanıcı için en yüksek revenue
              kaynaklarından biridir + retention'a etki eder.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
