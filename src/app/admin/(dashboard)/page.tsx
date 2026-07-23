'use no memo';
import { prisma } from "@/lib/prisma";
import DashboardInfo from "./dashboard-info";
import DeleteBatchButton from "./delete-batch-button";

import { Suspense } from 'react';

export const dynamic = 'force-dynamic';



async function DashboardStats() {
  const [productCount, categoryCount, brandCount, recentImports, statusGroups, unreadAdmin, registeredMessages, guestMessages] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.productImportBatch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.contactConversation.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.contactConversation.count({ where: { isReadByAdmin: false } }),
    prisma.contactConversation.count({ where: { customerId: { not: null } } }),
    prisma.contactConversation.count({ where: { guestToken: { not: null } } }),
  ]);

  const stats = Object.fromEntries(statusGroups.map(g => [g.status, g._count]));
  const newCount = stats['NEW'] || 0;
  const openCount = stats['OPEN'] || 0;
  const awaitingAdmin = stats['AWAITING_ADMIN'] || 0;
  const awaitingCustomer = stats['AWAITING_CUSTOMER'] || 0;
  const resolvedCount = stats['RESOLVED'] || 0;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', margin: '40px 0' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="muted" style={{ marginBottom: '8px' }}>Total Products</div>
          <div style={{ fontSize: '32px', fontWeight: '800' }}>{productCount}</div>
        </div>
        <div className="card" style={{ padding: '24px' }}>
          <div className="muted" style={{ marginBottom: '8px' }}>Total Categories</div>
          <div style={{ fontSize: '32px', fontWeight: '800' }}>{categoryCount}</div>
        </div>
        <div className="card" style={{ padding: '24px' }}>
          <div className="muted" style={{ marginBottom: '8px' }}>Total Brands</div>
          <div style={{ fontSize: '32px', fontWeight: '800' }}>{brandCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Support Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>New Messages</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#111111' }}>{newCount}</div>
          </div>
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600', marginBottom: '4px' }}>Unread by Admin</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#b91c1c' }}>{unreadAdmin}</div>
          </div>
          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600', marginBottom: '4px' }}>Open / Awaiting Admin</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8' }}>{openCount + awaitingAdmin}</div>
          </div>
          <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: '#d97706', fontWeight: '600', marginBottom: '4px' }}>Awaiting Customer</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>{awaitingCustomer}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
          <div style={{ flex: 1, fontSize: '14px' }}><strong>Registered Messages:</strong> {registeredMessages}</div>
          <div style={{ flex: 1, fontSize: '14px' }}><strong>Guest Messages:</strong> {guestMessages}</div>
          <div style={{ flex: 1, fontSize: '14px' }}><strong>Resolved:</strong> {resolvedCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Imports</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 0' }}>Batch ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Success</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentImports.map((batch) => (
              <tr key={batch.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>{batch.id.slice(0, 8)}...</td>
                <td>{batch.status}</td>
                <td>{batch.totalRows}</td>
                <td>{batch.successRows}</td>
                <td>{new Date(batch.createdAt).toLocaleDateString()}</td>
                <td>
                  <DeleteBatchButton batchId={batch.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <Suspense fallback={<div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', marginBottom: '32px' }}>Loading system info...</div>}>
        <DashboardInfo />
      </Suspense>
      
      <Suspense fallback={
        <div style={{ margin: '40px 0', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
          <h2>Loading Dashboard Data...</h2>
          <p className="muted">Please wait while we fetch the latest statistics.</p>
        </div>
      }>
        <DashboardStats />
      </Suspense>
    </div>
  );
}
