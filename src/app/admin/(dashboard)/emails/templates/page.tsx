import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { deleteTemplate } from './actions';

export default async function TemplatesPage() {
  const templates = await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Email Templates</h1>
        <Link 
          href="/admin/emails/templates/new"
          style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
        >
          + Create Template
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Subject</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Channel</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b' }}>Last Updated</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No templates created yet.</td>
              </tr>
            ) : (
              templates.map(tpl => (
                <tr key={tpl.id.toString()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{tpl.name}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{tpl.subject}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>
                      {tpl.channel}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#475569' }}>{tpl.updatedAt.toLocaleDateString()}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Link href={`/admin/emails/templates/${tpl.id}`} style={{ color: '#2563eb', fontWeight: '500', marginRight: '16px' }}>Edit</Link>
                    <form action={async () => {
                      'use server';
                      await deleteTemplate(tpl.id.toString());
                    }} style={{ display: 'inline' }}>
                      <button type="submit" style={{ color: '#ef4444', background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Delete</button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
