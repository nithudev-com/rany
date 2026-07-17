'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [brands, setBrands] = useState<{id: string, name: string, slug: string}[]>([]);

  useEffect(() => {
    fetch('/api/brands').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setBrands(data);
    }).catch(console.error);
  }, []);

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileDrawerOpen]);

  const applyFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.keys(newParams).forEach(key => {
      if (newParams[key]) {
        params.set(key, newParams[key]);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 on filter change
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ minPrice, maxPrice, brand });
    setIsMobileDrawerOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    applyFilters({ sort: newSort, brand });
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    applyFilters({ brand: newBrand });
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setBrand('');
    router.push(pathname);
    setIsMobileDrawerOpen(false);
  };

  const FilterContent = () => (
    <div className="filter-content-inner">
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>Sort By</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'newest', label: 'Newest Arrivals' },
            { id: 'price_asc', label: 'Price: Low to High' },
            { id: 'price_desc', label: 'Price: High to Low' },
          ].map(option => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.id)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '12px',
                background: sort === option.id ? '#1e293b' : '#f8fafc',
                color: sort === option.id ? '#ffffff' : '#475569',
                border: `1px solid ${sort === option.id ? '#1e293b' : '#e2e8f0'}`,
                fontWeight: sort === option.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>Filter by Brand</h3>
          <div style={{ position: 'relative' }}>
            <select
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                borderRadius: '12px',
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a' }}>Price Range</h3>
        <form onSubmit={handlePriceApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>£</span>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: '#f8fafc' }}
              />
            </div>
            <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>-</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>£</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', background: '#f8fafc' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={clearFilters}
              style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
            >
              Clear
            </button>
            <button 
              type="submit" 
              style={{ flex: 2, padding: '14px', background: '#D63062', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', boxShadow: '0 4px 14px rgba(214, 48, 98, 0.3)' }}
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* Desktop Sidebar (hidden on mobile) */
        .desktop-filter-wrapper {
          display: none;
        }

        /* Mobile Floating Button (hidden on desktop) */
        .mobile-filter-fab {
          position: fixed;
          bottom: 90px; /* Above mobile bottom nav */
          left: 50%;
          transform: translateX(-50%);
          background: #111111;
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          z-index: 40;
          border: none;
          cursor: pointer;
        }

        /* Mobile Drawer Overlay */
        .mobile-drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .mobile-drawer-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Drawer Content */
        .mobile-drawer-content {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #ffffff;
          border-radius: 24px 24px 0 0;
          padding: 24px;
          z-index: 101;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        .mobile-drawer-content.open {
          transform: translateY(0);
        }

        .drawer-drag-handle {
          width: 40px;
          height: 4px;
          background: #cbd5e1;
          border-radius: 4px;
          margin: 0 auto 24px auto;
        }

        @media (min-width: 768px) {
          .desktop-filter-wrapper {
            display: block;
            width: 280px;
            position: sticky;
            top: 100px;
          }
          .mobile-filter-fab {
            display: none !important;
          }
          .mobile-drawer-overlay, .mobile-drawer-content {
            display: none !important;
          }
        }
      `}</style>

      {/* --- DESKTOP VIEW --- */}
      <div className="desktop-filter-wrapper">
        <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <FilterContent />
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <button className="mobile-filter-fab" onClick={() => setIsMobileDrawerOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Filter & Sort
      </button>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer-overlay ${isMobileDrawerOpen ? 'open' : ''}`} onClick={() => setIsMobileDrawerOpen(false)} />
      <div className={`mobile-drawer-content ${isMobileDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-drag-handle" />
        <FilterContent />
      </div>
    </>
  );
}
