import type { MetadataRoute } from "next";
import { getSitemapCategories } from "@/services/products";
import { siteUrl } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { isCategoryLikeBrand } from "@/lib/brand-utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getSitemapCategories();
  
  // Fetch brands that have at least one active product
  const rawBrands = await prisma.brand.findMany({
    where: {
      products: {
        some: { status: 'ACTIVE' }
      }
    },
    select: { slug: true, updatedAt: true }
  });

  // Filter out invalid/category-like brands
  const validBrands = rawBrands.filter(b => !isCategoryLikeBrand(b.slug));

  return [
    {
      url: siteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    ...categories.map((category) => ({
      url: siteUrl(`/category/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...validBrands.map((brand) => ({
      url: siteUrl(`/brand/${brand.slug}`),
      lastModified: brand.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7
    }))
  ];
}
