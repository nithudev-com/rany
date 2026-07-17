import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getFilteredProducts } from "@/services/products";
import { ProductFilters } from "@/components/ProductFilters";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SearchHeader } from "./SearchHeader"; // We'll create this client component

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const query = await searchParams;
  const q = query.q || "";
  return {
    title: `Search results for "${q}" | Rany.uk`,
    description: `Shop products matching ${q} online.`
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, minPrice?: string, maxPrice?: string, sort?: string, category?: string, brand?: string }> }) {
  const query = await searchParams;
  const searchKeyword = query.q || "";
  const activeCategory = query.category || "all";
  
  const page = Number(query.page || 1);
  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  const sort = query.sort;
  const brand = query.brand;

  let currentCategory = null;
  if (activeCategory !== 'all') {
    currentCategory = await prisma.category.findUnique({
      where: { slug: activeCategory }
    });
  }

  const topLevelCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  let subCategories: any[] = [];
  if (currentCategory) {
    subCategories = await prisma.category.findMany({
      where: { parentId: currentCategory.id },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
    });
    if (subCategories.length === 0 && currentCategory.parentId) {
      subCategories = await prisma.category.findMany({
        where: { parentId: currentCategory.parentId },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      });
    }
  }

  const { products, total } = await getFilteredProducts({ 
    search: searchKeyword, 
    slug: currentCategory?.slug, 
    page, 
    limit: 24, 
    minPrice, 
    maxPrice, 
    sort, 
    brandSlug: brand 
  });

  return (
    <main className="shop-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .shop-page-wrapper {
          background: #ffffff;
          min-height: 100vh;
          padding-bottom: 80px; /* Space for bottom nav */
        }
        .shop-mobile-container {
          padding: 16px;
        }
        .category-scroll-container {
          display: flex;
          overflow-x: auto;
          gap: 12px;
          padding: 0 16px 16px 16px;
          margin-bottom: 16px;
          scrollbar-width: none; /* Firefox */
        }
        .category-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .category-pill {
          white-space: nowrap;
          padding: 10px 20px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          background: #f8fafc;
          text-decoration: none;
          transition: 0.2s ease;
        }
        .category-pill.active {
          background: #FBBF24; /* Bright warm yellow */
          color: #000000;
        }
        .shop-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 0 16px;
        }
        @media (min-width: 768px) {
          .shop-product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            padding: 0;
          }
          .shop-mobile-container {
            padding: 32px 0;
          }
          .category-scroll-container {
            padding: 0 0 24px 0;
            flex-wrap: wrap;
          }
        }
        @media (max-width: 768px) {
          .shop-mobile-container { padding: 0 16px; }
          .grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px; }
        }
        @media (min-width: 1024px) {
          .shop-product-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}} />

      <SearchHeader initialQuery={searchKeyword} />

      <div className="category-scroll-container">
        <Link href="/search" className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}>
          All Products
        </Link>
        {topLevelCategories.map(cat => (
          <Link key={cat.id.toString()} href={`/search?category=${cat.slug}`} className={`category-pill ${activeCategory === cat.slug || currentCategory?.parentId === cat.id ? 'active' : ''}`}>
            {cat.name}
          </Link>
        ))}
      </div>

      {subCategories.length > 0 && (
        <div className="category-scroll-container" style={{ paddingTop: '0', marginTop: '-8px' }}>
          {subCategories.map(cat => (
            <Link key={cat.id.toString()} href={`/search?category=${cat.slug}`} className={`category-pill ${activeCategory === cat.slug ? 'active' : ''}`} style={{ fontSize: '12px', padding: '6px 14px', background: activeCategory === cat.slug ? '#0f172a' : '#f1f5f9', color: activeCategory === cat.slug ? '#fff' : '#475569' }}>
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <div className="container shop-mobile-container">
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          <ProductFilters />

          {/* Right Product Grid */}
          <div style={{ flexGrow: 1 }}>
            {products.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111111' }}>No matches found</h3>
                <p style={{ color: '#64748b' }}>Try adjusting your search keyword or filters to see more results.</p>
              </div>
            ) : (
              <div className="shop-product-grid">
                {await Promise.all((products || []).map(async (product) => (
                  <ProductCard
                    variantsCount={(product as any)._count?.variants || 0}
                    key={product.id.toString()}
                    id={product.id.toString()}
                    title={product.title}
                    slug={product.slug}
                    image={product.mainImage}
                    price={product.basePrice.toString()}
                    salePrice={product.salePrice?.toString()}
                    category={product.category?.name}
                    brand={product.brand?.name}
                  />
                )))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
