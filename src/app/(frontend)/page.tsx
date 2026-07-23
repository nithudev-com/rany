import { ProductCard } from "@/components/ProductCard";
import { getHomeProducts } from "@/services/products";
import { prisma } from "@/lib/prisma";
import { BrandMarquee } from "@/components/BrandMarquee";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CategoryCircles } from "@/components/CategoryCircles";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getHomeProducts();

  // --- ONE batched query for all review stats (replaces N+1 per-card DB calls) ---
  const productIds = (products || [])
    .map((p) => String(p.id.toString()))
    .filter(Boolean);

  const reviewStats = productIds.length > 0
    ? await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: productIds }, approved: true },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  // Map for O(1) lookup
  const reviewMap = new Map(
    reviewStats.map((r) => [
      r.productId.toString(),
      { avg: Number(r._avg.rating ?? 0), count: r._count.rating },
    ])
  );

  // Fetch remaining data in parallel
  const [brands, categories, circles] = await Promise.all([
    prisma.brand.findMany({
      where: { showOnHome: true },
      select: { id: true, name: true, slug: true, logo: true },
      orderBy: { name: "asc" },
      take: 20,
    }),
    prisma.category.findMany({
      where: { showOnHome: true },
      select: { id: true, name: true, slug: true, image: true, seoTitle: true },
      take: 16,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.categoryCircle.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const serializedBrands = brands.map((b) => ({ ...b, id: b.id.toString() }));
  const serializedCategories = categories.map((c) => ({ ...c, id: c.id.toString() }));
  const serializedCircles = circles.map((c) => ({ ...c, id: c.id.toString() }));

  return (
    <main>
      <HeroBanner />

      <CategoryGrid categories={serializedCategories} />

      <div className="container">
        <h2>Latest Products</h2>
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
      </div>
    </main>
  );
}
