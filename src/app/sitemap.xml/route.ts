import { NextResponse } from "next/server";
import { buildSitemapIndex, buildProductsSitemaps } from "@/lib/sitemap-builder";

export const dynamic = 'force-dynamic';


// GET /sitemap.xml  — returns the sitemap index
export async function GET() {
  try {
    const productSitemaps = await buildProductsSitemaps();
    const xml = await buildSitemapIndex(productSitemaps.length);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("[sitemap index] generation failed", err);
    return new NextResponse("<?xml version='1.0'?><error/>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
