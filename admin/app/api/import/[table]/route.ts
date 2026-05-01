/**
 * Bulk import endpoint — POST /api/import/{table}
 *
 * Body: { rows: unknown[], dryRun?: boolean }
 * Yetki: super_admin (binlerce satır yıkıcı potansiyel)
 *
 * Akış:
 *   1. Auth + role check (super_admin)
 *   2. Table param whitelist
 *   3. Zod validation (per-row, hata listesi döner)
 *   4. Normalize (slug üretim, exercises'ta lesson resolve)
 *   5. dryRun=true ise burada dur, "valid: N" döndür
 *   6. Bulk insert (Supabase array, tek query)
 *   7. Audit özet log: log_admin_action('import', table, ...)
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireAdminRole } from '@/lib/auth/guard';
import { IMPORT_SCHEMAS, type ImportTable } from '@/lib/import/schemas';
import { normalizeRows, type RowError } from '@/lib/import/handlers';

const ALLOWED_TABLES = Object.keys(IMPORT_SCHEMAS) as ImportTable[];

interface SuccessResponse {
  ok: true;
  inserted: number;
  ids?: string[];
  dryRun?: boolean;
  validCount?: number;
}
interface ErrorResponse {
  ok: false;
  errors: RowError[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { table: string } },
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  // 1. Auth — super_admin
  await requireAdminRole('super_admin');

  // 2. Whitelist
  const table = params.table as ImportTable;
  if (!ALLOWED_TABLES.includes(table)) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: `Bilinmeyen tablo: ${params.table}` }] },
      { status: 400 },
    );
  }

  // 3. Body parse
  const body = (await req.json().catch(() => null)) as
    | { rows?: unknown; dryRun?: boolean }
    | null;
  if (!body || !Array.isArray(body.rows)) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'Body { rows: [] } olmalı' }] },
      { status: 400 },
    );
  }
  if (body.rows.length === 0) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: 'rows boş olamaz' }] },
      { status: 400 },
    );
  }
  if (body.rows.length > 5000) {
    return NextResponse.json(
      {
        ok: false,
        errors: [{ row: -1, message: 'Tek seferde max 5000 satır — dosyayı böl' }],
      },
      { status: 400 },
    );
  }

  // 4. Zod validation per row
  const schema = IMPORT_SCHEMAS[table] as z.ZodType<any>;
  const validated: any[] = [];
  const errors: RowError[] = [];
  body.rows.forEach((raw, idx) => {
    const r = schema.safeParse(raw);
    if (!r.success) {
      const issues = r.error.issues
        .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('; ');
      errors.push({ row: idx, message: 'Validation', detail: issues });
    } else {
      validated.push(r.data);
    }
  });
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // 5. Normalize (slug + lesson/vocab resolve)
  const supabase = await createClient();
  const normalized = await normalizeRows(table, validated, supabase as any);
  if (!normalized.ok) {
    return NextResponse.json({ ok: false, errors: normalized.errors }, { status: 422 });
  }

  // 6. Dry run kontrolü
  if (body.dryRun) {
    return NextResponse.json({
      ok: true,
      inserted: 0,
      dryRun: true,
      validCount: normalized.rows.length,
    });
  }

  // 7. Bulk insert
  const { data: inserted, error } = await (supabase as any)
    .from(table)
    .insert(normalized.rows)
    .select('id');

  if (error) {
    return NextResponse.json(
      { ok: false, errors: [{ row: -1, message: `DB insert hatası: ${error.message}` }] },
      { status: 500 },
    );
  }

  // 8. Audit özet log (bireysel trigger zaten her satırı logluyor)
  await (supabase as any).rpc('log_admin_action', {
    p_action: 'import',
    p_table_name: table,
    p_metadata: {
      count: (inserted ?? []).length,
      source: 'bulk_import',
    },
  });

  return NextResponse.json({
    ok: true,
    inserted: (inserted ?? []).length,
    ids: ((inserted ?? []) as { id: string }[]).map((r) => r.id),
  });
}
