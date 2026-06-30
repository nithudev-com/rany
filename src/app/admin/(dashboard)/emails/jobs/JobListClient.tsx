'use client';
import { useState } from 'react';

export function JobListClient({ initialJobs }: { initialJobs: any[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredJobs = initialJobs.filter(job => {
    const matchesSearch = job.recipientEmail.toLowerCase().includes(search.toLowerCase()) || 
                          job.idempotencyKey.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Email Queue & Logs</h1>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Search email or key..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Recipient</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Channel</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Attempts</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No email jobs found.</td>
              </tr>
            ) : (
              filteredJobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500' }}>{job.recipientEmail}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{job.idempotencyKey}</div>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{job.channel}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: job.status === 'SENT' ? '#dcfce7' : job.status === 'FAILED' ? '#fee2e2' : '#f1f5f9',
                      color: job.status === 'SENT' ? '#166534' : job.status === 'FAILED' ? '#991b1b' : '#475569'
                    }}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{job.attemptCount} / {job.maxAttempts}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{new Date(job.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
