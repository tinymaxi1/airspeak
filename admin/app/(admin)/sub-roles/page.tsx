/**
 * /admin/sub-roles — Alt-rol yönetimi.
 * FAZ 2 — sub_roles CRUD + drag-drop reorder + 20-dil i18n editor.
 *
 * Kullanım:
 *  - Parent role tab'ları (Pilot/ATC/Cabin/...) — URL param ?parent=pilot
 *  - + Yeni alt-rol butonu (üst sağ)
 *  - Drag-drop ile display_order güncelleme (aynı parent içinde)
 *  - Edit drawer 20 dil tabbed (TR/EN zorunlu)
 *  - Toggle active + Delete (super_admin only)
 */
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { Layers } from 'lucide-react';
import { CreateSubRoleButton } from '@/components/sub-roles/SubRoleForm';
import { SubRolesTable } from '@/components/sub-roles/SubRolesTable';

export default async function SubRolesPage() {
  const profile = await requireAdminRole('reviewer');
  const supabase = createServiceClient();

  const { data } = await (supabase as any)
    .from('sub_roles')
    .select('id, parent_role, display_order, active, icon, names, descriptions')
    .order('parent_role', { ascending: true })
    .order('display_order', { ascending: true });

  const rows = (data ?? []) as any[];

  const canDelete = profile.admin_role === 'super_admin';
  const canEdit = profile.admin_role === 'editor' || profile.admin_role === 'super_admin';

  // Stat counts by parent
  const byParent: Record<string, number> = {};
  for (const r of rows) {
    byParent[r.parent_role] = (byParent[r.parent_role] ?? 0) + 1;
  }
  const activeCount = rows.filter((r) => r.active).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-airspeak-red/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-airspeak-red" />
            </div>
            <h1 className="text-3xl font-bold text-airspeak-navy">Alt-Roller</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {rows.length} kayıt · {activeCount} aktif · 7 parent rol
          </p>
        </div>
        {canEdit && <CreateSubRoleButton />}
      </div>

      <SubRolesTable rows={rows} canEdit={canEdit} canDelete={canDelete} />

      <section className="bg-airspeak-gold/10 border border-airspeak-gold/40 rounded-xl p-5 text-sm space-y-2">
        <p className="font-semibold">💡 Alt-rol sistemi nasıl çalışır?</p>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>
            Onboarding'de kullanıcı önce parent role (Pilot/ATC/...) seçer, sonra alt-rol
            (A320 Pilot, B737-800 Pilot vb.) seçeneği gelir. <strong>Opsiyonel</strong>.
          </li>
          <li>
            Word of the Day, scenarios, vocab_terms gibi içeriklere{' '}
            <code className="text-xs">target_sub_roles</code> array'iyle hedef alt-roller atanır.
            Boş = parent role içeren tüm alt-rollere açık.
          </li>
          <li>
            Sürükle-bırak ile display_order değiştirebilirsin (aynı parent içinde).
          </li>
          <li>
            <strong>Pasif</strong> alt-roller onboarding'de görünmez ama silinmez. İçerik filter'ında
            da yok sayılır.
          </li>
          <li>
            Silme: super_admin only. CASCADE NULL — bu alt-rolü seçmiş kullanıcılar parent role'a
            geri döner (sub_role NULL).
          </li>
          <li>
            <strong>20 dil</strong> destekli isim/açıklama. TR + EN zorunlu, diğer 18 dil opsiyonel
            (admin tarafından sonradan eklenebilir).
          </li>
        </ul>
      </section>
    </div>
  );
}
