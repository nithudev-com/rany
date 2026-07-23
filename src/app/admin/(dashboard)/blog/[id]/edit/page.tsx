import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BlogForm } from '../../BlogForm';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let id: string;
  try {
    id = resolvedParams.id;
  } catch {
    return notFound();
  }

  const post = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!post) return notFound();

  // Convert BigInt for Client Component
  const safePost = JSON.parse(JSON.stringify(post, (k, v) => typeof v === 'bigint' ? v.toString() : v));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <Link href="/admin/blog" style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
          ← Back to Posts
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', margin: '0' }}>Edit Article</h1>
      </div>
      <BlogForm post={safePost} />
    </div>
  );
}
