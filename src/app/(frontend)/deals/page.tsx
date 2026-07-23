import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CountdownTimer } from "@/components/CountdownTimer";

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "Today's Flash Deals | Rany.uk",
  description: "Shop the best daily deals on electronics, fashion, and more. Limited time offers!",
};

export default async function DealsPage() {
  const deals = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      salePrice: { not: null }
    },
    include: {
      category: true,
      brand: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const now = new Date();
  const futureDeals = deals.filter(d => d.saleEndDate && new Date(d.saleEndDate) > now);
  const earliestDeal = futureDeals.sort((a, b) => new Date(a.saleEndDate!).getTime() - new Date(b.saleEndDate!).getTime())[0];
  const targetDate = earliestDeal ? earliestDeal.saleEndDate?.toISOString() : null;

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Deals Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        color: '#fff', 
        padding: '64px 24px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(214, 48, 98, 0.2)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(60px)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '30px', marginBottom: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '20px' }}>🔥</span>
            <span style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '13px', textTransform: 'uppercase' }}>Limited Time Offers</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.04em', lineHeight: '1.1' }}>
            Today's <span style={{ color: '#D63062' }}>Lightning Deals</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '40px' }}>
            Incredible discounts on top-rated products. Grab them before they're gone!
          </p>
          
          {/* Animated Countdown Timer */}
          <CountdownTimer targetDate={targetDate || null} />
        </div>
      </section>

      {/* Deals Grid */}
      <section className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#111111' }}>Active Deals ({deals.length})</h2>
          <select style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontWeight: '600', color: '#475569' }}>
            <option>Highest Discount</option>
            <option>Newest Deals</option>
            <option>Price: Low to High</option>
          </select>
        </div>

        {deals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥲</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>No active deals right now</h3>
            <p style={{ color: '#64748b' }}>Check back later! We're always adding new discounts.</p>
          </div>
        ) : (
          <div className="grid">
            {deals.map(product => (
              <div key={product.id.toString()} style={{ position: 'relative' }}>
                <ProductCard
                    variantsCount={(product as any)._count?.variants || 0} 
                  id={product.id.toString()}
                  title={product.title}
                  slug={product.slug}
                  image={product.mainImage}
                  price={product.basePrice.toString()}
                  salePrice={product.salePrice?.toString()}
                  category={product.category?.name}
                  brand={product.brand?.name}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
