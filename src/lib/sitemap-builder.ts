import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";
import { isCategoryLikeBrand } from "@/lib/brand-utils";

const URLS_PER_SITEMAP = 45000;
const BASE = "https://rany.uk";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return new Date().toISOString().split("T")[0];
  return new Date(d).toISOString().split("T")[0];
}

function urlEntry(loc: string, lastmod?: string | null, priority?: number, changefreq?: string): string {
  const safeLoc = escapeXml(loc.startsWith("http") ? loc : `${BASE}${loc}`);
  return `  <url>
    <loc>${safeLoc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}${changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""}${priority != null ? `\n    <priority>${priority.toFixed(1)}</priority>` : ""}
  </url>`;
}

function wrapUrlset(entries: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
}

function wrapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
  const entries = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${escapeXml(s.loc)}</loc>${s.lastmod ? `\n    <lastmod>${s.lastmod}</lastmod>` : ""}
  </sitemap>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

// -----------------------------------------------------------
// PRODUCTS
// -----------------------------------------------------------
export async function buildProductsSitemaps(): Promise<
  { xml: string; page: number; count: number }[]
> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const chunks: typeof products[] = [];
  for (let i = 0; i < products.length; i += URLS_PER_SITEMAP) {
    chunks.push(products.slice(i, i + URLS_PER_SITEMAP));
  }

  return chunks.map((chunk, idx) => ({
    page: idx + 1,
    count: chunk.length,
    xml: wrapUrlset(
      chunk.map((p) =>
        urlEntry(siteUrl(`/product/${p.slug}`), formatDate(p.updatedAt), 0.9, "weekly")
      )
    ),
  }));
}

// -----------------------------------------------------------
// CATEGORIES
// -----------------------------------------------------------
export async function buildCategoriesSitemap(): Promise<{ xml: string; count: number }> {
  const categories = await prisma.category.findMany({
    where: {
      products: { some: { status: "ACTIVE" } },
    },
    select: { slug: true, updatedAt: true },
  });

  const entries = categories.map((c) =>
    urlEntry(siteUrl(`/category/${c.slug}`), formatDate(c.updatedAt), 0.8, "daily")
  );
  return { xml: wrapUrlset(entries), count: entries.length };
}

// -----------------------------------------------------------
// BRANDS
// -----------------------------------------------------------
export async function buildBrandsSitemap(): Promise<{ xml: string; count: number }> {
  const brands = await prisma.brand.findMany({
    where: { products: { some: { status: "ACTIVE" } } },
    select: { slug: true, updatedAt: true },
  });
  const validBrands = brands.filter((b) => !isCategoryLikeBrand(b.slug));
  const entries = validBrands.map((b) =>
    urlEntry(siteUrl(`/brand/${b.slug}`), formatDate(b.updatedAt), 0.7, "weekly")
  );
  return { xml: wrapUrlset(entries), count: entries.length };
}

// -----------------------------------------------------------
// STATIC PAGES
// -----------------------------------------------------------
export async function buildPagesSitemap(): Promise<{ xml: string; count: number }> {
  const pages = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    { path: "/deals", priority: 0.9, changefreq: "daily" },
    { path: "/new-releases", priority: 0.9, changefreq: "daily" },
    { path: "/contact", priority: 0.5, changefreq: "monthly" },
    { path: "/returns", priority: 0.5, changefreq: "monthly" },
    { path: "/about", priority: 0.5, changefreq: "monthly" },
    { path: "/shipping", priority: 0.5, changefreq: "monthly" },
    { path: "/privacy-policy", priority: 0.4, changefreq: "yearly" },
    { path: "/terms", priority: 0.4, changefreq: "yearly" },
    { path: "/faq", priority: 0.6, changefreq: "monthly" },
    { path: "/blog", priority: 0.7, changefreq: "daily" },
  ];
  const entries = pages.map((p) => urlEntry(siteUrl(p.path), null, p.priority, p.changefreq));
  return { xml: wrapUrlset(entries), count: entries.length };
}

// -----------------------------------------------------------
// BLOG
// -----------------------------------------------------------
export async function buildBlogSitemap(): Promise<{ xml: string; count: number }> {
  const posts = await prisma.blogPost
    .findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
    .catch(() => [] as { slug: string; updatedAt: Date }[]);

  const entries = posts.map((p) =>
    urlEntry(siteUrl(`/blog/${p.slug}`), formatDate(p.updatedAt), 0.7, "weekly")
  );
  return { xml: wrapUrlset(entries), count: entries.length };
}

// -----------------------------------------------------------
// IMAGES
// -----------------------------------------------------------
export async function buildImagesSitemap(): Promise<{ xml: string; count: number }> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", mainImage: { not: null } },
    select: {
      slug: true,
      title: true,
      mainImage: true,
      images: {
        select: { imageUrl: true, altText: true },
        orderBy: { sortOrder: "asc" },
        take: 10,
      },
    },
    take: 20000,
  });

  const entries = products.map((p) => {
    const allImages = [
      p.mainImage ? { imageUrl: p.mainImage, altText: p.title } : null,
      ...p.images.filter((img) => img.imageUrl !== p.mainImage),
    ].filter(Boolean) as { imageUrl: string; altText: string | null }[];

    const imageXml = allImages
      .slice(0, 10)
      .map(
        (img) =>
          `    <image:image>\n      <image:loc>${escapeXml(img.imageUrl)}</image:loc>${img.altText ? `\n      <image:title>${escapeXml(img.altText)}</image:title>` : ""}\n    </image:image>`
      )
      .join("\n");

    return `  <url>\n    <loc>${escapeXml(siteUrl(`/product/${p.slug}`))}</loc>\n${imageXml}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>`;

  return { xml, count: entries.length };
}

// -----------------------------------------------------------
// SITEMAP INDEX
// -----------------------------------------------------------
export async function buildSitemapIndex(productPageCount: number): Promise<string> {
  const now = formatDate(new Date());
  const sitemaps: { loc: string; lastmod?: string }[] = [];

  for (let i = 1; i <= Math.max(productPageCount, 1); i++) {
    sitemaps.push({
      loc: siteUrl(`/sitemaps/products${productPageCount > 1 ? `-${i}` : ""}.xml`),
      lastmod: now,
    });
  }

  sitemaps.push(
    { loc: siteUrl("/sitemaps/categories.xml"), lastmod: now },
    { loc: siteUrl("/sitemaps/brands.xml"), lastmod: now },
    { loc: siteUrl("/sitemaps/pages.xml"), lastmod: now },
    { loc: siteUrl("/sitemaps/blog.xml"), lastmod: now },
    { loc: siteUrl("/sitemaps/images.xml"), lastmod: now }
  );

  return wrapIndex(sitemaps);
}
