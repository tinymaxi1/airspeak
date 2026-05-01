'use server';

/**
 * Aviation glossary admin server actions — Sprint 9.B
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { formatZodError } from '@/lib/validation';

const CATEGORIES = [
  'phraseology', 'aircraft_parts', 'aerodynamics', 'navigation',
  'meteorology', 'atc_communication', 'emergency', 'flight_operations',
  'crew_resource_mgmt', 'maintenance', 'cabin_service', 'ground_operations',
  'documentation', 'regulations', 'medical', 'general',
] as const;

const SOURCES = ['icao_doc', 'admin_manual', 'ai_generated'] as const;

export const glossarySchema = z.object({
  term_en: z.string().min(1).max(120),
  term_tr: z.string().max(120).nullable().optional(),
  category: z.enum(CATEGORIES),
  abbreviation: z.string().max(32).nullable().optional(),
  definition_en: z.string().max(2000).nullable().optional(),
  definition_tr: z.string().max(2000).nullable().optional(),
  example_usage: z.string().max(500).nullable().optional(),
  icao_reference: z.string().max(120).nullable().optional(),
  source: z.enum(SOURCES).optional(),
  is_verified: z.boolean().optional(),
  frequency: z.number().int().min(0).max(999999).optional(),
});

export type GlossaryPayload = z.infer<typeof glossarySchema>;

export async function createGlossaryTerm(
  payload: GlossaryPayload,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const parsed = glossarySchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) };

  const { data, error } = await (supabase as any)
    .from('aviation_glossary')
    .insert(parsed.data)
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'create',
    table_name: 'aviation_glossary',
    row_id: (data as any).id,
    metadata: { term_en: parsed.data.term_en },
  });

  revalidatePath('/glossary');
  return { ok: true, id: (data as any).id };
}

export async function updateGlossaryTerm(
  id: string,
  patch: Partial<GlossaryPayload>,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdminRole('editor');
  const supabase = createServiceClient();

  const parsed = glossarySchema.partial().safeParse(patch);
  if (!parsed.success) return { ok: false, error: formatZodError(parsed.error) };

  const { error } = await (supabase as any)
    .from('aviation_glossary')
    .update(parsed.data)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'update',
    table_name: 'aviation_glossary',
    row_id: id,
    metadata: parsed.data,
  });

  revalidatePath('/glossary');
  return { ok: true };
}

export async function deleteGlossaryTerm(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireAdminRole('super_admin');
  const supabase = createServiceClient();

  const { error } = await (supabase as any)
    .from('aviation_glossary')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  await (supabase as any).from('admin_actions').insert({
    actor_id: profile.id,
    action: 'delete',
    table_name: 'aviation_glossary',
    row_id: id,
  });

  revalidatePath('/glossary');
  return { ok: true };
}

export async function setGlossaryVerified(
  id: string,
  verified: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdminRole('editor');
  const supabase = createServiceClient();
  const { error } = await (supabase as any)
    .from('aviation_glossary')
    .update({ is_verified: verified })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/glossary');
  return { ok: true };
}
