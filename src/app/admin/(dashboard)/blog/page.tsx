import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DeletePostButton } from './DeletePostButton';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', margin: '0 0 8px' }}>Blog Posts</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your storefront articles.</p>
        </div>
        <Link href="/admin/blog/new" className="dashboard-btn-primary" style={{ background: '#111111', color: '#fff' }}>
          + New Post
        </Link>
      </div>

      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Post</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No blog posts yet. Write your first article!
                </td>
              </tr>
            )}
            {posts.map(post => (
              <tr key={post.id.toString()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{post.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>/blog/{post.slug}</div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {post.isPublished ? (
                    <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>PUBLISHED</span>
                  ) : (
                    <span style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>DRAFT</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                  {post.createdAt.toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/blog/${post.id.toString()}/edit`} style={{ padding: '6px 12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none' }}>
                      Edit
                    </Link>
                    <DeletePostButton id={post.id.toString()} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
