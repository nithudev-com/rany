import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;
  
  if (!token) {
    redirect('/cart');
  }

  const order = await prisma.order.findUnique({
    where: { secureToken: token },
    include: { items: true }
  });

  if (!order) {
    notFound();
  }

  // If order is not paid, redirect to failure
  if (order.status !== 'PAID') {
    redirect(`/checkout/failure?token=${token}`);
  }

  // Safely parse shipping address
  let address: any = {};
  if (order.shippingAddress && typeof order.shippingAddress === 'object') {
    address = order.shippingAddress;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'inherit', color: '#111111' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '48px', maxWidth: '640px', width: '100%', boxShadow: '0 20px 40px -10px rgba(115, 12, 99, 0.1)', textAlign: 'center' }}>
        
        <div style={{ width: '80px', height: '80px', background: '#D63062', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white', animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#730C63', marginBottom: '16px', letterSpacing: '-0.02em' }}>Thank you for your order!</h1>
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          We've received your order and are currently processing it. A confirmation email will be sent to <strong>{order.customerEmail}</strong> shortly.
        </p>

        <div style={{ background: '#FAFAFA', borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '32px', border: '1px solid #F0DDE5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0DDE5', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>Order Number</p>
              <p style={{ fontSize: '16px', fontWeight: '800' }}>{order.orderNumber}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>Date</p>
              <p style={{ fontSize: '15px', fontWeight: '600' }}>{order.createdAt.toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0DDE5', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>Total Paid</p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#D63062' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>Status</p>
              <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700' }}>Verified Payment</span>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', marginBottom: '8px' }}>Delivery Address</p>
            {address.addressLine1 ? (
              <p style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>
                {address.firstName} {address.lastName}<br />
                {address.addressLine1} {address.addressLine2}<br />
                {address.city}, {address.state} {address.postalCode}<br />
                {address.country}
              </p>
            ) : (
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#94a3b8' }}>No shipping address provided.</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '40px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#111111' }}>Purchased Items</h3>
          {order.items.map((item) => (
            <div key={item.id.toString()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                  {item.quantity}x
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.title}</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>${Number(item.totalPrice).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/account" style={{ padding: '14px 24px', background: '#111111', color: 'white', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', transition: '0.2s', flex: '1 1 auto', maxWidth: '200px' }}>
            Customer Dashboard
          </Link>
          <Link href="/" style={{ padding: '14px 24px', background: '#FFF4F7', color: '#D63062', border: '2px solid #D63062', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', transition: '0.2s', flex: '1 1 auto', maxWidth: '200px' }}>
            Continue Shopping
          </Link>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
