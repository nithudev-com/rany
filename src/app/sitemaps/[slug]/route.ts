import { NextResponse } from "next/server";
import {

export const dynamic = 'force-dynamic';
  buildProductsSitemaps,
  buildCategoriesSitemap,
  buildBrandsSitemap,
  buildPagesSitemap,
  buildBlogSitemap,
  buildImagesSitemap,
} from "@/lib/sitemap-builder";


function xmlResponse(xml: string) {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}

function notFound() {
  return new NextResponse(
    "<?xml version='1.0' encoding='UTF-8'?><error>Sitemap not found</error>",
    { status: 404, headers: { "Content-Type": "application/xml" } }
  );
}

/**
 * GET /sitemaps/[slug]
 *
 * Handles:
 *   products.xml      → single-page product sitemap
 *   products-1.xml    → paginated product sitemap page 1
 *   categories.xml
 *   brands.xml
 *   pages.xml
 *   blog.xml
 *   images.xml
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Products — paginated or single
    if (slug === "products.xml") {
      const sitemaps = await buildProductsSitemaps();
      if (!sitemaps.length) {
        return xmlResponse(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
        );
      }
      return xmlResponse(sitemaps[0].xml);
    }

    const productPageMatch = slug.match(/^products-(\d+)\.xml$/);
    if (productPageMatch) {
      const page = parseInt(productPageMatch[1], 10);
      const sitemaps = await buildProductsSitemaps();
      const found = sitemaps.find((s) => s.page === page);
      if (!found) return notFound();
      return xmlResponse(found.xml);
    }

    if (slug === "categories.xml") {
      const { xml } = await buildCategoriesSitemap();
      return xmlResponse(xml);
    }

    if (slug === "brands.xml") {
      const { xml } = await buildBrandsSitemap();
      return xmlResponse(xml);
    }

    if (slug === "pages.xml") {
      const { xml } = await buildPagesSitemap();
      return xmlResponse(xml);
    }

    if (slug === "blog.xml") {
      const { xml } = await buildBlogSitemap();
      return xmlResponse(xml);
    }

    if (slug === "images.xml") {
      const { xml } = await buildImagesSitemap();
      return xmlResponse(xml);
    }

    return notFound();
  } catch (err) {
    console.error(`[sitemap/${slug}] generation failed`, err);
    return new NextResponse(
      "<?xml version='1.0'?><error>Internal server error</error>",
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
