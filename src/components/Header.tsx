'use client';

import Link from "next/link";
import { useState } from "react";
import { AutocompleteSearch } from "./AutocompleteSearch";
import { MegaMenu } from "./MegaMenu";
import { useCartContext } from "@/context/CartContext";

export function Header({ settings, categories = [] }: { settings: any, categories?: any[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const cart = useCartContext();

  const totalCartItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* --- DESKTOP HEADER --- */}
      <header className="mega-header-wrapper desktop-header">
        
        {/* 1. Top Announcement Bar */}
        <div className="top-announcement-bar">
          <div>🔥 Free standard shipping on all orders over $100!</div>
          <div className="top-bar-links">
            <Link href="/contact">Store Locator</Link>
            <Link href="/account/orders">Track Order</Link>
            <Link href="/contact">Help Center</Link>
            <span style={{ marginLeft: '16px', color: '#cbd5e1' }}>|</span>
            <span style={{ marginLeft: '16px' }}>ENG / USD</span>
          </div>
        </div>

        {/* 2. Main Hub */}
        <div className="main-header-hub">
          <Link href="/" className="mega-logo">{settings.storeName || "SexToys Lovers"}</Link>
          
          <AutocompleteSearch isMobile={false} categories={categories} />

          <div className="header-action-group">
            <Link href="/account" className="header-action-item">
              <div className="header-action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span>Account</span>
            </Link>
            
            <Link href="/account/wishlist" className="header-action-item">
              <div className="header-action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span className="header-badge">0</span>
              </div>
              <span>Wishlist</span>
            </Link>

            <button onClick={cart.openCart} className="header-action-item" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }}>
              <div className="header-action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                {cart.isLoaded && totalCartItems > 0 && <span className="header-badge">{totalCartItems}</span>}
              </div>
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* 3. Bottom Navigation */}
        <nav className="bottom-nav-bar" style={{ position: 'relative' }}>
          <button className="all-categories-btn" onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            All Departments
          </button>
          <div className="bottom-nav-links">
            <Link href="/deals">Today's Deals</Link>

            <Link href="/new-releases">New Releases</Link>
            <Link href="/brand">Brands</Link>
            <Link href="/category">Categories</Link>
            <Link href="/contact">Customer Service</Link>
          </div>
          <MegaMenu 
            categories={categories} 
            isOpen={isMegaMenuOpen} 
            onClose={() => setIsMegaMenuOpen(false)} 
          />
        </nav>
      </header>

      {/* --- MOBILE HEADER --- */}
      <header className="mobile-header mobile-header-wrapper">
        <div className="mobile-header-top">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <Link href="/" className="mobile-logo">{settings.storeName || "SexToys Lovers"}</Link>

          <button onClick={cart.openCart} className="header-action-item" style={{ gap: '0', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <div className="header-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              {cart.isLoaded && totalCartItems > 0 && <span className="header-badge" style={{ right: '-6px' }}>{totalCartItems}</span>}
            </div>
          </button>
        </div>

        <AutocompleteSearch isMobile={true} categories={categories} />
      </header>

      {/* --- MOBILE DRAWER (SIDEBAR) --- */}
      <div 
        className={`mobile-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#D63062', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>Hello, Guest</div>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: '13px', color: '#D63062', textDecoration: 'none' }}>Sign In</Link>
            </div>
          </div>
          <button className="mobile-drawer-close" onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="mobile-drawer-section">
          <h3 className="mobile-drawer-title">Shop by Category</h3>
          <div className="mobile-drawer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map((cat: any) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isExpanded = expandedCategory === cat.slug;

              return (
                <div key={cat.slug} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link 
                      href={`/category/${cat.slug}`} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="mobile-drawer-link"
                      style={{ flex: 1, padding: '12px 0' }}
                    >
                      {cat.name}
                    </Link>
                    {hasChildren && (
                      <button 
                        onClick={() => setExpandedCategory(isExpanded ? null : cat.slug)}
                        style={{ padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg 
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {hasChildren && isExpanded && (
                    <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', borderLeft: '2px solid #f1f5f9', marginLeft: '8px', marginTop: '4px', marginBottom: '8px' }}>
                      {cat.children.map((child: any) => (
                        <Link 
                          key={child.slug}
                          href={`/category/${child.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{ padding: '10px 0', color: '#475569', fontSize: '14px', textDecoration: 'none' }}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mobile-drawer-section">
          <h3 className="mobile-drawer-title">My Account</h3>
          <div className="mobile-drawer-links">
            <Link href="/account/orders" onClick={() => setIsMobileMenuOpen(false)} className="mobile-drawer-link">Your Orders</Link>
            <Link href="/account/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="mobile-drawer-link">Your Wishlist</Link>
            <Link href="/account/profile" onClick={() => setIsMobileMenuOpen(false)} className="mobile-drawer-link">Account Settings</Link>
          </div>
        </div>

        <div className="mobile-drawer-section" style={{ borderBottom: 'none' }}>
          <div className="mobile-drawer-links">
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="mobile-drawer-link">Customer Service</Link>
          </div>
        </div>
      </div>
    </>
  );
}
