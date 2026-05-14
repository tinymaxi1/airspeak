'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { revalidatePath } from 'next/cache';

export interface ChangeItem {
  emoji: string;
  title: string;
  description: string;
}

export interface CreateReleaseInput {
  version: string;
  released_at?: string;
  changes_tr: ChangeItem[];
  changes_en: ChangeItem[];
  mandatory: boolean;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+)?$/;

export async function createRelease(input: CreateReleaseInput): Promise<ActionResult> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  if (!SEMVER_RE.test(input.version)) {
    return { ok: false, error: 'Geçersiz semver. Örnek: 1.0.0 veya 1.0.0-beta' };
  }
  if (!Array.isArray(input.changes_tr) || input.changes_tr.length === 0) {
    return { ok: false, error: 'En az 1 TR yenilik maddesi ekle' };
  }
  if (!Array.isArray(input.changes_en) || input.changes_en.length === 0) {
    return { ok: false, error: 'En az 1 EN yenilik maddesi ekle' };
  }
  // Her madde geçerli emoji + title + description
  for (const c of [...input.changes_tr, ...input.changes_en]) {
    if (!c.emoji || !c.title || !c.description) {
      return { ok: false, error: 'Her maddede emoji + başlık + açıklama olmalı' };
    }
  }

  const { data, error } = await (supabase as any)
    .from('app_releases')
    .insert({
      version: input.version,
      released_at: input.released_at ?? new Date().toISOString(),
      changes_tr: input.changes_tr,
      changes_en: input.changes_en,
      mandatory: input.mandatory,
      created_by: profile.id,
    })
    .select('id')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/app-releases');
  return { ok: true, id: data.id };
}

export async function deleteRelease(id: string): Promise<ActionResult> {
  await requireAdminRole('super_admin');
  const supabase = createServiceClient();
  const { error } = await (supabase as any).from('app_releases').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/app-releases');
  return { ok: true };
}

export async function resendBroadcast(id: string): Promise<ActionResult> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  // push_sent_at NULL'a çek + trigger tekrar tetiklenir
  // (UPDATE trigger yok, manuel edge function çağırmak gerek)
  await (supabase as any).from('app_releases').update({ push_sent_at: null }).eq('id', id);

  // Direkt edge function çağır
  const url = process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  try {
    await fetch(`${url}/functions/v1/release-broadcast`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ release_id: id }),
    });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath('/admin/app-releases');
  return { ok: true };
}
