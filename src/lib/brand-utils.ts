const INVALID_BRAND_SLUGS = [
  'accessories',
  'miscellaneous',
  'unknown',
  'generic',
  'unbranded',
  'other',
  'sale',
  'new-products',
];

export function isCategoryLikeBrand(slug: string): boolean {
  if (!slug) return false;
  
  // Normalize checking
  const normalizedSlug = slug.toLowerCase().trim();
  
  return INVALID_BRAND_SLUGS.includes(normalizedSlug);
}

export function normalizeBrandSlug(slug: string): string {
  // e.g. "LELO ", "Lelo" -> "lelo"
  return slug.toLowerCase().trim().replace(/\s+/g, '-');
}
