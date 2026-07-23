import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@prisma/client';

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }
  const customerId = String(customerIdStr);

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = resolvedParams.search || '';
  const statusFilter = resolvedParams.status as OrderStatus | undefined;
  const sort = resolvedParams.sort === 'oldest' ? 'asc' : 'desc';

  // Build where clause securely
  const whereClause: any = {
    customerId: customerId,
  };

  if (search) {
    whereClause.orderNumber = { contains: search, mode: 'insensitive' };
  }

  if (statusFilter && Object.values(OrderStatus).includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: sort },
      skip,
      take: limit,
      include: {
        items: true
      }
    }),
    prisma.order.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  // Fetch product images manually since OrderItem lacks a Prisma relation to Product
  const productIds = [...new Set(orders.flatMap(o => o.items.map(i => i.productId)))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true }
  });
  const productMap = new Map(products.map(p => [p.id.toString(), p]));

  return (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '32px', borderBottom: '1px solid #F0DDE5' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#730C63', marginBottom: '8px' }}>Order History</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>View and track your past orders.</p>
        
        {/* Filters & Search */}
        <form style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            name="search" 
            defaultValue={search}
            placeholder="Search order number..." 
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #F0DDE5', flex: '1 1 200px', fontSize: '14px', outline: 'none' }}
          />
          <select 
            name="status" 
            defaultValue={statusFilter || ''}
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #F0DDE5', fontSize: '14px', outline: 'none', background: '#FFF' }}
          >
            <option value="">All Statuses</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select 
            name="sort" 
            defaultValue={sort === 'asc' ? 'oldest' : 'newest'}
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #F0DDE5', fontSize: '14px', outline: 'none', background: '#FFF' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <button type="submit" className="dashboard-btn-primary" style={{ padding: '12px 24px' }}>Filter</button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p style={{ fontSize: '15px' }}>No orders found matching your criteria.</p>
          {(search || statusFilter) && (
            <Link href="/account/orders" style={{ color: '#D63062', fontWeight: '700', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Clear Filters</Link>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F0DDE5', background: '#f8fafc' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Order Info</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Total</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const firstItemProductId = order.items[0]?.productId?.toString();
                  const product = firstItemProductId ? productMap.get(firstItemProductId) : null;
                  const firstImage = product?.images?.[0]?.imageUrl;
                  
                  return (
                    <tr key={order.id.toString()} style={{ borderBottom: '1px solid #F0DDE5' }}>
                      <td style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                          {firstImage ? (
                            <img src={firstImage} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>No Img</div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#111111', marginBottom: '4px' }}>{order.orderNumber}</div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>{order.items.length} item(s)</div>
                        </div>
                      </td>
                      <td style={{ padding: '24px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                        {order.createdAt.toLocaleDateString()}
                      </td>
                      <td style={{ padding: '24px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-block',
                          background: order.status === 'DELIVERED' ? '#ecfdf5' : order.status === 'PAID' ? '#eff6ff' : order.status === 'PROCESSING' ? '#fdf4ff' : '#fef2f2',
                          color: order.status === 'DELIVERED' ? '#10b981' : order.status === 'PAID' ? '#3b82f6' : order.status === 'PROCESSING' ? '#d946ef' : '#ef4444'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '24px', fontWeight: '800', fontSize: '15px', color: '#111111' }}>
                        {order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td style={{ padding: '24px', textAlign: 'right' }}>
                        <Link href={`/account/orders/${order.id}`} style={{ fontSize: '14px', fontWeight: '700', color: '#D63062', textDecoration: 'none', padding: '10px 16px', background: '#FFF4F7', borderRadius: '8px', display: 'inline-block', transition: '0.2s' }}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid #F0DDE5' }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link 
                  key={i} 
                  href={`/account/orders?page=${i + 1}&search=${search}&status=${statusFilter || ''}&sort=${sort === 'asc' ? 'oldest' : 'newest'}`}
                  style={{
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', fontWeight: '700', fontSize: '14px', textDecoration: 'none',
                    background: page === i + 1 ? '#D63062' : '#f8fafc',
                    color: page === i + 1 ? '#FFFFFF' : '#475569',
                    border: page === i + 1 ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
