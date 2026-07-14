'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  children?: Category[];
}

interface MegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ categories, isOpen, onClose }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // When menu opens, default to the first category if none is active
  useEffect(() => {
    if (isOpen && !activeCategory && categories && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [isOpen, categories, activeCategory]);

  if (!isOpen) return null;

  const activeCatData = categories.find((c) => c.id === activeCategory);

  return (
    <>
      <style>{`
        /* Deep dark glassmorphism styling for Mega Menu */
        .mega-menu-overlay {
          position: fixed;
          top: 155px; /* Adjust based on header height */
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 6, 15, 0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 40;
        }

        .mega-menu-container {
          position: absolute;
          top: 100%;
          left: 24px;
          right: 24px;
          max-width: 1132px;
          margin: 0 auto;
          background: rgba(15, 10, 22, 0.98);
          border-radius: 0 0 24px 24px;
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(255, 62, 126, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-top: none;
          display: flex;
          min-height: 480px;
          z-index: 50;
          overflow: hidden;
          animation: slideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: scaleY(0.95); }
          to { opacity: 1; transform: scaleY(1); }
        }

        /* Sidebar settings */
        .mega-menu-sidebar {
          width: 280px;
          background: rgba(255, 255, 255, 0.01);
          padding: 20px 0;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          overflow-y: auto;
          max-height: calc(100vh - 180px);
        }

        .mega-menu-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .mega-menu-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .mega-menu-sidebar-item {
          padding: 14px 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          letter-spacing: 0.02em;
        }

        .mega-menu-sidebar-item a {
          display: block;
          width: 100%;
          color: inherit;
          text-decoration: none;
        }

        .mega-menu-sidebar-item:hover, .mega-menu-sidebar-item.active {
          background: rgba(255, 62, 126, 0.06);
          color: #ff3e7e;
          border-left: 4px solid #ff3e7e;
          box-shadow: inset 10px 0 20px rgba(255, 62, 126, 0.02);
        }

        /* Content Area settings */
        .mega-menu-content {
          flex: 1;
          padding: 36px;
          background: transparent;
          overflow-y: auto;
          max-height: calc(100vh - 180px);
        }

        .mega-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 36px 24px;
        }

        /* Staggered entry animation */
        @keyframes subcatFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mega-menu-subcat-group {
          display: flex;
          flex-direction: column;
          animation: subcatFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Subcategory Image Card Box */
        .mega-menu-subcat-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 14px;
        }

        .mega-menu-subcat-img-wrapper {
          width: 100%;
          aspect-ratio: 16 / 10;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mega-menu-subcat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .mega-menu-subcat-placeholder {
          font-size: 24px;
        }

        .mega-menu-subcat-card-title {
          font-size: 13px;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.3s;
        }

        .mega-menu-subcat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 62, 126, 0.4);
          box-shadow: 
            0 12px 24px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 62, 126, 0.15);
        }

        .mega-menu-subcat-card:hover .mega-menu-subcat-img {
          transform: scale(1.08);
        }

        .mega-menu-subcat-card:hover .mega-menu-subcat-card-title {
          color: #ff3e7e;
        }

        /* 3rd Level Links */
        .mega-menu-child-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-left: 8px;
        }

        .mega-menu-child-link {
          font-size: 14px;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .mega-menu-child-link:hover {
          color: #ff5e97;
          transform: translateX(4px);
        }

        .mega-menu-empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 380px;
          width: 100%;
          animation: subcatFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mega-menu-empty-card {
          display: flex;
          align-items: center;
          gap: 32px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 28px;
          max-width: 640px;
          width: 100%;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 768px) {
          .mega-menu-empty-card {
            flex-direction: column;
            text-align: center;
            gap: 20px;
          }
        }

        .mega-menu-empty-img-wrapper {
          width: 180px;
          height: 180px;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mega-menu-empty-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .mega-menu-empty-card:hover .mega-menu-empty-img {
          transform: scale(1.06);
        }

        .mega-menu-empty-placeholder {
          font-size: 40px;
        }

        .mega-menu-empty-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @media (max-width: 768px) {
          .mega-menu-empty-info {
            align-items: center;
          }
        }

        .mega-menu-empty-info h3 {
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          background: linear-gradient(90deg, #ff3e7e, #b862ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mega-menu-empty-info p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .mega-menu-shop-all {
          margin-top: 16px;
          display: inline-block;
          background: linear-gradient(135deg, #ff3e7e 0%, #b862ff 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 100px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 10px 20px rgba(255, 62, 126, 0.25);
          transition: all 0.3s;
        }

        .mega-menu-shop-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px rgba(255, 62, 126, 0.4);
        }
      `}</style>

      <div className="mega-menu-overlay" onClick={onClose} />
      <div className="mega-menu-container">
        <div className="mega-menu-sidebar">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`mega-menu-sidebar-item ${activeCategory === cat.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveCategory(cat.id)}
            >
              <Link href={`/category/${cat.slug}`} onClick={onClose}>
                {cat.name}
              </Link>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          ))}
        </div>
        <div className="mega-menu-content">
          {activeCatData?.children && activeCatData.children.length > 0 ? (
            <div className="mega-menu-grid">
              {activeCatData.children.map((subCat, index) => (
                <div 
                  key={subCat.id} 
                  className="mega-menu-subcat-group"
                  style={{ animationDelay: `${index * 0.015}s` }}
                >
                  <Link href={`/category/${subCat.slug}`} className="mega-menu-subcat-card" onClick={onClose}>
                    <div className="mega-menu-subcat-img-wrapper">
                      {subCat.image ? (
                        <img src={subCat.image} alt={subCat.name} className="mega-menu-subcat-img" />
                      ) : (
                        <div className="mega-menu-subcat-placeholder">🏷️</div>
                      )}
                    </div>
                    <span className="mega-menu-subcat-card-title">{subCat.name}</span>
                  </Link>
                  {subCat.children && subCat.children.length > 0 && (
                    <div className="mega-menu-child-links">
                      {subCat.children.map((child) => (
                        <Link key={child.id} href={`/category/${child.slug}`} className="mega-menu-child-link" onClick={onClose}>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mega-menu-empty-state">
              <div className="mega-menu-empty-card">
                <div className="mega-menu-empty-img-wrapper">
                  {activeCatData?.image ? (
                    <img src={activeCatData.image} alt={activeCatData.name} className="mega-menu-empty-img" />
                  ) : (
                    <div className="mega-menu-empty-placeholder">🏷️</div>
                  )}
                </div>
                <div className="mega-menu-empty-info">
                  <h3>{activeCatData?.name}</h3>
                  <p>Explore our complete range of products in this collection.</p>
                  <Link href={`/category/${activeCatData?.slug}`} className="mega-menu-shop-all" onClick={onClose} style={{ marginTop: 0 }}>
                    Shop All {activeCatData?.name}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
