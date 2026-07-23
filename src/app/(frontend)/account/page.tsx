import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@prisma/client';

export default async function AccountDashboardPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }

  const customerId = String(customerIdStr);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      wishlist: { include: { _count: { select: { items: true } } } }
    }
  });

  // Since I can't be 100% sure if `customer.orders` is a relation or an Int field right now,
  // I will just fetch orders separately to be absolutely safe.
  const actualOrders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  if (!customer) {
    redirect('/login');
  }

  const totalOrdersCount = actualOrders.length;
  const processingCount = actualOrders.filter(o => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PAID).length;
  const deliveredCount = actualOrders.filter(o => o.status === OrderStatus.DELIVERED).length;
  const wishlistCount = customer.wishlist?._count.items || 0;

  const recentOrders = actualOrders.slice(0, 5);

  const recommendedProducts = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111111', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        Welcome back, {customer.firstName}!
      </h1>
      <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
        Here is an overview of your recent activity and account statistics.
      </p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Total Orders</span>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#D63062' }}>{totalOrdersCount}</span>
        </div>
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Processing</span>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#111111' }}>{processingCount}</span>
        </div>
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Delivered</span>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>{deliveredCount}</span>
        </div>
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Wishlist Items</span>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#730C63' }}>{wishlistCount}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Recent Orders */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="dashboard-card-title" style={{ margin: 0 }}>Recent Orders</h2>
            {totalOrdersCount > 0 && (
              <Link href="/account/orders" style={{ fontSize: '14px', fontWeight: '700', color: '#D63062', textDecoration: 'none' }}>View All</Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <p style={{ fontSize: '15px' }}>You haven't placed any orders yet.</p>
              <Link href="/" className="dashboard-btn-primary" style={{ marginTop: '16px' }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Order</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Total</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id.toString()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>{order.orderNumber}</td>
                      <td style={{ padding: '16px', color: '#475569', fontSize: '14px' }}>{order.createdAt.toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                          background: order.status === 'DELIVERED' ? '#ecfdf5' : order.status === 'PAID' ? '#eff6ff' : '#fef2f2',
                          color: order.status === 'DELIVERED' ? '#10b981' : order.status === 'PAID' ? '#3b82f6' : '#ef4444'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>
                        {order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Link href={`/account/orders/${order.id}`} style={{ fontSize: '13px', fontWeight: '700', color: '#730C63', textDecoration: 'none', padding: '8px 12px', background: '#FFF4F7', borderRadius: '8px' }}>
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="dashboard-card-title">Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link href="/account/orders" style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #F0DDE5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', color: '#111111' }} className="quick-action">
              <div style={{ width: '40px', height: '40px', background: '#FFF4F7', color: '#D63062', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16" y1="4" x2="16" y2="20"></line><line x1="8" y1="4" x2="8" y2="20"></line><line x1="3" y1="8" x2="21" y2="8"></line><line x1="3" y1="16" x2="21" y2="16"></line></svg>
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>View All Orders</span>
            </Link>
            <Link href="/account/addresses" style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #F0DDE5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', color: '#111111' }} className="quick-action">
              <div style={{ width: '40px', height: '40px', background: '#FFF4F7', color: '#D63062', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Manage Addresses</span>
            </Link>
            <Link href="/account/profile" style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #F0DDE5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', color: '#111111' }} className="quick-action">
              <div style={{ width: '40px', height: '40px', background: '#FFF4F7', color: '#D63062', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Edit Profile</span>
            </Link>
            <Link href="/contact" style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #F0DDE5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', color: '#111111' }} className="quick-action">
              <div style={{ width: '40px', height: '40px', background: '#FFF4F7', color: '#D63062', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Contact Support</span>
            </Link>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="dashboard-card-title">Recommended for You</h2>
          {recommendedProducts.length === 0 ? (
            <p style={{ color: '#64748b' }}>No recommendations available right now.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {recommendedProducts.map((product) => (
                <Link key={product.id.toString()} href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ border: '1px solid #F0DDE5', borderRadius: '16px', overflow: 'hidden', transition: '0.2s' }} className="product-card">
                    <div style={{ aspectRatio: '1/1', background: '#f1f5f9', position: 'relative' }}>
                      {product.images[0]?.imageUrl ? (
                        <img src={product.images[0].imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No Image</div>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#D63062', fontSize: '15px' }}>${Number(product.salePrice || product.basePrice).toFixed(2)}</span>
                        {product.salePrice && (
                          <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>${Number(product.basePrice).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .quick-action:hover {
          border-color: #D63062 !important;
          background: #ffffff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(214, 48, 98, 0.08);
        }
        .product-card:hover {
          border-color: #D63062;
          box-shadow: 0 4px 12px rgba(214, 48, 98, 0.08);
        }
      `}} />
    </div>
  );
}
