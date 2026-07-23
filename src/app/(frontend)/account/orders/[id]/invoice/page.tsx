import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) redirect('/login');
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
    include: { items: true }
  });

  if (!order || order.customerId !== customerId) return notFound();

  const billingAddr: any = order.billingAddress || order.shippingAddress || {};
  const shippingAddr: any = order.shippingAddress || {};

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .invoice-body {
          font-family: var(--font-plus-jakarta), sans-serif;
          color: #0f172a;
          line-height: 1.5;
        }
        
        .invoice-container {
          max-width: 210mm; /* A4 Width */
          min-height: 297mm; /* A4 Height */
          margin: 40px auto;
          background: #ffffff;
          padding: 15mm 20mm;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 32px;
        }
        
        .invoice-table th {
          background: #f1f5f9;
          color: #475569;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #cbd5e1;
        }

        .invoice-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }

        @media print {
          body, html { margin: 0; padding: 0; background: #ffffff !important; }
          .no-print { display: none !important; }
          .invoice-container { 
            margin: 0; 
            padding: 15mm; 
            box-shadow: none; 
            max-width: 100%; 
            min-height: 100%; 
          }
          /* Force backgrounds to print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      <PrintButton />

      <div className="invoice-body">
        <div className="invoice-container">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.04em' }}>Rany.uk</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>123 Tech Lane, Innovation District<br/>New York, NY 10001<br/>info@rany.uk</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: '900', color: '#cbd5e1', textTransform: 'uppercase' }}>Invoice</h2>
              <p style={{ margin: '0 0 4px', fontSize: '14px' }}><strong>Order #:</strong> {order.orderNumber}</p>
              <p style={{ margin: '0', fontSize: '14px' }}><strong>Date:</strong> {order.createdAt.toLocaleDateString()}</p>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
            <div>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px', letterSpacing: '0.05em' }}>Billed To</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>{billingAddr.firstName} {billingAddr.lastName}</strong><br/>
                {billingAddr.addressLine1}<br/>
                {billingAddr.addressLine2 && <>{billingAddr.addressLine2}<br/></>}
                {billingAddr.city}, {billingAddr.state} {billingAddr.postalCode}<br/>
                {billingAddr.country}
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 12px', letterSpacing: '0.05em' }}>Shipped To</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                <strong>{shippingAddr.firstName} {shippingAddr.lastName}</strong><br/>
                {shippingAddr.addressLine1}<br/>
                {shippingAddr.addressLine2 && <>{shippingAddr.addressLine2}<br/></>}
                {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}<br/>
                {shippingAddr.country}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items as any[]).map(item => (
                <tr key={item.id.toString()}>
                  <td style={{ fontWeight: '600' }}>{item.title}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <table style={{ width: '300px', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', color: '#64748b' }}>Subtotal</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>{order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', color: '#64748b' }}>Shipping</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>$0.00</td>
                </tr>
                <tr style={{ borderTop: '2px solid #0f172a' }}>
                  <td style={{ padding: '16px 8px', fontSize: '18px', fontWeight: '900' }}>Total</td>
                  <td style={{ padding: '16px 8px', textAlign: 'right', fontSize: '18px', fontWeight: '900' }}>
                    {order.currency === 'GBP' ? '£' : '£'}{Number(order.totalAmount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '80px', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Thank you for your business. For any inquiries regarding this invoice, please contact info@rany.uk.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
