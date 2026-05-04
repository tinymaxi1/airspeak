/**
 * /admin/glossary — Aviation glossary CRUD listesi.
 * Sprint 9.B
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { BookMarked } from 'lucide-react';
import { GlossaryRowActions } from '@/components/glossary/GlossaryRowActions';
import { CreateGlossaryButton } from '@/components/glossary/GlossaryForm';
import { GlossaryFilter } from '@/components/glossary/GlossaryFilter';
import { RegistryStatus } from '@/components/glossary/RegistryStatus';

const CAT_LABEL: Record<string, string> = {
  phraseology: 'Frazeoloji',
  aircraft_parts: 'Uçak Parçaları',
  aerodynamics: 'Aerodinamik',
  navigation: 'Seyrüsefer',
  meteorology: 'Meteoroloji',
  atc_communication: 'ATC İletişim',
  emergency: 'Acil Durum',
  flight_operations: 'Uçuş Operasyon',
  crew_resource_mgmt: 'CRM',
  maintenance: 'Bakım',
  cabin_service: 'Kabin Servisi',
  ground_operations: 'Yer Operasyonları',
  documentation: 'Dokümantasyon',
  regulations: 'Mevzuat',
  medical: 'Tıbbi',
  general: 'Genel',
};

const SOURCE_BADGE: Record<string, string> = {
  icao_doc: 'bg-emerald-100 text-emerald-700',
  admin_manual: 'bg-airspeak-navy/10 text-airspeak-navy',
  ai_generated: 'bg-amber-100 text-amber-700',
};

interface SearchParams {
  q?: string;
  category?: string;
  verified?: string;
}

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const profile = await requireAdminRole('reviewer');
  const sp = await searchParams;
  const supabase = createServiceClient();

  let query = (supabase as any)
    .from('aviation_glossary')
    .select('*')
    .order('frequency', { ascending: false })
    .order('term_en')
    .limit(500);

  if (sp.q) query = query.ilike('term_en', `%${sp.q}%`);
  if (sp.category) query = query.eq('category', sp.category);
  if (sp.verified === 'true') query = query.eq('is_verified', true);
  if (sp.verified === 'false') query = query.eq('is_verified', false);

  const { data } = await query;
  const rows = (data ?? []) as any[];

  const { count: totalCount } = await (supabase as any)
    .from('aviation_glossary')
    .select('id', { count: 'exact', head: true });
  const { count: verifiedCount } = await (supabase as any)
    .from('aviation_glossary')
    .select('id', { count: 'exact', head: true })
    .eq('is_verified', true);

  const canDelete = profile.admin_role === 'super_admin';
  const canEdit = profile.admin_role === 'editor' || profile.admin_role === 'super_admin';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-navy/10 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-airspeak-navy" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Aviation Glossary</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {totalCount ?? 0} terim · {verifiedCount ?? 0} doğrulanmış · 50K hedef
          </p>
        </div>
        {canEdit && <CreateGlossaryButton />}
      </div>

      {/* Sprint 11.B.7 — Registry status: ~/airspeak/glossary/term_registry.json
          ile DB count'unu kıyaslar, drift varsa uyarı verir. */}
      <RegistryStatus />

      <GlossaryFilter categories={CAT_LABEL} initial={sp} />

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Term · Kısaltma</th>
              <th className="px-4 py-3 text-left font-semibold">TR</th>
              <th className="px-4 py-3 text-left font-semibold w-40">Kategori</th>
              <th className="px-4 py-3 text-center font-semibold w-24">Kaynak</th>
              <th className="px-4 py-3 text-center font-semibold w-20">Doğr.</th>
              <th className="px-4 py-3 text-center font-semibold w-20">Sıklık</th>
              <th className="px-4 py-3 text-right font-semibold w-44">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-semibold">{row.term_en}</div>
                  {row.abbreviation && (
                    <div className="font-mono text-xs text-muted-foreground mt-0.5">
                      {row.abbreviation}
                    </div>
                  )}
                  {row.definition_en && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-md">
                      {row.definition_en}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{row.term_tr ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-block px-2 py-0.5 rounded bg-airspeak-navy/10 text-airspeak-navy">
                    {CAT_LABEL[row.category] ?? row.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded font-bold ${SOURCE_BADGE[row.source] ?? ''}`}
                  >
                    {row.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.is_verified ? '✓' : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-center font-mono text-xs">{row.frequency}</td>
                <td className="px-4 py-3">
                  <GlossaryRowActions row={row} canDelete={canDelete} canEdit={canEdit} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  {sp.q || sp.category
                    ? 'Filtreyle eşleşen terim yok.'
                    : 'Henüz terim yok. "Yeni terim" ile başla veya bulk import kullan.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">📚 Glossary kullanımı</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Çeviri Edge fn (Sprint 9.C) bu glossary'i system prompt'ta verir.</li>
          <li>ICAO standart frazeoloji (Mayday, Squawk) tüm dillerde EN kalır.</li>
          <li>Doğrulanmış terimler (✓) öncelikli — AI çeviri zorla bu term'i kullanır.</li>
          <li>Frequency yüksek terimler ICAO testlerde sık geçer; içerik üretiminde öncelik.</li>
        </ul>
      </section>
    </div>
  );
}
