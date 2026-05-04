'use client';

/**
 * IapSettingsForm — Sprint 13.A.7
 *
 * RevenueCat key, webhook secret, entitlement_id, product_ids editor.
 * Tek tek satır kaydeder; "Kaydet" butonu key başına.
 */
import { useState, useTransition } from 'react';
import { Loader2, KeyRound, Webhook, Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { updateIapConfig, type IapConfigRow } from '@/lib/iap/actions';

interface Props {
  rows: IapConfigRow[];
}

const LABELS: Record<string, { label: string; placeholder?: string; secret?: boolean; multi?: boolean; help?: string }> = {
  'revenuecat.ios_api_key': {
    label: 'iOS Public SDK Key',
    placeholder: 'appl_xxx…',
    secret: true,
    help: 'RevenueCat dashboard → Project Settings → API Keys → iOS public.',
  },
  'revenuecat.android_api_key': {
    label: 'Android Public SDK Key',
    placeholder: 'goog_xxx…',
    secret: true,
    help: 'RevenueCat dashboard → Project Settings → API Keys → Android public.',
  },
  'revenuecat.webhook_secret': {
    label: 'Webhook Authorization Secret',
    placeholder: 'rast üretilen rastgele bir string',
    secret: true,
    help: "RevenueCat → Integrations → Webhooks → Authorization header. Edge fn 'Bearer <secret>' bekler.",
  },
  'iap.entitlement_id': {
    label: 'Entitlement ID',
    placeholder: 'pro',
    help: 'RevenueCat dashboard → Entitlements → identifier. Premium gating için kullanılır.',
  },
  'iap.product_ids': {
    label: 'Product ID listesi (JSON array)',
    placeholder: '["airspeak_pro_annual","airspeak_pro_monthly","airspeak_pro_student"]',
    multi: true,
    help: 'App Store Connect / Play Console product ID\'leri. Paywall fetch için.',
  },
};

export function IapSettingsForm({ rows }: Props) {
  const map = new Map(rows.map((r) => [r.key, r]));
  const keys = Object.keys(LABELS);

  const allSecretsSet = keys
    .filter((k) => LABELS[k]!.secret)
    .every((k) => {
      const v = map.get(k)?.value;
      return typeof v === 'string' && v.length > 0;
    });

  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
        allSecretsSet
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
          : 'bg-amber-50 border-amber-300 text-amber-800'
      }`}>
        {allSecretsSet ? <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
        <div>
          <strong>{allSecretsSet ? 'IAP aktif' : 'IAP henüz aktif değil (mock-first)'}</strong>
          <div className="text-xs mt-0.5">
            {allSecretsSet
              ? 'Tüm RevenueCat key\'leri girilmiş. Mobile paywall canlı satın alma yapacak.'
              : 'Boş key\'ler dolduruluncaya kadar paywall kullanıcıya "Yakında aktif" gösterir; uygulama çökmez.'}
          </div>
        </div>
      </div>

      {keys.map((k) => {
        const row = map.get(k);
        if (!row) return null;
        return <Row key={k} row={row} meta={LABELS[k]!} />;
      })}
    </div>
  );
}

function Row({ row, meta }: { row: IapConfigRow; meta: { label: string; placeholder?: string; secret?: boolean; multi?: boolean; help?: string } }) {
  const initial = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
  const [val, setVal] = useState(initial);
  const [isPending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = val !== initial;

  function save() {
    setErr(null);
    let parsed: unknown = val;
    if (meta.multi) {
      try {
        parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          setErr('JSON array olmalı, örn: ["a","b","c"]');
          return;
        }
      } catch {
        setErr('Geçersiz JSON');
        return;
      }
    }
    start(async () => {
      const r = await updateIapConfig(row.key, parsed);
      if (!r.ok) setErr(r.error ?? 'Hata');
      else setSavedAt(Date.now());
    });
  }

  const Icon = meta.secret ? KeyRound : meta.multi ? Package : Webhook;

  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 text-airspeak-navy shrink-0" />
        <div className="flex-1 min-w-0">
          <label className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">{meta.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{row.key}</span>
            </div>
            {meta.multi ? (
              <textarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows={3}
                placeholder={meta.placeholder}
                className="w-full border border-border rounded px-2 py-1.5 text-sm font-mono"
              />
            ) : (
              <input
                type={meta.secret ? 'password' : 'text'}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={meta.placeholder}
                autoComplete="off"
                className="w-full border border-border rounded px-2 py-1.5 text-sm"
              />
            )}
          </label>
          {meta.help && (
            <p className="text-[11px] text-muted-foreground mt-1">{meta.help}</p>
          )}
          {err && <p className="text-xs text-red-700 mt-1">{err}</p>}
        </div>
        <button
          onClick={save}
          disabled={!dirty || isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-airspeak-red text-white text-xs font-semibold hover:bg-airspeak-red/90 disabled:opacity-40"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          {savedAt && !dirty ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}
