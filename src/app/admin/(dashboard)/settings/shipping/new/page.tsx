import Link from 'next/link';
import { ShippingForm } from '../components/ShippingForm';

export const dynamic = 'force-dynamic';

export default function NewShippingMethodPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link href="/admin/settings/shipping" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back
        </Link>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Add Shipping Method</h1>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <ShippingForm />
      </div>
    </div>
  );
}
