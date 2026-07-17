'use client';

import Link from "next/link";
import Image from "next/image";

export function Footer({ settings }: { settings: any }) {
  return (
    <footer className="premium-footer">
      <div className="container">
        
        <div className="premium-footer-grid">
          {/* Column 1: Brand & Socials */}
          <div>
            <Link prefetch={true} href="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <Image src="/logo.png" alt="Rany.uk Logo" width={100} height={40} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{settings.storeName || "Rany.uk"}</span>
            </Link>
            <p className="footer-desc">
              {settings.storeDescription || "Your premium destination for bespoke luxury fashion and tailoring. Exquisite craftsmanship, perfect fits, and timeless designs."}
            </p>
            <div className="footer-socials" style={{ marginBottom: '20px' }}>
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="X">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
            </div>

            {/* Google Reviews Widget */}
            <a href="https://g.page/ranyuk" target="_blank" rel="noopener noreferrer" className="google-reviews-widget" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', transition: 'all 0.3s ease', maxWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fff', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                </div>
                <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>Google Reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '15px', marginRight: '4px' }}>5.0</span>
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} viewBox="0 0 24 24" width="14" height="14" fill="#FBBC05">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Based on 142 reviews</span>
              <style>{`
                .google-reviews-widget:hover {
                  background: rgba(255,255,255,0.06) !important;
                  border-color: rgba(255,255,255,0.2) !important;
                  transform: translateY(-2px);
                }
              `}</style>
            </a>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="footer-heading">Shop Categories</h4>
            <ul className="footer-links-list">
              <li><Link prefetch={true} href="/category/bridal-wear">Bridal & Wedding</Link></li>
              <li><Link prefetch={true} href="/category/bespoke-suits">Bespoke Suits</Link></li>
              <li><Link prefetch={true} href="/category/evening-gowns">Evening Gowns</Link></li>
              <li><Link prefetch={true} href="/category/alterations">Expert Alterations</Link></li>
              <li><Link prefetch={true} href="/category/accessories">Accessories</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links-list">
              <li><Link prefetch={true} href="/contact">Help Center</Link></li>
              <li><Link prefetch={true} href="/account/orders">Track Order</Link></li>
              <li><Link prefetch={true} href="/contact">Contact Us</Link></li>
            </ul>
            <div style={{ marginTop: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>Studio:</strong><br />262B Upper Tooting Rd<br />London SW17 0DN, UK</p>
              <p style={{ margin: '0 0 0 0' }}><strong>Phone:</strong><br />+44 7507 549004</p>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="footer-heading">Stay Connected</h4>
            <p className="footer-desc" style={{ marginBottom: '0' }}>
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email..." className="footer-newsletter-input" required />
              <button type="submit" className="footer-newsletter-btn">Join</button>
            </form>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Payments */}
        <div className="premium-footer-bottom">
          <p className="footer-copyright">© {new Date().getFullYear()} {settings.storeName || "Rany.uk"}. All rights reserved.</p>
          
          <div className="footer-payments" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', marginRight: '4px' }}>Secure Payments:</span>
            {/* Visa */}
            <div className="footer-payment-icon" role="img" aria-label="Visa" style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '900', fontSize: '12px', fontStyle: 'italic', color: '#1a1f71', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              VISA
            </div>
            {/* Mastercard */}
            <div className="footer-payment-icon" role="img" aria-label="Mastercard" style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="12" r="6" fill="#eb001b" fillOpacity="0.9"></circle><circle cx="16" cy="12" r="6" fill="#f79e1b" fillOpacity="0.9"></circle></svg>
            </div>
            {/* Amex */}
            <div className="footer-payment-icon" role="img" aria-label="American Express" style={{ background: '#2671B9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px', color: '#fff', display: 'flex', alignItems: 'center', border: '1px solid #1c558c' }}>
              AMEX
            </div>
            {/* GPay */}
            <div className="footer-payment-icon" role="img" aria-label="Google Pay" style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', fontSize: '12px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#4285f4', fontSize: '13px', fontWeight: '800' }}>G</span>Pay
            </div>
            {/* PayPal */}
            <div className="footer-payment-icon" role="img" aria-label="PayPal" style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', fontSize: '12px', color: '#003087', fontStyle: 'italic', display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              PayPal
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
