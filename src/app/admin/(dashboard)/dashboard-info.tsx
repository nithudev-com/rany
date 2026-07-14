'use no memo';
import Link from "next/link";
import { getSearchClient } from "@/lib/search";



export default async function DashboardInfo() {
  const searchClient = getSearchClient();
  const searchStatus = searchClient ? "Connected" : "Disconnected";

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
           <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: searchStatus === 'Connected' ? '#dcfce7' : '#fee2e2', color: searchStatus === 'Connected' ? '#166534' : '#991b1b' }}>
             Search: {searchStatus}
           </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3>Quick Links</h3>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <Link href="/admin/products/new" style={{ color: 'var(--accent)' }}>+ Add New Product</Link>
            <Link href="/admin/categories/new" style={{ color: 'var(--accent)' }}>+ Add New Category</Link>
            <Link href="/admin/brands/new" style={{ color: 'var(--accent)' }}>+ Add New Brand</Link>
          </nav>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3>System Status</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Database</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Redis Queue</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">ISR Revalidation</span>
              <span style={{ color: '#166534', fontWeight: 'bold' }}>Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
