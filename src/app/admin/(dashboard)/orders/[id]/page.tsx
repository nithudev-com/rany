import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { OrderStatusManager } from './components/OrderStatusManager';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const order = await prisma.order.findUnique({
    where: { id: String(id) },
    include: {
      items: true
    }
  });

  if (!order) {
    notFound();
  }

  // Parse addresses safely
  const shipping = order.shippingAddress as any || {};
  const billing = order.billingAddress as any || {};

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link href="/admin/orders" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </Link>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Order #{order.orderNumber}</h1>
        <span style={{ marginLeft: '12px', padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.05em' }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Column: Order Items */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Itemized Receipt</h2>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '16px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id.toString()} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111111' }}>
                    {item.title}
                    {item.variantId && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '400' }}>Variant ID: {item.variantId.toString()}</div>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', color: '#475569' }}>
                    {order.currency} {Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '700' }}>
                    {order.currency} {Number(item.totalPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#f8fafc' }}>
              <tr>
                <td colSpan={3} style={{ padding: '24px', textAlign: 'right', fontWeight: '700', color: '#475569' }}>Grand Total</td>
                <td style={{ padding: '24px', textAlign: 'right', fontWeight: '900', fontSize: '18px', color: '#111111' }}>
                  {order.currency} {Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right Column: Order Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Manage Order</h3>
            <OrderStatusManager orderId={order.id.toString()} currentStatus={order.status} />
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Payment Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Transaction Ref</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{order.paymentRef || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Date Placed</span>
                <span style={{ fontWeight: '600', fontSize: '13px' }}>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Customer Email</span>
                <span style={{ fontWeight: '600', fontSize: '13px', color: '#D63062' }}>{order.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Shipping Address</h3>
            {Object.keys(shipping).length > 0 ? (
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                <div style={{ fontWeight: '700' }}>{shipping.firstName} {shipping.lastName}</div>
                <div>{shipping.addressLine1}</div>
                {shipping.addressLine2 && <div>{shipping.addressLine2}</div>}
                <div>{shipping.city}, {shipping.state} {shipping.postalCode}</div>
                <div>{shipping.country}</div>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>No shipping details provided.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
