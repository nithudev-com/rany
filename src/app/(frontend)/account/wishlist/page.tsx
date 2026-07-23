import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { WishlistItemActionButtons } from './components/WishlistItemActionButtons';

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }
  const customerId = String(customerIdStr);

  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
    include: {
      items: {
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: { images: true }
          }
        }
      }
    }
  });

  const items = wishlist?.items || [];

  return (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '32px', borderBottom: '1px solid #F0DDE5' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#730C63', marginBottom: '8px' }}>My Wishlist</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Save your favorite products for later.</p>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <p style={{ fontSize: '15px' }}>Your wishlist is currently empty.</p>
          <Link href="/" className="dashboard-btn-primary" style={{ marginTop: '16px' }}>Start Exploring</Link>
        </div>
      ) : (
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {items.map(item => {
              const product = item.product;
              const image = product.images?.[0]?.imageUrl;
              const isAvailable = product.status === 'ACTIVE' && product.stockStatus !== 'OUT_OF_STOCK' && product.stockQuantity > 0;
              const price = product.salePrice || product.basePrice;

              return (
                <div key={item.id.toString()} style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #F0DDE5', flexWrap: 'wrap' }}>
                  <Link href={`/product/${product.slug}`} style={{ flexShrink: 0 }}>
                    <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden' }}>
                      {image ? (
                        <img src={image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>No Img</div>
                      )}
                    </div>
                  </Link>
                  <div style={{ flex: '1 1 200px' }}>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#111111' }}>{product.title}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#D63062' }}>${Number(price).toFixed(2)}</span>
                      {product.salePrice && (
                        <span style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'line-through' }}>${Number(product.basePrice).toFixed(2)}</span>
                      )}
                    </div>
                    <div>
                      <span style={{ 
                        fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px',
                        background: isAvailable ? '#ecfdf5' : '#fef2f2',
                        color: isAvailable ? '#10b981' : '#ef4444'
                      }}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons Container */}
                  <WishlistItemActionButtons 
                    itemId={item.id.toString()} 
                    productId={product.id.toString()} 
                    isAvailable={isAvailable} 
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
