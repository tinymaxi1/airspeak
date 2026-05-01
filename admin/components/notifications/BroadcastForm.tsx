'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { sendBroadcast } from '@/lib/notifications/actions';

const AUDIENCES = [
  { value: 'all', label: 'Tüm kullanıcılar' },
  { value: 'free', label: 'Ücretsiz (premium değil)' },
  { value: 'premium', label: 'Premium aktif' },
  { value: 'role:pilot', label: 'Pilot' },
  { value: 'role:cabin', label: 'Kabin' },
  { value: 'role:technician', label: 'Teknisyen' },
  { value: 'role:ground', label: 'Yer hizmetleri' },
  { value: 'role:student', label: 'Öğrenci' },
  { value: 'level:A1', label: 'Seviye A1' },
  { value: 'level:A2', label: 'Seviye A2' },
  { value: 'level:B1', label: 'Seviye B1' },
  { value: 'level:B2', label: 'Seviye B2' },
  { value: 'level:C1', label: 'Seviye C1' },
];

export function BroadcastForm() {
  const [audience, setAudience] = useState('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState('admin_broadcast');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit() {
    if (!title || !body) {
      setResult('Başlık ve mesaj zorunlu');
      return;
    }
    if (
      !confirm(
        `"${audience}" audience'ına push gönderilecek.\n\nBaşlık: ${title}\n\nDevam edilsin mi?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setResult(null);
    const r = await sendBroadcast({ audience, title, body, kind });
    setBusy(false);
    if (!r.ok) {
      setResult(`Hata: ${r.error}`);
      return;
    }
    setResult(`✓ ${r.sent ?? 0} push gönderildi`);
    setTitle('');
    setBody('');
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Audience</label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        >
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Başlık</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={64}
          placeholder="örn: Yeni ICAO 4 setleri açıldı 🎯"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">{title.length}/64</div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Mesaj</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={240}
          rows={3}
          placeholder="Bu hafta 5 yeni mock sınav eklendi. Aviation English'i bir üst seviyeye taşı."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
        />
        <div className="text-xs text-muted-foreground mt-1">{body.length}/240</div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Kind (deep link routing)</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono"
        >
          <option value="admin_broadcast">admin_broadcast (notifications)</option>
          <option value="new_unit">new_unit (learn)</option>
          <option value="special_offer">special_offer (paywall)</option>
          <option value="ai_scenario_weekly">ai_scenario_weekly (conversation)</option>
          <option value="exam_countdown">exam_countdown (exam)</option>
        </select>
      </div>

      <button
        onClick={onSubmit}
        disabled={busy || !title || !body}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-airspeak-red text-white font-semibold hover:bg-airspeak-red/90 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Gönder
          </>
        )}
      </button>

      {result && (
        <div
          className={`text-sm font-semibold ${result.startsWith('✓') ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {result}
        </div>
      )}
    </div>
  );
}
