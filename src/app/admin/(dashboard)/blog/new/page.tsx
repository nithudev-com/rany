import Link from 'next/link';
import { BlogForm } from '../BlogForm';

export const dynamic = 'force-dynamic';

export default function NewBlogPostPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Link href="/admin/blog" style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
          ← Back to Posts
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', margin: '0' }}>Write New Article</h1>
      </div>
      <BlogForm />
    </div>
  );
}
