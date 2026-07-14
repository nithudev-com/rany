'use client';

export const shopifyLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (src.includes('cdn.shopify.com')) {
    try {
      const url = new URL(src);
      url.searchParams.set('width', width.toString());
      if (quality) url.searchParams.set('q', quality.toString());
      return url.toString();
    } catch (e) {
      return src;
    }
  }
  return src;
};
