import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { categoryJsonLd, siteUrl } from "@/lib/seo";
import { getFilteredProducts } from "@/services/products";
import { ProductFilters } from "@/components/ProductFilters";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getFilteredProducts({ slug, page: 1, limit: 1 });

  if (!category) return { title: "Category not found" };

  return {
    title: category.seoTitle || `${category.name} | Shop Online`,
    description: category.seoDescription || `Shop ${category.name} products online.`,
    alternates: { canonical: siteUrl(`/category/${category.slug}`) }
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string, minPrice?: string, maxPrice?: string, sort?: string, brand?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;

  const page = Number(query.page || 1);
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  const sort = query.sort;
  const brand = query.brand;

  const { category, products, total } = await getFilteredProducts({ slug, page, limit: 24, minPrice, maxPrice, sort, brandSlug: brand });

  if (!category) notFound();

  // Fetch subcategories and batch review stats in parallel
  const productIds = (products || []).map((p) => String(p.id.toString()));
  const [subcategories, reviewStats] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: category.id },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, image: true }
    }),
    productIds.length > 0
      ? prisma.review.groupBy({
          by: ['productId'],
          where: { productId: { in: productIds }, approved: true },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : Promise.resolve([]),
  ]);

  const reviewMap = new Map(
    reviewStats.map((r) => [
      r.productId.toString(),
      { avg: Number(r._avg.rating ?? 0), count: r._count.rating },
    ])
  );

  return (
    <main className="container">
      <style dangerouslySetInnerHTML={{ __html: `
        .category-showcase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .category-showcase-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        .category-showcase-image-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
        }
        .category-showcase-item:hover .category-showcase-image-wrapper {
          border-color: #facc15;
        }
        .category-showcase-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .category-showcase-title {
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
          color: #334155;
        }
        @media (min-width: 768px) {
          .category-showcase-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 24px;
          }
          .category-showcase-image-wrapper {
            width: 120px;
            height: 120px;
          }
          .category-showcase-title {
            font-size: 15px;
          }
        }
      ` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd(category)) }} />
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>{category.name}</h1>
        <p className="muted">{total} products found.</p>
      </div>

      {subcategories.length > 0 && (
        <div className="category-showcase-grid">
          {subcategories.map(subcat => (
            <Link key={subcat.id.toString()} href={`/category/${subcat.slug}`} className="category-showcase-item">
              <div className="category-showcase-image-wrapper">
                {subcat.image ? (
                  <img src={subcat.image} alt={subcat.name} className="category-showcase-image" />
                ) : (
                  <span style={{ fontSize: '24px', color: '#94a3b8' }}>{subcat.name.charAt(0)}</span>
                )}
              </div>
              <span className="category-showcase-title">{subcat.name}</span>
            </Link>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <ProductFilters />

        {/* Right Product Grid */}
        <div style={{ flexGrow: 1 }}>
          {products.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111111' }}>No products found</h3>
              <p style={{ color: '#64748b' }}>Try adjusting your filters or price range to see more results.</p>
            </div>
          ) : (
            <div className="grid">
              {(products || []).map((product) => {
                const id = product.id.toString();
                const stats = reviewMap.get(id);
                return (
                  <ProductCard
                    key={id}
                    id={id}
                    title={product.title}
                    slug={product.slug}
                    image={product.mainImage}
                    price={product.basePrice.toString()}
                    salePrice={product.salePrice?.toString()}
                    category={product.category?.name}
                    brand={product.brand?.name}
                    variantsCount={(product as any)._count?.variants || 0}
                    avgRating={stats?.avg ?? 0}
                    reviewCount={stats?.count ?? 0}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
