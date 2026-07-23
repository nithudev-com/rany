import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Email Campaigns</h1>
        <button style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', border: 'none', opacity: 0.5, cursor: 'not-allowed' }} title="Coming soon">
          + New Campaign
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Subject</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Sent / Failed</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No campaigns found.</td>
              </tr>
            ) : (
              campaigns.map(camp => (
                <tr key={camp.id.toString()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{camp.name}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{camp.subject}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>
                      {camp.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{camp.sentCount} / {camp.failedCount}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{new Date(camp.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
