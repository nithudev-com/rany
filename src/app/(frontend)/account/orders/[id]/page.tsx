import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BuyAgainButton } from '../components/BuyAgainButton';
import { AnimatedTracker } from './components/AnimatedTracker';
import { ReviewModalButton } from './components/ReviewModalButton';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }
  const customerId = String(customerIdStr);
  const resolvedParams = await params;

  let orderId: string;
  try {
    orderId = resolvedParams.id;
  } catch {
    return notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });

  // Zero-Trust Security Validation: Ensure the order belongs to this customer
  if (!order || order.customerId !== customerId) {
    return notFound();
  }

  // We use AnimatedTracker for the visual timeline logic now.

  const shippingAddr: any = order.shippingAddress || {};
  const billingAddr: any = order.billingAddress || {};

  // Fetch product images manually
  const productIds = [...new Set((order.items as any[]).map(i => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true }
  });
  const productMap = new Map(products.map(p => [p.id.toString(), p]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Link href="/account/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to Orders
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', margin: '0 0 8px 0' }}>Order #{order.orderNumber}</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Placed on {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href={`/account/orders/${order.id.toString()}/invoice`} className="dashboard-btn-primary" style={{ background: '#111111', color: '#fff', border: '1px solid #111111' }} target="_blank">Download Invoice</Link>
            <Link href="/contact" className="dashboard-btn-primary" style={{ background: '#FFF4F7', color: '#D63062', border: '1px solid #F0DDE5' }}>Contact Support</Link>
          </div>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <div className="dashboard-card" style={{ padding: '32px' }}>
        <h2 className="dashboard-card-title">Tracking Status: {order.status}</h2>
        <AnimatedTracker orderStatus={order.status} orderDate={order.createdAt.toISOString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Order Items */}
        <div className="dashboard-card" style={{ padding: '32px', gridColumn: '1 / -1' }}>
          <h2 className="dashboard-card-title">Items Ordered</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(order.items as any[]).map(item => {
              const product = productMap.get(item.productId.toString());
              const image = product?.images?.[0]?.imageUrl;
              return (
                <div key={item.id.toString()} style={{ display: 'flex', gap: '24px', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #F0DDE5' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    {image ? (
                      <img src={image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>No Img</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0', color: '#111111' }}>{item.title}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Qty: {item.quantity} • {order.currency === 'GBP' ? '£' : '£'}{Number(item.unitPrice).toFixed(2)} each</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#111111', marginBottom: '8px' }}>
                      {order.currency === 'GBP' ? '£' : '£'}{Number(item.totalPrice).toFixed(2)}
                    </div>
                    <BuyAgainButton productId={item.productId.toString()} variantId={item.variantId?.toString()} />
                    {order.status === 'DELIVERED' && (
                      <ReviewModalButton productId={item.productId.toString()} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: '700' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F0DDE5', fontSize: '18px' }}>
                <span style={{ fontWeight: '800', color: '#111111' }}>Total Paid</span>
                <span style={{ fontWeight: '900', color: '#D63062' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses & Payment */}
        <div className="dashboard-card" style={{ padding: '32px' }}>
          <h2 className="dashboard-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Delivery Address</h2>
          {shippingAddr.addressLine1 ? (
            <address style={{ fontStyle: 'normal', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>
              <strong>{shippingAddr.firstName} {shippingAddr.lastName}</strong><br />
              {shippingAddr.addressLine1}<br />
              {shippingAddr.addressLine2 && <>{shippingAddr.addressLine2}<br /></>}
              {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}<br />
              {shippingAddr.country}
            </address>
          ) : (
            <p style={{ color: '#94a3b8' }}>No delivery address recorded.</p>
          )}
        </div>

        <div className="dashboard-card" style={{ padding: '32px' }}>
          <h2 className="dashboard-card-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Payment Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>Status</span>
              <span style={{ fontWeight: '800', color: '#111111', fontSize: '15px' }}>{order.status}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>Method</span>
              <span style={{ fontWeight: '800', color: '#111111', fontSize: '15px' }}>Monirize Gateway</span>
            </div>
            {order.paymentRef && (
              <div>
                <span style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em' }}>Reference</span>
                <span style={{ fontWeight: '800', color: '#111111', fontSize: '15px', fontFamily: 'monospace' }}>{order.paymentRef}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
