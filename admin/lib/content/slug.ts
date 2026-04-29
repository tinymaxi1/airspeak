/**
 * Türkçe karakter destekli slug üretici.
 */
export function makeSlug(input: string, prefix = ''): string {
  const base = input
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return prefix ? `${prefix}_${base}` : base;
}

/**
 * Slug benzersizliği yoksa rastgele suffix ekler.
 */
export function uniqueSlug(input: string, prefix = ''): string {
  const slug = makeSlug(input, prefix);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug}-${suffix}`;
}
