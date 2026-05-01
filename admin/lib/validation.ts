/**
 * Shared Zod schemas for admin server actions.
 * Sprint 7.D
 */
import { z } from 'zod';

// ─── Notifications ─────────────────────────────────────────────────────────
export const broadcastSchema = z.object({
  audience: z
    .string()
    .min(1)
    .max(64)
    .regex(/^(all|free|premium|role:[a-z_]+|level:[A-C][12])$/, 'Geçersiz audience'),
  title: z.string().min(1, 'Başlık zorunlu').max(64, 'Başlık 64 karakteri geçemez'),
  body: z.string().min(1, 'Mesaj zorunlu').max(240, 'Mesaj 240 karakteri geçemez'),
  kind: z.string().max(64).optional(),
  url: z.string().url().max(512).optional(),
});

// ─── Offers ────────────────────────────────────────────────────────────────
export const offerSchema = z
  .object({
    code: z
      .string()
      .min(2)
      .max(40)
      .regex(/^[a-z0-9_-]+$/, 'code: küçük harf, rakam, _ ya da -'),
    title_tr: z.string().min(1).max(80),
    title_en: z.string().max(80).nullable().optional(),
    body_tr: z.string().min(1).max(280),
    body_en: z.string().max(280).nullable().optional(),
    monthly_price_try: z.number().int().min(0).max(99999).nullable().optional(),
    yearly_price_try: z.number().int().min(0).max(999999).nullable().optional(),
    lifetime_price_try: z.number().int().min(0).max(999999).nullable().optional(),
    discount_percent: z.number().int().min(1).max(90).nullable().optional(),
    starts_at: z.string().datetime(),
    ends_at: z.string().datetime(),
    is_active: z.boolean().optional(),
    banner_color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'banner_color hex (#RRGGBB)')
      .nullable()
      .optional(),
    push_title_tr: z.string().max(64).nullable().optional(),
    push_body_tr: z.string().max(240).nullable().optional(),
    audience: z.enum(['all', 'free', 'trial_used', 'expired_trial', 'active_premium', 'inactive_7d']),
    priority: z.number().int().min(0).max(100).optional(),
  })
  .refine((p) => new Date(p.ends_at) > new Date(p.starts_at), {
    message: 'ends_at, starts_at sonrası olmalı',
    path: ['ends_at'],
  })
  .refine(
    (p) =>
      p.monthly_price_try != null ||
      p.yearly_price_try != null ||
      p.lifetime_price_try != null ||
      p.discount_percent != null,
    { message: 'En az bir tier override veya discount_percent', path: ['discount_percent'] },
  );

// ─── Banned Words ──────────────────────────────────────────────────────────
export const bannedWordSchema = z.object({
  word: z
    .string()
    .min(2, 'word: en az 2 karakter')
    .max(80, 'word: en fazla 80 karakter')
    .transform((v) => v.trim().toLowerCase()),
  severity: z.enum(['warn', 'block']),
  category: z.enum(['profanity', 'spam', 'hate', 'pii', 'other']),
});

// ─── Helper ────────────────────────────────────────────────────────────────
export function formatZodError(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.join('.') || 'input'}: ${i.message}`)
    .join('; ');
}
