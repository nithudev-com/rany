import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ 
        width: '260px', 
        background: '#0f172a', 
        color: 'white', 
        padding: '32px 24px',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Link href="/" style={{ 
          fontSize: '22px', 
          fontWeight: '900', 
          marginBottom: '48px', 
          display: 'block',
          letterSpacing: '-0.04em' 
        }}>SpeedCommerce</Link>
        
        <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Management</div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/admin" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Dashboard</Link>
          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Catalog</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <Link href="/admin/products" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Products</Link>
            <Link href="/admin/deals" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Deals Management</Link>
            <Link href="/admin/categories" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Categories</Link>
            <Link href="/admin/category-circles" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Category Circles</Link>
            <Link href="/admin/brands" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Brands</Link>
            <Link href="/admin/import" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Importer</Link>
          </nav>

          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Sales & Users</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <Link href="/admin/orders" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Orders</Link>
            <Link href="/admin/coupons" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Coupons & Discounts</Link>
            <Link href="/admin/blog" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Blog Posts</Link>
            <Link href="/admin/products/bulk-ai" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Bulk AI Generator</Link>
            <Link href="/admin/products/bulk-blog" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Bulk Product Blog Generator</Link>
            <Link href="/admin/ai-settings" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>AI Settings</Link>
            <Link href="/admin/customers" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Customers</Link>
            <Link href="/admin/reviews" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Reviews</Link>
            <Link href="/admin/messages" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Customer Messages</Link>
          </nav>

          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Marketing & Automation</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <Link href="/admin/emails/jobs" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Email Queue & Logs</Link>
            <Link href="/admin/emails/campaigns" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Campaigns</Link>
            <Link href="/admin/emails/templates" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Email Templates</Link>
            <Link href="/admin/emails/subscribers" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Subscribers & Segments</Link>
          </nav>

          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Configuration</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
            <Link href="/admin/settings" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Store Settings</Link>
            <Link href="/admin/settings/currencies" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Currencies</Link>
            <Link href="/admin/settings/shipping" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Shipping Zones</Link>
            <Link href="/admin/settings/taxes" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Taxes</Link>
            <Link href="/admin/settings/payment-gateways" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>Payment Gateways</Link>
          </nav>
          
          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: '700' }}>Storefront</div>
          <Link href="/" style={{ padding: '10px 14px', borderRadius: '8px', color: '#cbd5e1', fontWeight: '500' }}>View Site</Link>
        </nav>
      </aside>
      
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <main style={{ flex: 1, background: '#f1f5f9', padding: '40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
