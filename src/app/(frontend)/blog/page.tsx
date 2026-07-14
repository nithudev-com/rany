import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: "Blog | SexToys Lovers Insights",
  description: "Read our latest articles, guides, and ecommerce insights.",
  alternates: {
    canonical: siteUrl("/blog"),
  },
};

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
      <section style={{ background: '#09090b', color: '#fff', padding: '100px 20px 140px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-0.02em' }}>The Journal</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', margin: '0', maxWidth: '600px', marginInline: 'auto' }}>
          Latest news, announcements, and deep dives from our team.
        </p>
      </section>

      <div className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        {posts.length === 0 ? (
          <div style={{ padding: '60px', background: '#fff', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#64748b', fontSize: '20px' }}>No articles published yet. Check back soon!</h2>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {posts.map(post => (
              <Link key={post.id.toString()} href={`/blog/${post.slug}`} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} className="blog-card-hover">
                <style dangerouslySetInnerHTML={{ __html: `.blog-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }` }} />
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#e2e8f0', position: 'relative' }}>
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #FF0080, #7928CA)', opacity: 0.8 }} />
                  )}
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#D63062', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, margin: '0 0 20px', flex: 1 }}>
                    {post.excerpt || (post.content.substring(0, 120).replace(/<[^>]+>/g, '') + '...')}
                  </p>
                  <div style={{ fontWeight: '700', color: '#111111', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Read Article <span style={{ color: '#D63062' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
