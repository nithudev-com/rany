import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { articleJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug, isPublished: true }
  });

  if (!post) return {};

  return {
    title: `${post.title} | SpeedCommerce Blog`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug, isPublished: true },
    include: {
      sourceProduct: {
        select: { title: true, slug: true, mainImage: true, basePrice: true, salePrice: true }
      }
    }
  });

  if (!post) return notFound();

  // Fix: Remove any accidentally saved JSON metadata paragraphs that were showing up as useless text
  let safeContent = post.content
    .replace(/<p>\s*\{\s*"seoTitle"[\s\S]*?\}\s*<\/p>/g, '')
    .replace(/<p>\s*\{\s*"@context"[\s\S]*?\}\s*<\/p>/g, '');

  const articleSchema = articleJsonLd(post, post.sourceProduct);
  const faqSchema = faqJsonLd(post.faqs);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` }
  ]);

  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', paddingBottom: '120px' }}>
      
      {/* Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
      
      {/* Premium Hero Header */}
      <section style={{ 
        position: 'relative', 
        paddingTop: '100px', 
        paddingBottom: post.coverImage ? '220px' : '100px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #111111 0%, #09090b 100%)',
        overflow: 'hidden'
      }}>
        {/* Abstract Glow Effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: '#E0A96D', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: '#D63062', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <Link href="/blog" style={{ 
            color: '#E0A96D', 
            fontSize: '13px', 
            fontWeight: '600', 
            textDecoration: 'none', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '40px',
            padding: '8px 16px',
            background: 'rgba(224, 169, 109, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(224, 169, 109, 0.2)'
          }}>
            <span style={{ transform: 'translateX(-2px)' }}>←</span> Back to Journal
          </Link>

          <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px' }}>
            {post.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 64px)', 
            fontWeight: '900', 
            margin: '0 auto', 
            maxWidth: '900px', 
            lineHeight: 1.15, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ margin: '32px auto 0', maxWidth: '700px', fontSize: '18px', color: '#94a3b8', lineHeight: 1.6 }}>
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container" style={{ marginTop: post.coverImage ? '-160px' : '0', position: 'relative', zIndex: 20 }}>
        
        {post.coverImage && (
          <div style={{ 
            width: '100%', 
            maxWidth: '1100px', 
            margin: '0 auto 64px', 
            aspectRatio: '21/9', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
            position: 'relative'
          }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%)' }} />
          </div>
        )}

        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          background: '#111111', 
          padding: 'clamp(32px, 5vw, 64px)', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)' 
        }} className="blog-content">
          <style dangerouslySetInnerHTML={{ __html: `
            .blog-content { 
              font-family: 'Inter', system-ui, sans-serif; 
              color: #cbd5e1; 
              line-height: 1.8; 
              font-size: 19px; 
            }
            .blog-content h2 { 
              color: #ffffff; 
              font-size: 32px; 
              font-weight: 800; 
              margin-top: 56px; 
              margin-bottom: 24px; 
              letter-spacing: -0.02em; 
              border-bottom: 1px solid rgba(255,255,255,0.1);
              padding-bottom: 12px;
            }
            .blog-content h3 { 
              color: #f8fafc; 
              font-size: 24px; 
              font-weight: 700; 
              margin-top: 40px; 
              margin-bottom: 16px; 
            }
            .blog-content p { 
              margin-bottom: 28px; 
            }
            .blog-content ul, .blog-content ol { 
              margin-bottom: 28px; 
              padding-left: 24px; 
            }
            .blog-content li { 
              margin-bottom: 12px; 
            }
            .blog-content a { 
              color: #E0A96D; 
              font-weight: 600; 
              text-decoration: none; 
              border-bottom: 2px solid rgba(224, 169, 109, 0.3);
              transition: all 0.2s ease;
            }
            .blog-content a:hover {
              border-bottom-color: #E0A96D;
              color: #fff;
            }
            .blog-content blockquote { 
              border-left: 4px solid #E0A96D; 
              background: rgba(224, 169, 109, 0.05);
              padding: 24px 32px; 
              margin: 40px 0; 
              font-style: italic; 
              color: #f8fafc; 
              font-size: 22px; 
              border-radius: 0 12px 12px 0;
            }
            .blog-content img {
              border-radius: 16px;
              box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            .blog-content .faq-section {
              background: #18181b !important;
              border: 1px solid rgba(255,255,255,0.05) !important;
              border-radius: 16px !important;
              padding: 32px !important;
            }
            .blog-content .faq-section h3 {
              color: #E0A96D !important;
              border-bottom-color: rgba(224,169,109,0.2) !important;
              margin-top: 0 !important;
            }
            .blog-content .faq-item h4 {
              color: #f8fafc !important;
            }
            .blog-content .faq-item {
              border-bottom-color: rgba(255,255,255,0.05) !important;
            }
            .blog-content .callout-box {
              background: linear-gradient(135deg, rgba(224, 169, 109, 0.1) 0%, rgba(224, 169, 109, 0.05) 100%) !important;
              border-left: 4px solid #E0A96D !important;
              color: #f8fafc !important;
            }
            
            @media (max-width: 640px) {
              .blog-content { 
                padding: 24px; 
                font-size: 17px; 
              }
              .blog-content h2 { font-size: 28px; }
            }
          `}} />
          
          <div dangerouslySetInnerHTML={{ __html: safeContent }} />
          
          {/* Render FAQs if they exist */}
          {(() => {
            const faqsList = post.faqs && Array.isArray(post.faqs) ? (post.faqs as any[]) : [];
            if (faqsList.length === 0) return null;
            return (
              <div className="faq-section" style={{ marginTop: '48px', padding: '32px', background: '#18181b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#E0A96D', marginTop: '0', marginBottom: '24px', borderBottom: '1px solid rgba(224,169,109,0.2)', paddingBottom: '16px', fontSize: '24px', fontWeight: 700 }}>
                  Frequently Asked Questions
                </h3>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {faqsList.map((faq: any, idx: number) => (
                    <div key={idx} className="faq-item" style={{ paddingBottom: '16px', borderBottom: idx < faqsList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <h4 style={{ color: '#f8fafc', fontSize: '18px', fontWeight: 700, margin: '0 0 12px 0' }}>{faq.question}</h4>
                      <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Featured Product Widget */}
        {post.sourceProduct && (
          <div style={{ maxWidth: '800px', margin: '48px auto 0', padding: '32px', background: 'linear-gradient(135deg, #18181b 0%, #111111 100%)', borderRadius: '24px', border: '1px solid rgba(224, 169, 109, 0.2)', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {post.sourceProduct.mainImage && (
              <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', position: 'relative' }}>
                <img src={post.sourceProduct.mainImage} alt={post.sourceProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#E0A96D', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Featured Product</div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', lineHeight: 1.3 }}>{post.sourceProduct.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: post.sourceProduct.salePrice ? '#D63062' : '#ffffff' }}>
                  ${Number(post.sourceProduct.salePrice || post.sourceProduct.basePrice).toFixed(2)}
                </div>
                <Link href={`/product/${post.sourceProduct.slug}`} style={{ background: 'linear-gradient(135deg, #E0A96D 0%, #b88655 100%)', color: '#09090b', padding: '12px 32px', borderRadius: '30px', fontWeight: 800, textDecoration: 'none', fontSize: '15px', transition: 'all 0.2s', display: 'inline-block' }}>
                  Shop Now →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
