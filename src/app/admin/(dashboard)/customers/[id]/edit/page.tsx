import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CustomerEditForm } from './components/CustomerEditForm';

export const dynamic = 'force-dynamic';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id: String(id) },
    include: {
      addresses: true,
    }
  });

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link href="/admin/customers" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </Link>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Edit Customer</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Main Edit Form */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>Personal Information</h2>
          <CustomerEditForm customer={{
            id: customer.id.toString(),
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone
          }} />
        </div>

        {/* Sidebar Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Account Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Status</span>
                {customer.isBlocked ? (
                  <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>Blocked</span>
                ) : (
                  <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>Active</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Orders</span>
                <span style={{ fontWeight: '700' }}>{customer.orders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Member Since</span>
                <span style={{ fontWeight: '600' }}>{new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Marketing Consent</span>
                <span style={{ fontWeight: '600' }}>{customer.marketingConsent ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Saved Addresses</h3>
            {customer.addresses.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '16px' }}>No addresses saved.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {customer.addresses.map(addr => (
                  <div key={addr.id.toString()} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>{addr.firstName} {addr.lastName}</div>
                    <div>{addr.addressLine1}</div>
                    {addr.addressLine2 && <div>{addr.addressLine2}</div>}
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div>{addr.country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
