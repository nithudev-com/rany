import Image from "next/image";
import { formatPrice } from "@/lib/money";
import { WishlistButton } from "@/app/(frontend)/product/components/WishlistButton";
import { AddToCartButton } from "@/components/AddToCartButton";
import { prisma } from "@/lib/prisma";

type ProductCardProps = {
  id?: string;
  title: string;
  slug: string;
  image?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  category?: string | null;
  brand?: string | null;
  variantsCount?: number;
};

export async function ProductCard({ id, title, slug, image, price, salePrice, category, brand, variantsCount = 0 }: ProductCardProps) {
  let avgRating = 0;
  let reviewCount = 0;

  if (id) {
    const stats = await prisma.review.aggregate({
      where: { productId: BigInt(id), approved: true },
      _avg: { rating: true },
      _count: { rating: true }
    });
    
    reviewCount = stats._count.rating;
    avgRating = stats._avg.rating ? Number(stats._avg.rating) : 0;
  }

  return (
    <div className="premium-product-card" style={{ 
      background: '#ffffff', 
      borderRadius: '16px', 
      border: '1px solid #f1f5f9', 
      overflow: 'hidden', 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      {id && (
        <div className="premium-wishlist-pos">
          <WishlistButton productId={id} mini={true} />
        </div>
      )}

      <a className="premium-card-image-link" href={`/product/${slug}`}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1' }}>No Image</div>
        )}
      </a>
      
      <div className="premium-card-body">
        <a href={`/product/${slug}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'block' }}>
          {brand && (
            <div className="premium-card-brand">
              {brand}
            </div>
          )}
          <h3 className="premium-card-title">{title}</h3>
        
        {/* Ratings dynamic as per requirements */}
        {reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', color: '#FBBF24', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width="12" height="12" fill={star <= Math.round(avgRating) ? 'currentColor' : '#e2e8f0'} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{avgRating.toFixed(1)} ({reviewCount})</span>
          </div>
        )}
        </a>

        <div className="premium-card-price-row">
          <div>
            <span className="premium-card-price">{await formatPrice(salePrice || price)}</span>
            {salePrice && (
              <span className="premium-card-old-price">{await formatPrice(price)}</span>
            )}
          </div>
          {id && (
            <div style={{ pointerEvents: 'auto' }}>
              {variantsCount > 0 ? (
                <a 
                  href={`/product/${slug}`}
                  title="Select Options"
                  style={{ background: '#0f172a', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textDecoration: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </a>
              ) : (
                <AddToCartButton productId={id} outOfStock={false} mini={true} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
