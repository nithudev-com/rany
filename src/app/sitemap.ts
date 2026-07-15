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
  const validBrands = rawBrands.filter(b => !isCategoryLikeBrand(b.slug));

  // Fetch all active products (limit 40,000 to prevent timeout/size limits)
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 40000
  });

  // Fetch all published blog posts
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true }
  }).catch(() => []); // graceful fallback if blogpost model differs

  // Core Static Pages
  const staticPages = [
    { url: "/", priority: 1.0, changeFrequency: "daily" as const },
    { url: "/deals", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/new-releases", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/returns", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/login", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/register", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [
    ...staticPages.map(page => ({
      url: siteUrl(page.url),
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority
    })),
    ...categories.map((category) => ({
      url: siteUrl(`/category/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...validBrands.map((brand) => ({
      url: siteUrl(`/brand/${brand.slug}`),
      lastModified: brand.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...products.map((product) => ({
      url: siteUrl(`/product/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9
    })),
    ...blogs.map((blog) => ({
      url: siteUrl(`/blog/${blog.slug}`),
      lastModified: blog.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];

  return sitemapEntries;
}
