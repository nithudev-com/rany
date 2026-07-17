import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { siteUrl, cleanText } from "@/lib/seo";
import { getFilteredProducts } from "@/services/products";
import { isCategoryLikeBrand, normalizeBrandSlug } from "@/lib/brand-utils";
import { prisma } from "@/lib/prisma";
import { getDefaultCurrency } from "@/lib/money";
import { ProductFilters } from "@/components/ProductFilters";

export const revalidate = 1800;
export const dynamicParams = true;

// Helper to get store name safely
async function getStoreName() {
  try {
    const settings = await prisma.storeSettings.findFirst();
    return settings?.storeName || 'Premium Partners';
  } catch (e) {
    return 'Premium Partners';
  }
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string, sort?: string, minPrice?: string, maxPrice?: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const query = await searchParams;
    const normalizedSlug = normalizeBrandSlug(slug);

    if (isCategoryLikeBrand(normalizedSlug)) {
      return { title: "Category" }; // Will be handled by redirect in page
    }

    const { brand, products, total } = await getFilteredProducts({ brandSlug: normalizedSlug, page: 1, limit: 100 });

    if (!brand) return { title: "Brand not found" };

    const storeName = await getStoreName();
    const cleanBrandName = cleanText(brand.name);

    // Build dynamic title
    const metaTitle = `Shop ${cleanBrandName} Products Online | ${storeName}`;

    // Generate accurate fallback description
    const categoryNames = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));
    const topCategories = categoryNames.slice(0, 3).join(", ");
    
    let metaDesc = cleanText(brand.seoDescription);
    if (!metaDesc) {
      if (topCategories) {
        metaDesc = `Browse ${total} products from ${cleanBrandName}, including ${topCategories}. Compare available products, prices and product details before ordering from ${storeName}.`;
      } else {
        metaDesc = `Browse ${total} products from ${cleanBrandName}. Compare available products, prices and product details before ordering from ${storeName}.`;
      }
    }

    const pageNum = Number(query.page || 1);
    const brandUrl = siteUrl(`/brand/${brand.slug}`);
    const canonicalUrl = pageNum > 1 ? `${brandUrl}?page=${pageNum}` : brandUrl;

    // Apply noindex if it's a filtered/sorted URL
    const isFiltered = !!query.sort || !!query.minPrice || !!query.maxPrice;

    return {
      title: metaTitle,
      description: metaDesc,
      robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        url: canonicalUrl,
        siteName: storeName,
        images: brand.logo ? [{ url: brand.logo, width: 800, height: 600, alt: cleanBrandName }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDesc,
        images: brand.logo ? [brand.logo] : [],
      }
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return { title: "Brand" };
  }
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string, minPrice?: string, maxPrice?: string, sort?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  
  const normalizedSlug = normalizeBrandSlug(slug);

  // Validation: Category-like brand redirect
  if (isCategoryLikeBrand(normalizedSlug)) {
    const categoryExists = await prisma.category.findUnique({ where: { slug: normalizedSlug } });
    if (categoryExists) {
      redirect(`/category/${normalizedSlug}`);
    } else {
      notFound();
    }
  }

  const page = Number(query.page || 1);
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  const sort = query.sort;
  const limit = 24;

  const { brand, products, total } = await getFilteredProducts({ brandSlug: normalizedSlug, page, limit, minPrice, maxPrice, sort });

  if (!brand) notFound();

  // Check pagination validity
  const totalPages = Math.ceil(total / limit);
  if (page > 1 && page > totalPages && total > 0) {
    notFound();
  }

  const storeName = await getStoreName();
    const currency = await getDefaultCurrency();
    const currencyCode = currency?.code || 'GBP';
    const cleanBrandName = cleanText(brand.name);
    
    // Pagination helper function
    const buildPageUrl = (p: number) => {
      const params = new URLSearchParams();
      if (p > 1) params.set('page', p.toString());
      if (minPrice) params.set('minPrice', minPrice.toString());
      if (maxPrice) params.set('maxPrice', maxPrice.toString());
      if (sort) params.set('sort', sort);
      
      const str = params.toString();
      return `/brand/${brand.slug}${str ? `?${str}` : ''}`;
    };

    return (
      <main>
        {/* Breadcrumb */}
        <div style={{ background: '#f8fafc', padding: '12px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div className="container" style={{ padding: '0', display: 'flex', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
            <span>›</span>
            <Link href="/brand" style={{ textDecoration: 'none', color: '#64748b' }}>Brands</Link>
            <span>›</span>
            <span style={{ color: '#0f172a', fontWeight: '600' }}>{cleanBrandName}</span>
          </div>
        </div>

        {/* Brand Hero (Exactly one H1) */}
        <section className="brand-split-hero" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '40px 0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ maxWidth: '600px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Shop {cleanBrandName} Products
              </h1>
              {brand.seoDescription && (
                <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {cleanText(brand.seoDescription)}
                </p>
              )}
            </div>
            
            {brand.logo && (
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <img src={brand.logo} alt={`${cleanBrandName} logo`} style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
              </div>
            )}
          </div>
        </section>

        <div className="container" style={{ marginTop: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', color: '#0f172a' }}>
                {cleanBrandName} Products
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} products
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            
            {/* Filters Sidebar */}
            <div style={{ width: '280px', flexShrink: 0 }} className="desktop-filter-wrapper">
              <ProductFilters />
            </div>

            {/* Main Product Grid */}
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              {products.length === 0 ? (
                <div style={{ padding: '64px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111111' }}>No products found</h3>
                  <p style={{ color: '#64748b' }}>Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                <div className="grid">
                  {(products || []).map((product) => (
                    <ProductCard
                      variantsCount={(product as any)._count?.variants || 0}
                      key={product.id.toString()}
                      id={product.id.toString()}
                      title={cleanText(product.title)}
                      slug={product.slug}
                      image={product.mainImage}
                      price={product.basePrice.toString()}
                      salePrice={product.salePrice?.toString()}
                      category={product.category?.name}
                      brand={product.brand?.name}
                    />
                  ))}
                </div>
              )}

              {/* Server-Rendered Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                  {page > 1 ? (
                    <Link href={buildPageUrl(page - 1)} style={{ padding: '10px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', color: '#0f172a', textDecoration: 'none' }}>
                      Previous
                    </Link>
                  ) : (
                    <span style={{ padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#94a3b8', cursor: 'not-allowed' }}>
                      Previous
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: '600', color: '#475569' }}>
                    Page {page} of {totalPages}
                  </div>

                  {page < totalPages ? (
                    <Link href={buildPageUrl(page + 1)} style={{ padding: '10px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', color: '#0f172a', textDecoration: 'none' }}>
                      Next
                    </Link>
                  ) : (
                    <span style={{ padding: '10px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#94a3b8', cursor: 'not-allowed' }}>
                      Next
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Verified Brand FAQs */}
          {brand.faqs && Array.isArray(brand.faqs) && brand.faqs.length > 0 && (
            <div style={{ marginTop: '64px', borderTop: '1px solid #e2e8f0', paddingTop: '40px', paddingBottom: '64px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#0f172a' }}>
                Frequently Asked Questions about {cleanBrandName}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {brand.faqs.map((faq: any, index: number) => (
                  <details key={index} style={{ background: '#fff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <summary style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {cleanText(faq.question)}
                      <span style={{ fontSize: '20px', color: '#64748b' }}>+</span>
                    </summary>
                    <p style={{ marginTop: '16px', color: '#475569', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      {cleanText(faq.answer)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "CollectionPage",
                  "@id": siteUrl(`/brand/${brand.slug}`),
                  "name": `Shop ${cleanBrandName} Products`,
                  "description": cleanText(brand.seoDescription) || `Browse products from ${cleanBrandName}.`,
                  "url": siteUrl(`/brand/${brand.slug}`)
                },
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl("/") },
                    { "@type": "ListItem", "position": 2, "name": "Brands", "item": siteUrl("/brand") },
                    { "@type": "ListItem", "position": 3, "name": cleanBrandName, "item": siteUrl(`/brand/${brand.slug}`) }
                  ]
                },
                {
                  "@type": "ItemList",
                  "itemListElement": products.map((product, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": cleanText(product.title),
                    "url": siteUrl(`/product/${product.slug}`)
                  }))
                },
                // Only output genuine Brand schema
                {
                  "@type": "Brand",
                  "@id": siteUrl(`/brand/${brand.slug}#brand`),
                  "name": cleanBrandName,
                  "url": siteUrl(`/brand/${brand.slug}`),
                  ...(brand.logo ? { "logo": brand.logo } : {}),
                  ...(brand.seoDescription ? { "description": cleanText(brand.seoDescription) } : {})
                },
                // Only output genuine FAQs
                ...(brand.faqs && Array.isArray(brand.faqs) && brand.faqs.length > 0 ? [{
                  "@type": "FAQPage",
                  "@id": siteUrl(`/brand/${brand.slug}#faq`),
                  "mainEntity": brand.faqs.map((faq: any) => ({
                    "@type": "Question",
                    "name": cleanText(faq.question),
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": cleanText(faq.answer)
                    }
                  }))
                }] : [])
              ]
            })
          }}
        />
      </main>
    );
}
