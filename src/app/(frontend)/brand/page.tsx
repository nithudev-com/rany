import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Premium Brands | Official Collection",
  description: "Explore our extensive collection of the world's top brands, delivering exceptional quality and unmatched design.",
  keywords: "premium brands, adult brands, official brands, buy brands online, best brands",
  alternates: {
    canonical: siteUrl("/brand"),
  },
  openGraph: {
    title: "Premium Brands | Official Collection",
    description: "Explore our extensive collection of the world's top brands, delivering exceptional quality and unmatched design.",
    url: siteUrl("/brand"),
    siteName: 'Premium Partners',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Premium Brands | Official Collection",
    description: "Explore our extensive collection of the world's top brands, delivering exceptional quality and unmatched design.",
  }
};

export default async function BrandIndexPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: { where: { status: 'ACTIVE' } } }
      }
    }
  });

  const bubbles = Array.from({ length: 30 }).map((_, i) => {
    // Generate static-like pseudo-random values to avoid hydration issues if it was a client component,
    // but here it's a Server Component so it just sets the initial HTML.
    // Using a deterministic formula based on index to ensure consistent rendering.
    const size = (i * 1.5 % 20) + 15;
    const left = (i * 7 % 100);
    const duration = (i * 0.3 % 5) + 5;
    const delay = (i * 0.2 % 4);
    return (
      <div 
        key={`bubble-${i}`}
        className="seawater-bubble"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`
        }}
      />
    );
  });

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f8fafc, #e0f2fe)', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .seawater-bubble {
          position: absolute;
          bottom: -50px;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: floatUp linear infinite;
          z-index: 1;
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-50vh) scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-120vh) scale(0.8);
            opacity: 0;
          }
        }
      `}} />
      {bubbles}
      
      {/* MASSIVE HERO SECTION */}
      <section className="brand-index-hero" style={{ position: 'relative', zIndex: 10 }}>
        <div className="brand-index-hero-content">
          <h1 className="brand-index-title">Premium Brands</h1>
          <p className="brand-index-subtitle">
            Explore our extensive collection of the world's top brands, delivering exceptional quality and unmatched design.
          </p>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        
        {brands.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', color: '#64748b' }}>No brands available.</h2>
          </div>
        ) : (
          <div className="brand-index-grid">
            {brands.map((brand) => (
              <Link key={brand.id.toString()} href={`/brand/${brand.slug}`} className="brand-index-card">
                <div className="brand-index-card-inner">
                  
                  {/* Avatar / Logo Area */}
                  <div className="brand-index-avatar-wrapper">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="brand-index-logo" />
                    ) : (
                      <div className="brand-index-placeholder" style={{ background: `linear-gradient(135deg, hsl(${brand.name.charCodeAt(0) * 10 % 360}, 80%, 60%), hsl(${brand.name.charCodeAt(brand.name.length - 1) * 20 % 360}, 80%, 40%))` }}>
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="brand-index-info">
                    <h2 className="brand-index-name">{brand.name}</h2>
                    {brand.seoDescription && (
                      <p className="brand-index-card-desc" style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                        {brand.seoDescription}
                      </p>
                    )}
                    <span className="brand-index-count">
                      {brand._count.products} {brand._count.products === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
