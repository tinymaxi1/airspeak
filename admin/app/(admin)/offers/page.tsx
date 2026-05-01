/**
 * /admin/offers — Limited offers list.
 *
 * Gruplar: aktif (window içi + is_active) · upcoming (starts_at > now) ·
 * pasif (is_active=false) · expired (ends_at < now).
 * Aksiyonlar: edit · toggle · broadcast · delete.
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { CreateOfferButton } from '@/components/forms/OfferForm';
import { OfferRowActions } from '@/components/offers/OfferRowActions';
import { Crown, Calendar, Users, Tag } from 'lucide-react';

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'Herkes',
  free: 'Free',
  trial_used: 'Trial bitti',
  expired_trial: 'Expired 7g+',
  active_premium: 'Aktif Pro',
  inactive_7d: 'İnaktif 7g+',
};

const AUDIENCE_COLOR: Record<string, string> = {
  all: 'bg-airspeak-navy/10 text-airspeak-navy',
  free: 'bg-blue-100 text-blue-700',
  trial_used: 'bg-amber-100 text-amber-700',
  expired_trial: 'bg-red-100 text-red-700',
  active_premium: 'bg-emerald-100 text-emerald-700',
  inactive_7d: 'bg-purple-100 text-purple-700',
};

function categorize(row: any): 'active' | 'upcoming' | 'expired' | 'inactive' {
  const now = Date.now();
  const start = new Date(row.starts_at).getTime();
  const end = new Date(row.ends_at).getTime();
  if (!row.is_active) return 'inactive';
  if (start > now) return 'upcoming';
  if (end < now) return 'expired';
  return 'active';
}

function formatPricing(row: any): string {
  const parts: string[] = [];
  if (row.monthly_price_try != null) parts.push(`Aylık ₺${row.monthly_price_try}`);
  if (row.yearly_price_try != null) parts.push(`Yıllık ₺${row.yearly_price_try}`);
  if (row.lifetime_price_try != null) parts.push(`Lifetime ₺${row.lifetime_price_try}`);
  if (parts.length === 0 && row.discount_percent != null) {
    return `Tüm tier'larda %${row.discount_percent} indirim`;
  }
  if (parts.length > 0 && row.discount_percent != null) {
    parts.push(`(diğerleri %${row.discount_percent})`);
  }
  return parts.join(' · ');
}

export default async function OffersPage() {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const { data } = await (supabase as any)
    .from('limited_offers')
    .select('*')
    .order('priority', { ascending: false })
    .order('starts_at', { ascending: false });

  const rows = (data ?? []) as any[];
  const grouped = {
    active: rows.filter((r) => categorize(r) === 'active'),
    upcoming: rows.filter((r) => categorize(r) === 'upcoming'),
    inactive: rows.filter((r) => categorize(r) === 'inactive'),
    expired: rows.filter((r) => categorize(r) === 'expired'),
  };

  const canDelete = profile.admin_role === 'super_admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-red/15 flex items-center justify-center">
              <Crown className="w-5 h-5 text-airspeak-red" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Limited Offers</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {rows.length} offer · audience-targeted indirim kampanyaları
          </p>
        </div>
        <CreateOfferButton label="Yeni offer" />
      </div>

      {(['active', 'upcoming', 'inactive', 'expired'] as const).map((group) => {
        const list = grouped[group];
        if (list.length === 0) return null;
        const titleMap = {
          active: { label: 'Aktif (mobile\'da görünüyor)', color: 'text-emerald-700' },
          upcoming: { label: 'Yakında başlayacak', color: 'text-blue-700' },
          inactive: { label: 'Pasif (taslak)', color: 'text-muted-foreground' },
          expired: { label: 'Süresi dolmuş', color: 'text-airspeak-red' },
        };
        return (
          <section key={group}>
            <h2 className={`text-sm font-bold uppercase tracking-wide mb-2 ${titleMap[group].color}`}>
              {titleMap[group].label} ({list.length})
            </h2>
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-3"></th>
                    <th className="px-4 py-3 text-left font-semibold">Code · Başlık</th>
                    <th className="px-4 py-3 text-left font-semibold w-28">Audience</th>
                    <th className="px-4 py-3 text-left font-semibold">Pricing</th>
                    <th className="px-4 py-3 text-left font-semibold w-44">Window</th>
                    <th className="px-4 py-3 text-center font-semibold w-16">Pri.</th>
                    <th className="px-4 py-3 text-right font-semibold w-56">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                      <td className="px-2 py-3">
                        <div
                          className="w-2 h-10 rounded-sm"
                          style={{ backgroundColor: row.banner_color ?? '#E63946' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs text-muted-foreground">{row.code}</div>
                        <div className="font-semibold">{row.title_tr}</div>
                        {row.body_tr && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{row.body_tr}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-bold ${AUDIENCE_COLOR[row.audience] ?? ''}`}>
                          <Users className="w-3 h-3" />
                          {AUDIENCE_LABEL[row.audience] ?? row.audience}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Tag className="w-3 h-3 inline mr-1 text-muted-foreground" />
                        {formatPricing(row)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(row.starts_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        <br />
                        → {new Date(row.ends_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs">{row.priority}</td>
                      <td className="px-4 py-3">
                        <OfferRowActions row={row} canDelete={canDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {rows.length === 0 && (
        <div className="bg-white border border-border rounded-xl p-12 text-center text-muted-foreground">
          Henüz offer yok. <strong>Yeni offer</strong> ile başla.
        </div>
      )}

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">📋 Pricing logic</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Tier override (Aylık/Yıllık/Lifetime ₺) varsa onu kullanır.</li>
          <li>Override yoksa, varsa <strong>discount_percent</strong> default fiyata uygulanır.</li>
          <li>Hiçbiri yoksa default <code>paywall.*_price_try</code> kullanılır.</li>
          <li>Birden fazla aktif offer varsa <strong>priority</strong> yüksek olan gösterilir.</li>
          <li>Audience filter mobile'da uygulanır — kullanıcı segmentine uymayan offer hiç görünmez.</li>
        </ul>
      </section>
    </div>
  );
}
