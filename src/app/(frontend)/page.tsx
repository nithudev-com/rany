import { ProductCard } from "@/components/ProductCard";
import { getHomeProducts } from "@/services/products";
import { prisma } from "@/lib/prisma";
import { BrandMarquee } from "@/components/BrandMarquee";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CategoryCircles } from "@/components/CategoryCircles";
export const revalidate = 900;

export default async function HomePage() {
  const products = await getHomeProducts();
  const brands = await prisma.brand.findMany({
    where: { showOnHome: true },
    select: { id: true, name: true, slug: true, logo: true },
    orderBy: { name: 'asc' },
    take: 20
  });
  
  const categories = await prisma.category.findMany({
    where: { showOnHome: true },
    select: { id: true, name: true, slug: true, image: true, seoTitle: true },
    take: 16, // Only take 16 to fit exactly 2 rows of 8
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
  });

  const circles = await prisma.categoryCircle.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  // Serialize BigInt ID
  const serializedBrands = brands.map(b => ({ ...b, id: b.id.toString() }));
  const serializedCategories = categories.map(c => ({ ...c, id: c.id.toString() }));
  const serializedCircles = circles.map(c => ({ ...c, id: c.id.toString() }));

  return (
    <main>
      <BrandMarquee brands={serializedBrands} />
      
      <HeroBanner />

      <CategoryCircles items={serializedCircles} />

      <CategoryGrid categories={serializedCategories} />

      <div className="container">

      <h2>Latest Products</h2>
      <div className="grid">
        {(products || []).map((product) => (
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
        ))}
      </div>
      </div>
    </main>
  );
}
