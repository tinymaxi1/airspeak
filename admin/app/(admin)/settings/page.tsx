import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { ConfigField } from '@/components/config/ConfigField';
import { Globe, Database, Volume2 } from 'lucide-react';

export default async function SettingsPage() {
  const profile = await requireAdminRole('reviewer');
  const supabase = await createClient();

  const { data: audioConfig } = await (supabase as any)
    .from('app_config')
    .select('*')
    .eq('category', 'audio')
    .order('key');

  const integrations = [
    {
      name: 'Supabase',
      icon: Database,
      status: 'connected',
      detail: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') ?? '—',
    },
    {
      name: 'DeepL (Translation)',
      icon: Globe,
      status: process.env.DEEPL_API_KEY ? 'connected' : 'missing',
      detail: process.env.DEEPL_API_KEY
        ? '••••••••' + process.env.DEEPL_API_KEY.slice(-4)
        : 'DEEPL_API_KEY env eksik',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Bağlı olduğun: <span className="font-semibold">{profile.full_name ?? profile.username}</span>
          {' · '}rol: <span className="font-bold text-airspeak-red">{profile.admin_role}</span>
        </p>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Entegrasyonlar</h2>
        <div className="space-y-3">
          {integrations.map((i) => {
            const Icon = i.icon;
            return (
              <div
                key={i.name}
                className="bg-white border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-airspeak-navy" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.detail}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                    i.status === 'connected'
                      ? 'bg-airspeak-green/15 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {i.status === 'connected' ? '✓ Bağlı' : '⚠ Eksik'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-airspeak-navy" />
          Audio Limitleri
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Manuel mp3/wav/ogg yüklemesi — admin form'larındaki AudioField bu config'i okur.
        </p>
        <div className="bg-white border border-border rounded-xl p-4">
          {(audioConfig ?? []).map((row: any) => (
            <ConfigField key={row.key} row={row} />
          ))}
          {(audioConfig ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Audio config kayıtları yok — migration uygulanmamış olabilir.
            </p>
          )}
        </div>
      </div>

      <div className="bg-airspeak-gold/10 border border-airspeak-gold/30 rounded-xl p-5 text-sm">
        <p className="font-semibold mb-2">Production deploy</p>
        <p className="text-amber-900">
          Vercel'a deploy etmek için: <code className="bg-white px-1 rounded">cd admin && vercel</code>
        </p>
        <p className="text-amber-900 mt-1">
          Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
          DEEPL_API_KEY
        </p>
      </div>
    </div>
  );
}
