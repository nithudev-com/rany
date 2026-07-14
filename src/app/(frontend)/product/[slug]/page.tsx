import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/money";
import { productJsonLd, siteUrl, faqJsonLd } from "@/lib/seo";
import { getProductBySlug, getTopProductSlugs } from "@/services/products";
import { ViewTracker } from "../components/ViewTracker";
import { WishlistButton } from "../components/WishlistButton";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductTabs } from "@/components/ProductTabs";
import { ProductActionBox } from "../components/ProductActionBox";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getTopProductSlugs(1000);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.seoTitle || `${product.title} | Buy Online`,
    description: product.seoDescription || product.shortDescription || `Buy ${product.title} online.`,
    alternates: {
      canonical: product.canonicalUrl || siteUrl(`/product/${product.slug}`)
    },
    openGraph: {
      title: product.seoTitle || product.title,
      description: product.seoDescription || product.shortDescription || product.title,
      images: product.mainImage ? [product.mainImage] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seoTitle || product.title,
      description: product.seoDescription || product.shortDescription || product.title,
      images: product.mainImage ? [product.mainImage] : [],
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product] = await Promise.all([
    getProductBySlug(slug)
  ]);

  if (!product) notFound();

  // Related Products Query
  const relatedProducts = product.categoryId ? await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, status: 'ACTIVE' },
    take: 4,
    select: { id: true, title: true, slug: true, mainImage: true, basePrice: true, salePrice: true }
  }) : [];

  const jsonLd = productJsonLd(product);
  const faqSchema = faqJsonLd(product.faq);

  const faqs = Array.isArray(product.faq) ? product.faq : [];
  
  // Safe parsing for JSON fields
  const features = Array.isArray(product.features) ? product.features : [];
  const benefits = Array.isArray(product.benefits) ? product.benefits : [];
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const specs = product.specifications && typeof product.specifications === 'object' ? product.specifications as Record<string, string> : null;
  const details = Array.isArray(product.details) ? product.details : [];
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : (product.mainImage ? [{ imageUrl: product.mainImage, altText: product.title }] : []);
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const relatedBlogs = Array.isArray(product.blogs) ? product.blogs : [];

  // Calculate discount percentage
  let discountPercentage = 0;
  if (product.salePrice && Number(product.basePrice) > 0) {
    discountPercentage = Math.round(((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100);
  }

  const currentUrl = siteUrl(`/product/${product.slug}`);



  return (
    <main className="container" style={{ paddingBottom: '120px', paddingTop: '20px', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-only-title { display: none; }
        .desktop-only-title { display: block; }
        @media (max-width: 1024px) {
          .pdp-grid { grid-template-columns: 1fr 1fr !important; }
          .pdp-sidebar { grid-column: 1 / -1; }
        }
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr !important; }
          .pdp-sticky-gallery { position: static !important; }
          .mobile-only-title { display: block; margin-bottom: 24px; }
          .desktop-only-title { display: none !important; }
        }
        
        /* Farmart specific styles */
        .farmart-meta-item { display: flex; gap: 8px; color: #475569; font-size: 14px; margin-bottom: 8px; }
        .farmart-meta-item strong { color: #0f172a; font-weight: 700; width: 80px; }
        
        .farmart-sidebar-card { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
        .farmart-sidebar-icon { color: #f59e0b; flex-shrink: 0; }
        .farmart-sidebar-title { font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 4px; }
        .farmart-sidebar-desc { color: #64748b; font-size: 13px; line-height: 1.5; }

        .bottom-cta {
          position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(16px); border-top: 1px solid rgba(226, 232, 240, 0.8); padding: 16px;
          display: flex; justify-content: space-between; align-items: center; z-index: 100;
          transform: translateY(100%); animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 1.5s;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
        }
        @keyframes slideUp { to { transform: translateY(0); } }
      `}} />

      {/* Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      
      <ViewTracker productId={product.id.toString()} />

      {/* Interactive Breadcrumbs */}
      <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
        <span>/</span>
        {product.category ? (
          <Link href={`/category/${product.category.slug}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>{product.category.name}</Link>
        ) : (
          <span>Product</span>
        )}
        {product.brand && (
          <>
            <span>/</span>
            <Link href={`/brand/${product.brand.slug}`} style={{ color: '#D63062', textDecoration: 'none', fontWeight: 600 }}>{product.brand.name}</Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: '#94a3b8' }}>{product.title}</span>
      </nav>

      {/* MOBILE ONLY TITLE */}
      <div className="mobile-only-title">
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: "-0.04em", marginBottom: '12px', lineHeight: 1.1, color: '#0f172a' }}>
          {product.title}
        </h1>
      </div>

      <div className="pdp-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr 320px", gap: '48px', marginBottom: '60px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Gallery */}
        <ProductGallery images={images} />

        {/* CENTER COLUMN: Core Details */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="desktop-only-title">
            <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: "-0.04em", marginBottom: '12px', lineHeight: 1.1, color: '#0f172a' }}>
              {product.title}
            </h1>
          </div>

          {/* Ratings Inline */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[1,2,3,4,5].map(star => <svg key={star} width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>({reviews.length})</span>
              </div>
            </div>
          )}

          <ProductActionBox product={product} />

          {/* Meta Data */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            {product.category && (
              <div className="farmart-meta-item">
                <strong>Category:</strong> <Link href={`/category/${product.category.slug}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{product.category.name}</Link>
              </div>
            )}
            {product.brand && (
              <div className="farmart-meta-item">
                <strong>Brand:</strong> <Link href={`/brand/${product.brand.slug}`} style={{ color: '#D63062', textDecoration: 'none' }}>{product.brand.name}</Link>
              </div>
            )}
            {tags.length > 0 && (
              <div className="farmart-meta-item">
                <strong>Tags:</strong> <span>{tags.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Social Share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginRight: '8px' }}>Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l11.733 16h4.267l-11.733-16z M4 20l6.768-6.768 M20 4l-6.768 6.768"></path></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>

        </section>

        {/* RIGHT COLUMN: Sidebar */}
        <aside className="pdp-sidebar" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          
          <div className="farmart-sidebar-card">
            <svg className="farmart-sidebar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            <div>
              <div className="farmart-sidebar-title">Free Shipping</div>
              <div className="farmart-sidebar-desc">For all orders over $100. Standard delivery applies to international regions.</div>
            </div>
          </div>

          <div className="farmart-sidebar-card">
            <svg className="farmart-sidebar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <div>
              <div className="farmart-sidebar-title">1 & 1 Returns</div>
              <div className="farmart-sidebar-desc">Cancellation after 1 day. Secure exchange conditions available.</div>
            </div>
          </div>

          <div className="farmart-sidebar-card">
            <svg className="farmart-sidebar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <div>
              <div className="farmart-sidebar-title">Secure Payment</div>
              <div className="farmart-sidebar-desc">Guarantee secure payments across all platforms.</div>
            </div>
          </div>

          {/* Secure Payment Badges */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="40" height="24" viewBox="0 0 40 24" fill="#0f172a"><rect width="40" height="24" rx="4" fill="#cbd5e1"/><text x="20" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#64748b">VISA</text></svg>
            <svg width="40" height="24" viewBox="0 0 40 24" fill="#0f172a"><rect width="40" height="24" rx="4" fill="#cbd5e1"/><text x="20" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#64748b">MC</text></svg>
            <svg width="40" height="24" viewBox="0 0 40 24" fill="#0f172a"><rect width="40" height="24" rx="4" fill="#cbd5e1"/><text x="20" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#64748b">AMEX</text></svg>
          </div>

          {/* Smart Video Player */}
          {product.videoUrl && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D63062" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Product Video
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                {(() => {
                  const url = product.videoUrl as string;
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('youtu.be/')[1]?.split('?')[0];
                    return <iframe width="100%" height="100%" style={{ border: 'none' }} src={`https://www.youtube.com/embed/${videoId}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
                  }
                  if (url.includes('vimeo.com')) {
                    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                    return <iframe width="100%" height="100%" style={{ border: 'none' }} src={`https://player.vimeo.com/video/${videoId}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>;
                  }
                  if (url.includes('pornhub.com')) {
                    const videoKey = url.includes('viewkey=') ? url.split('viewkey=')[1]?.split('&')[0] : url.split('embed/')[1];
                    if (videoKey) {
                      return <iframe width="100%" height="100%" style={{ border: 'none' }} src={`https://www.pornhub.com/embed/${videoKey}`} frameBorder="0" allowFullScreen></iframe>;
                    }
                  }
                  if (url.endsWith('.mp4') || url.includes('.mp4')) {
                    return <video width="100%" height="100%" style={{ objectFit: 'cover' }} controls preload="metadata"><source src={url} type="video/mp4" />Your browser does not support the video tag.</video>;
                  }
                  return <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>View Video</a>;
                })()}
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* BOTTOM TABS SECTION */}
      <ProductTabs 
        productId={product.id.toString()} 
        reviewsCount={reviews.length}
        hasFaqs={faqs.length > 0}
        hasDetails={details.length > 0}
        detailsNode={
          <div style={{ display: 'grid', gap: '12px' }}>
            {details.map((d: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', padding: '12px 16px', background: idx % 2 === 0 ? '#f8fafc' : '#ffffff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '150px', fontWeight: 800, color: '#0f172a', flexShrink: 0 }}>{d.key}</div>
                <div style={{ color: '#475569', lineHeight: 1.6 }}>{d.value}</div>
              </div>
            ))}
          </div>
        }
        descriptionNode={
          <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '16px' }}>
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p>No full description available for this product.</p>
            )}
          </div>
        }
        reviewsListNode={
          reviews.length > 0 ? (
            <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
              {reviews.map(review => (
                <div key={review.id.toString()} style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '8px' }}>
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="16" height="16" fill={star <= review.rating ? 'currentColor' : '#cbd5e1'} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{review.title}</h4>
                      <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{review.body}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{review.author || 'Anonymous'}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '8px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified Buyer
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '48px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>No reviews yet</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Be the first to review this product!</p>
            </div>
          )
        }
        faqsNode={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {faqs.map((faq: any, index: number) => (
              <details key={index} style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 0', cursor: 'pointer' }}>
                <summary style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', outline: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.question}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <p style={{ margin: '12px 0 0 0', color: '#475569', lineHeight: '1.6', fontSize: '14px', paddingRight: '24px' }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        }
      />

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '80px', borderTop: '1px solid #e2e8f0', paddingTop: '80px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '32px', color: '#0f172a' }}>You May Also Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
            {await Promise.all(relatedProducts.map(async (rp) => (
              <Link key={rp.id.toString()} href={`/product/${rp.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="related-card">
                  <div style={{ aspectRatio: '1/1', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    {rp.mainImage && <Image src={rp.mainImage} alt={rp.title} fill style={{ objectFit: 'cover' }} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rp.title}</h3>
                    <div style={{ fontWeight: 900, color: rp.salePrice ? '#D63062' : '#0f172a' }}>
                      {await formatPrice((rp.salePrice || rp.basePrice).toString())}
                    </div>
                  </div>
                </div>
              </Link>
            )))}
          </div>
        </div>
      )}

      {/* RELATED AI BLOGS (Custom styled grid from image) */}
      {relatedBlogs.length > 0 && (
        <div style={{ marginTop: '80px', borderTop: '1px solid #e2e8f0', paddingTop: '80px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '32px', color: '#0f172a' }}>Related Articles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {relatedBlogs.map((blog: any) => (
              <Link key={blog.id.toString()} href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                <div 
                  className="related-blog-card"
                  style={{ 
                    background: '#fcfbfe', // Very light purple background
                    border: '1px solid #d8b4e2', // Light purple border 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    transition: 'all 0.2s', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%' 
                  }}
                >
                  <div style={{ aspectRatio: '16/9', background: '#f1f5f9', position: 'relative' }}>
                    {blog.coverImage ? (
                       <Image src={blog.coverImage} alt={blog.title} fill style={{ objectFit: 'cover' }} />
                    ) : product.mainImage ? (
                       <Image src={product.mainImage} alt={blog.title} fill style={{ objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#8b5cf6', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {blog.title.length > 55 ? `${blog.title.substring(0, 55)}...` : blog.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#a78bfa', margin: '0 0 20px 0', lineHeight: 1.5, flex: 1 }}>
                      {blog.excerpt ? (blog.excerpt.length > 100 ? `${blog.excerpt.substring(0, 100)}...` : blog.excerpt) : ''}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      <span>Read More</span>
                      <span>By SEXTOYS LOVERS</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM CTA BAR (Mobile mostly, but visible at bottom) */}
      <div className="bottom-cta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {product.mainImage && <Image src={product.mainImage} alt="thumb" width={48} height={48} style={{ borderRadius: '8px', objectFit: 'cover' }} />}
          <div style={{ display: 'none' }} className="cta-text">
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{product.title}</div>
            <div style={{ fontWeight: 900, color: '#D63062' }}>{await formatPrice((product.salePrice || product.basePrice).toString())}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '150px' }}>
            <AddToCartButton productId={product.id.toString()} outOfStock={product.stockQuantity <= 0} />
          </div>
          <div style={{ width: '150px' }}>
            <BuyNowButton productId={product.id.toString()} outOfStock={product.stockQuantity <= 0} />
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 600px) { .cta-text { display: block !important; } }
        .related-card:hover { border-color: #D63062; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(214,48,98,0.1); }
        .related-blog-card:hover { border-color: #a855f7 !important; transform: translateY(-4px); box-shadow: 0 10px 20px rgba(168, 85, 247, 0.15); }
      `}} />
    </main>
  );
}
