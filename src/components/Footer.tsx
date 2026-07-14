'use client';

import Link from "next/link";

export function Footer({ settings }: { settings: any }) {
  return (
    <footer className="premium-footer">
      <div className="container">
        
        <div className="premium-footer-grid">
          {/* Column 1: Brand & Socials */}
          <div>
            <Link href="/" className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <img src="/logo.jpg" alt={settings.storeName || "SexToys Lovers"} style={{ height: '70px', width: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary, #D63062)' }} />
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{settings.storeName || "SexToys Lovers"}</span>
            </Link>
            <p className="footer-desc">
              {settings.storeDescription || "Your premium destination for luxury adult toys and intimate wellness products. Fast shipping, discrete packaging, and 24/7 support."}
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

            {/* Trustpilot Widget */}
            <a href="https://www.trustpilot.com/review/sextoyslovers.com" target="_blank" rel="noopener noreferrer" className="trustpilot-widget" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 200 200" width="20" height="20" fill="#00b67a">
                  <path d="M100 12.443l25.86 52.392 57.818 8.403-41.839 40.781 9.877 57.587-51.716-27.19-51.716 27.19 9.877-57.587-41.839-40.781 57.818-8.403z"/>
                </svg>
                <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.05em' }}>Trustpilot</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ width: '20px', height: '20px', backgroundColor: '#00b67a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>TrustScore 4.9 | 1,280 reviews</span>
            </a>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="footer-heading">Shop Categories</h4>
            <ul className="footer-links-list">
              <li><Link href="/category/vibrators">Vibrators</Link></li>
              <li><Link href="/category/dongs-and-dildos">Dildos & Dongs</Link></li>
              <li><Link href="/category/anal-toys">Anal Toys</Link></li>
              <li><Link href="/category/lubes-and-lotions">Lubes & Lotions</Link></li>
              <li><Link href="/category/bdsm">BDSM & Bondage</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links-list">
              <li><Link href="/contact">Help Center</Link></li>
              <li><Link href="/account/orders">Track Order</Link></li>
              <li><Link href="/returns">Returns Policy</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
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
          <p className="footer-copyright">© {new Date().getFullYear()} {settings.storeName || "SexToys Lovers"}. All rights reserved.</p>
          
          <div className="footer-payments">
            <div className="footer-payment-icon" aria-label="Visa">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <div className="footer-payment-icon" aria-label="Mastercard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="12" r="5"></circle><circle cx="16" cy="12" r="5"></circle></svg>
            </div>
            <div className="footer-payment-icon" aria-label="Apple Pay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.176 15.688c-.686.043-1.638-.344-2.476-.344-.816 0-1.614.344-2.193.364-1.29.044-2.433-.75-3.098-1.914-1.353-2.355-.13-5.834 1.18-7.72 .645-.922 1.637-1.503 2.69-1.545 1.05-.044 2.016.685 2.68.685.644 0 1.846-.856 3.097-.73 1.288.13 2.446.643 3.11 1.608-2.618 1.524-2.167 5.152.452 6.138-.602 1.504-1.74 3.22-3.442 3.458zM15.4 7.234c.58-1.008.536-2.144-.13-3.023-1.072.064-2.296.75-2.9 1.76-.58.986-.708 2.08-.108 2.937 1.16-.02 2.404-.75 3.138-1.674z"></path></svg>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
