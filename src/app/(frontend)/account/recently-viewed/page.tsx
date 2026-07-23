import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { clearRecentlyViewed } from './actions';
import { WishlistItemActionButtons } from '../wishlist/components/WishlistItemActionButtons';

export const dynamic = 'force-dynamic';

export default async function RecentlyViewedPage() {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get('recently_viewed')?.value;
  
  let viewedIds: string[] = [];
  if (existingCookie) {
    try {
      viewedIds = JSON.parse(existingCookie);
    } catch {
      viewedIds = [];
    }
  }

  let products: any[] = [];
  if (viewedIds.length > 0) {
    const productBigInts = viewedIds.map(id => String(id));
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productBigInts } },
      include: { images: true }
    });

    // Sort to match cookie order (newest first)
    products = viewedIds
      .map(id => dbProducts.find(p => p.id.toString() === id))
      .filter(Boolean);
  }

  return (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '32px', borderBottom: '1px solid #F0DDE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#730C63', marginBottom: '8px' }}>Recently Viewed</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Products you've looked at recently.</p>
        </div>
        {products.length > 0 && (
          <form action={clearRecentlyViewed}>
            <button type="submit" style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              Clear History
            </button>
          </form>
        )}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          <p style={{ fontSize: '15px' }}>You haven't viewed any products recently.</p>
          <Link href="/" className="dashboard-btn-primary" style={{ marginTop: '16px' }}>Start Exploring</Link>
        </div>
      ) : (
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
            {products.map(product => {
              const image = product.images?.[0]?.imageUrl;
              const isAvailable = product.status === 'ACTIVE' && product.stockStatus !== 'OUT_OF_STOCK' && product.stockQuantity > 0;
              const price = product.salePrice || product.basePrice;

              return (
                <div key={product.id.toString()} style={{ border: '1px solid #F0DDE5', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ aspectRatio: '1/1', background: '#f1f5f9', position: 'relative' }}>
                      {image ? (
                        <img src={image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#111111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.title}
                      </h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontWeight: '800', color: '#D63062', fontSize: '16px' }}>${Number(price).toFixed(2)}</span>
                      {product.salePrice && (
                        <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>${Number(product.basePrice).toFixed(2)}</span>
                      )}
                    </div>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Reuse the BuyAgain button concept for Add to Cart here */}
                      <WishlistItemActionButtons 
                        itemId={product.id.toString()} // Dummy item ID since it's not a wishlist item
                        productId={product.id.toString()} 
                        isAvailable={isAvailable} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
