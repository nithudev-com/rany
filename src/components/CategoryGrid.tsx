'use client';

import Link from "next/link";
import React from "react";
import Image from "next/image";

const ACCENT_COLORS = [
  '#ff2d55', // Sale / Pink
  '#da52ff', // Vibrators / Magenta
  '#ff9500', // Sex Toys / Orange
  '#5ac8fa', // Lubes / Cyan
  '#ffcc00', // Couples / Yellow
  '#4cd964', // Male / Green
  '#ff5e3a', // Bondage / Dark Orange
  '#ff2d55', // Lingerie / Pink
];

export function CategoryGrid({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-showcase-section">
      <div className="container">
        <div className="category-showcase-grid">
          {categories.map((category, index) => {
            const circleColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
            return (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`} 
                prefetch={true}
                className="category-showcase-card"
              >
                <span className="category-showcase-name">{category.name}</span>
                
                <div className="category-showcase-backdrop-wrapper">
                  <div 
                    className="category-showcase-circle" 
                    style={{ backgroundColor: circleColor }}
                  />
                  <div className="category-showcase-img-container">
                    {category.image && category.image.startsWith('http') ? (
                      <Image 
                        src={category.image} 
                        alt={category.seoTitle || category.name} 
                        className="category-showcase-img"
                        fill
                        sizes="120px"
                      />
                    ) : (
                      <span className="category-showcase-placeholder">
                        {category.image || '🏷️'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .category-showcase-section {
          padding: 16px 0 40px 0;
          background: #ffffff;
        }

        .category-showcase-title {
          font-size: 28px;
          font-weight: 900;
          color: #111111;
          margin-bottom: 28px;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .category-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: #e5e7eb;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .category-showcase-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .category-showcase-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .category-showcase-card {
            height: 100px;
            padding: 0 0 0 12px;
          }
          .category-showcase-name {
            font-size: 13px;
            max-width: 50%;
          }
          .category-showcase-circle {
            width: 90px;
            height: 90px;
            right: -20px;
          }
          .category-showcase-img-container {
            width: 60px;
            height: 60px;
            padding: 4px;
          }
        }

        .category-showcase-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f3f4f6;
          height: 130px;
          padding: 0 0 0 24px;
          position: relative;
          text-decoration: none;
          overflow: hidden;
          transition: all 0.25s ease;
        }

        .category-showcase-card:hover {
          background: #eaecef;
        }

        .category-showcase-name {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          z-index: 2;
          max-width: 55%;
          line-height: 1.3;
          transition: transform 0.25s ease;
        }

        .category-showcase-card:hover .category-showcase-name {
          transform: translateX(4px);
        }

        .category-showcase-backdrop-wrapper {
          position: relative;
          height: 100%;
          width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
        }

        .category-showcase-circle {
          position: absolute;
          right: -30px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          z-index: 1;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .category-showcase-card:hover .category-showcase-circle {
          transform: scale(1.1);
        }

        .category-showcase-img-container {
          position: relative;
          width: 90px;
          height: 90px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 12px;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .category-showcase-card:hover .category-showcase-img-container {
          transform: scale(1.08) rotate(2deg);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
        }

        .category-showcase-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 6px;
        }

        .category-showcase-placeholder {
          font-size: 32px;
        }
      `}</style>
    </div>
  );
}
