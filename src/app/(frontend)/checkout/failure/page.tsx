import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CheckoutFailurePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;
  
  let order = null;
  if (token) {
    order = await prisma.order.findUnique({
      where: { secureToken: token }
    });
  }

  const isCancelled = order?.status === 'CANCELLED';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'inherit', color: '#111111' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '48px', maxWidth: '540px', width: '100%', boxShadow: '0 20px 40px -10px rgba(115, 12, 99, 0.1)', textAlign: 'center' }}>
        
        <div style={{ width: '80px', height: '80px', background: isCancelled ? '#f59e0b' : '#E71C25', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'white' }}>
          {isCancelled ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111111', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
        </h1>
        
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          {isCancelled 
            ? "You cancelled the payment process. Don't worry, your cart is perfectly preserved."
            : "Unfortunately, we were unable to process your payment. Your bank or card issuer may have declined the transaction. Don't worry, your cart is perfectly preserved."}
        </p>

        {order && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#FAFAFA', padding: '12px 24px', borderRadius: '12px', border: '1px solid #F0DDE5', marginBottom: '32px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Order Ref</span>
            <span style={{ fontSize: '15px', fontWeight: '800' }}>{order.orderNumber}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/checkout" style={{ padding: '16px 24px', background: '#D63062', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', transition: '0.2s', width: '100%' }}>
            Try Again / Return to Checkout
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/cart" style={{ padding: '14px 24px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', flex: 1, textAlign: 'center' }}>
              Return to Cart
            </Link>
            <Link href="/contact" style={{ padding: '14px 24px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: '600', textDecoration: 'none', flex: 1, textAlign: 'center' }}>
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
