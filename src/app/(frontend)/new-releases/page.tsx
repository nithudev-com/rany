import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function NewReleasesPage() {
  const latestProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { brand: true, category: true }
  });

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', paddingBottom: '80px', color: '#fff', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(60px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 0, 128, 0.4); }
          50% { text-shadow: 0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(255, 0, 128, 0.8); }
        }
        .hero-gradient {
          background: linear-gradient(-45deg, #FF0080, #7928CA, #4A00E0, #8E2DE2);
          background-size: 400% 400%;
          animation: gradientShift 10s ease infinite;
          padding: 160px 20px 200px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }
        .hero-title {
          font-size: clamp(48px, 10vw, 120px);
          font-weight: 900;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          margin: 0;
          position: relative;
          z-index: 2;
          color: #ffffff;
          animation: pulseGlow 4s ease-in-out infinite;
        }
        .hero-subtitle {
          font-size: clamp(18px, 4vw, 28px);
          font-weight: 700;
          margin-top: 16px;
          opacity: 0.9;
          position: relative;
          z-index: 2;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .floating-shape {
          position: absolute;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.0));
          backdrop-filter: blur(10px);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
          z-index: 1;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .animated-card {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        /* Override global grid slightly for this dark page */
        .new-releases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        @media (max-width: 640px) {
          .new-releases-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .hero-gradient {
            padding: 100px 20px 140px 20px;
          }
        }
      `}} />

      <div className="hero-gradient">
        {/* Decorative Floating Elements */}
        <div className="floating-shape" style={{ width: '400px', height: '400px', top: '-100px', left: '-150px', animationDelay: '0s' }}></div>
        <div className="floating-shape" style={{ width: '250px', height: '250px', bottom: '40px', right: '5%', animationDelay: '1.5s' }}></div>
        <div className="floating-shape" style={{ width: '120px', height: '120px', top: '80px', right: '30%', animationDelay: '3s' }}></div>
        
        <h1 className="hero-title">Fresh Drops</h1>
        <p className="hero-subtitle">The absolute latest arrivals.</p>
      </div>

      <div className="container" style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
        <div className="new-releases-grid">
          {latestProducts.map((product, index) => (
            <div key={product.id.toString()} className="animated-card" style={{ animationDelay: `${0.2 + (index * 0.08)}s` }}>
              <ProductCard
                    variantsCount={(product as any)._count?.variants || 0}
                id={product.id.toString()}
                title={product.title}
                slug={product.slug}
                image={product.mainImage}
                price={Number(product.basePrice)}
                salePrice={product.salePrice ? Number(product.salePrice) : null}
                category={product.category?.name}
                brand={product.brand?.name}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
