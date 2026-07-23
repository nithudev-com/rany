import { NextResponse } from "next/server";
import {

export const dynamic = 'force-dynamic';
  buildProductsSitemaps,
  buildCategoriesSitemap,
  buildBrandsSitemap,
  buildPagesSitemap,
  buildBlogSitemap,
  buildImagesSitemap,
  buildSitemapIndex,
} from "@/lib/sitemap-builder";


// In-memory stats store (resets on cold start – fine for admin use)
// For persistent stats, a DB table would be used.
const statsCache: Record<string, { count: number; size: number; generatedAt: string; ok: boolean; error?: string }> = {};

async function measureSitemap(
  name: string,
  builder: () => Promise<{ xml: string; count: number }>
) {
  try {
    const { xml, count } = await builder();
    const size = Buffer.byteLength(xml, "utf8");
    statsCache[name] = {
      count,
      size,
      generatedAt: new Date().toISOString(),
      ok: true,
    };
    return { name, count, size, ok: true };
  } catch (err: any) {
    statsCache[name] = {
      count: 0,
      size: 0,
      generatedAt: new Date().toISOString(),
      ok: false,
      error: err.message,
    };
    return { name, count: 0, size: 0, ok: false, error: err.message };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  // ---------- STATUS / STATS ----------
  if (!action || action === "stats") {
    const productSitemaps = await buildProductsSitemaps().catch(() => [] as { page: number; count: number; xml: string }[]);

    const rows = [];

    for (const ps of productSitemaps) {
      const name =
        productSitemaps.length === 1 ? "products.xml" : `products-${ps.page}.xml`;
      rows.push({
        name,
        url: `https://rany.uk/sitemaps/${name}`,
        count: ps.count,
        size: Buffer.byteLength(ps.xml, "utf8"),
        ok: true,
        generatedAt: new Date().toISOString(),
      });
    }

    const singles: [string, () => Promise<{ xml: string; count: number }>][] = [
      ["categories.xml", buildCategoriesSitemap],
      ["brands.xml", buildBrandsSitemap],
      ["pages.xml", buildPagesSitemap],
      ["blog.xml", buildBlogSitemap],
      ["images.xml", buildImagesSitemap],
    ];

    for (const [name, builder] of singles) {
      const r = await measureSitemap(name, builder);
      rows.push({ ...r, url: `https://rany.uk/sitemaps/${name}`, generatedAt: statsCache[name]?.generatedAt });
    }

    return NextResponse.json({
      index: "https://rany.uk/sitemap.xml",
      productPages: productSitemaps.length,
      sitemaps: rows,
    });
  }

  // ---------- VALIDATE ----------
  if (action === "validate") {
    const sitemapName = searchParams.get("name");
    const siteBase = "https://rany.uk";

    async function validateXml(xml: string, name: string) {
      const errors: string[] = [];
      if (!xml.includes('<?xml version="1.0"')) errors.push("Missing XML declaration");
      if (!xml.includes("<urlset") && !xml.includes("<sitemapindex"))
        errors.push("Invalid root element");

      const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      const seen = new Set<string>();
      for (const loc of locs) {
        if (!loc.startsWith("https://")) errors.push(`Non-HTTPS URL: ${loc}`);
        if (!loc.startsWith(siteBase)) errors.push(`External URL: ${loc}`);
        if (seen.has(loc)) errors.push(`Duplicate URL: ${loc}`);
        seen.add(loc);
      }

      return { name, urlCount: locs.length, errors, ok: errors.length === 0 };
    }

    const results = [];

    if (!sitemapName || sitemapName === "products.xml") {
      const sitemaps = await buildProductsSitemaps().catch(() => []);
      for (const s of sitemaps) {
        const name = sitemaps.length === 1 ? "products.xml" : `products-${s.page}.xml`;
        results.push(await validateXml(s.xml, name));
      }
    }

    const singles: [string, () => Promise<{ xml: string; count: number }>][] = [
      ["categories.xml", buildCategoriesSitemap],
      ["brands.xml", buildBrandsSitemap],
      ["pages.xml", buildPagesSitemap],
      ["blog.xml", buildBlogSitemap],
      ["images.xml", buildImagesSitemap],
    ];

    for (const [name, builder] of singles) {
      if (!sitemapName || sitemapName === name) {
        const { xml } = await builder().catch(() => ({ xml: "", count: 0 }));
        results.push(await validateXml(xml, name));
      }
    }

    return NextResponse.json({ validated: results });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// ---------- POST: regenerate / submit to GSC ----------
export async function POST(req: Request) {
  const { action, name, gscKey } = await req.json().catch(() => ({}));

  if (action === "submit-gsc") {
    // Submit sitemap to Google Search Console via ping URL (no API key needed)
    const sitemapUrl = encodeURIComponent("https://rany.uk/sitemap.xml");
    const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
    try {
      const res = await fetch(pingUrl, { method: "GET" });
      return NextResponse.json({
        ok: res.ok,
        status: res.status,
        submittedAt: new Date().toISOString(),
        message: res.ok
          ? "Sitemap submitted to Google. It may take a few days to process."
          : "Submission request sent (status may be non-200 in some environments).",
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
  }

  if (action === "regenerate") {
    // Validate that we can reach the sitemap URL via internal call
    try {
      // just rebuild stats for the affected sitemap
      const results: any[] = [];

      if (!name || name.includes("products")) {
        const ps = await buildProductsSitemaps();
        for (const s of ps) {
          const n = ps.length === 1 ? "products.xml" : `products-${s.page}.xml`;
          results.push({ name: n, count: s.count, size: Buffer.byteLength(s.xml, "utf8"), ok: true });
        }
      }

      const map: Record<string, () => Promise<{ xml: string; count: number }>> = {
        "categories.xml": buildCategoriesSitemap,
        "brands.xml": buildBrandsSitemap,
        "pages.xml": buildPagesSitemap,
        "blog.xml": buildBlogSitemap,
        "images.xml": buildImagesSitemap,
      };

      for (const [n, builder] of Object.entries(map)) {
        if (!name || name === n) {
          const r = await measureSitemap(n, builder);
          results.push(r);
        }
      }

      return NextResponse.json({ ok: true, regenerated: results, at: new Date().toISOString() });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
