import { createServiceClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guard';
import { Volume2, Database } from 'lucide-react';

interface BucketStat {
  bucket_id: string;
  file_count: number;
  total_size_bytes: number;
}

async function getBucketStats(): Promise<BucketStat[]> {
  // Service role gerekir — RPC fonksiyonu kullanıcı yetkisini check ediyor
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc('get_bucket_stats');
  if (error || !data) return [];
  return data as BucketStat[];
}

const BUCKET_LABEL: Record<string, { tr: string; emoji: string; color: string }> = {
  'lesson-audio': { tr: 'Ders Sesleri', emoji: '🎧', color: 'bg-airspeak-red/10 text-airspeak-red' },
  'vocab-audio': { tr: 'Kelime Telaffuz', emoji: '🗣', color: 'bg-blue-100 text-blue-700' },
  'lesson-images': { tr: 'Ders Görselleri', emoji: '🖼', color: 'bg-purple-100 text-purple-700' },
  'oral-prompt-images': { tr: 'Sözlü Sınav Görselleri', emoji: '📷', color: 'bg-pink-100 text-pink-700' },
  'user-avatars': { tr: 'Kullanıcı Avatarları', emoji: '👤', color: 'bg-emerald-100 text-emerald-700' },
};

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default async function AudioLibraryPage() {
  await requireAdmin();
  const stats = await getBucketStats();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-airspeak-navy">Ses & Görsel Kütüphanesi</h1>
        <p className="text-muted-foreground mt-1">
          5 Storage bucket — admin form'larındaki AudioField ile manuel mp3/wav/ogg yüklemesi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(BUCKET_LABEL).map((id) => {
          const b = BUCKET_LABEL[id]!;
          const stat = stats.find((s) => s.bucket_id === id);
          return (
            <div key={id} className="bg-white border border-border rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${b.color}`}>
                {b.emoji}
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-base">{b.tr}</h3>
                <p className="text-xs text-muted-foreground">{id}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Dosya</p>
                  <p className="text-xl font-bold tabular-nums">
                    {(stat?.file_count ?? 0).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Boyut</p>
                  <p className="text-xl font-bold tabular-nums">
                    {fmtBytes(stat?.total_size_bytes ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-airspeak-gold/10 border border-airspeak-gold/30 rounded-xl p-5">
        <div className="flex gap-3">
          <Volume2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Manuel ses yükleme akışı</p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li>Egzersiz, ICAO 4 sorusu veya vocab terim formunda AudioField alanı</li>
              <li>Editör cihazından mp3/wav/ogg dosyasını sürükle-bırak ya da tıkla-seç</li>
              <li>Client-side validation (MIME + boyut + süre) → Supabase Storage upload</li>
              <li>Limitler Ayarlar → Audio Limitleri'nden runtime değiştirilir</li>
              <li>Kayıt published edilince mobil app cache invalidate olur, ses indirilebilir</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
