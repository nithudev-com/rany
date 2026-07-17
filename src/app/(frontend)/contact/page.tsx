import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { ContactForm } from './components/ContactForm';

export default async function ContactPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  let customerData = null;
  let ordersData: { orderNumber: string; createdAt: Date }[] = [];

  if (customerIdStr) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: BigInt(customerIdStr) }
      });
    if (customer) {
      customerData = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      };

      const orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { orderNumber: true, createdAt: true }
      });
      ordersData = orders;
    }
    } catch (e) {
      // Invalid cookie value, ignore
    }
  }

  return (
    <div className="contact-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .contact-container { padding: 64px 24px; }
        .contact-title { font-size: 48px; font-weight: 900; color: #111111; line-height: 1.1; margin-bottom: 24px; letter-spacing: -0.04em; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr)); gap: 48px; align-items: start; }
        .contact-info-col { position: sticky; top: 120px; z-index: 10; background: transparent; }
        @media (max-width: 768px) {
          .contact-container { padding: 32px 16px; }
          .contact-title { font-size: 32px; }
          .contact-grid { gap: 32px; }
          .contact-info-col { position: static; z-index: auto; background: transparent; }
        }
      `}} />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="contact-grid">
          
          {/* Left Column: Info */}
          <div className="contact-info-col">
            <div style={{ display: 'inline-block', background: '#FFF4F7', color: '#D63062', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', marginBottom: '16px' }}>
              We're Here to Help
            </div>
            <h1 className="contact-title">
              Get in touch with our support team.
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', marginBottom: '40px' }}>
              Whether you have a question about a product, need help with an order, or just want to share feedback, we're ready to assist you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #F0DDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63062', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#111111' }}>Phone Support</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>+44 7507 549004</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #F0DDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63062', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#111111' }}>Visit Our Studio</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>262B Upper Tooting Rd<br/>London SW17 0DN, United Kingdom</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #F0DDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63062', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#111111' }}>Email Us</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>info@rany.uk<br/>We reply within 24 hours.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #F0DDE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D63062', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#111111' }}>FAQ & Help Center</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Find instant answers to common questions in our <a href="#" style={{ color: '#D63062', fontWeight: '600' }}>Help Center</a>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <ContactForm customer={customerData} orders={ordersData} />
          </div>

        </div>
      </div>
    </div>
  );
}
