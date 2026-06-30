'use client';
import { useState } from 'react';

export function SubscriberListClient({ initialSubscribers }: { initialSubscribers: any[] }) {
  const [search, setSearch] = useState('');

  const filtered = initialSubscribers.filter(sub => {
    return sub.customerEmail.toLowerCase().includes(search.toLowerCase()) || 
           sub.customerName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Subscribers & Segments</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Search email or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Customer</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No subscribers found.</td>
              </tr>
            ) : (
              filtered.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500' }}>{sub.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{sub.customerEmail}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {sub.globalUnsubscribe ? (
                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '600' }}>Unsubscribed</span>
                      ) : (
                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '600' }}>Subscribed</span>
                      )}
                      
                      {sub.isBounced && (
                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '600' }}>Bounced</span>
                      )}
                      
                      {sub.isSpamComplaint && (
                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '600' }}>Spam Complaint</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{new Date(sub.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
