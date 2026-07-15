'use client';

import Link from "next/link";
import React from "react";
import Image from "next/image";

export interface CategoryCircleItem {
  id: string;
  name: string;
  image: string;
  url: string;
  sortOrder: number;
}

export function CategoryCircles({ items }: { items: CategoryCircleItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="category-circles-section">
      <div className="container">
        <div className="category-circles-scroll-container">
          <div className="category-circles-row">
            {items.map((item) => {
              const isDarkBadge = 
                item.name.toLowerCase().includes('deal') || 
                item.name.toLowerCase().includes('quiz');

              return (
                <Link key={item.id} href={item.url} className="category-circle-card">
                  <div className={`category-circle-img-wrapper ${isDarkBadge ? 'dark-badge' : 'light-badge'}`} style={{ position: 'relative' }}>
                    <Image src={item.image} alt="" fill style={{ objectFit: isDarkBadge ? 'cover' : 'contain' }} className="category-circle-img" />
                  </div>
                  <span className="category-circle-label">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .category-circles-section {
          padding: 24px 0 8px 0;
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .category-circles-scroll-container {
          overflow-x: auto;
          scrollbar-width: none; /* Hide scrollbar Firefox */
          display: flex;
          padding: 10px 0;
        }

        .category-circles-scroll-container::-webkit-scrollbar {
          display: none; /* Hide scrollbar Chrome/Safari */
        }

        .category-circles-row {
          display: flex;
          gap: 28px;
          margin: 0 auto;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .category-circles-row {
            justify-content: flex-start;
            padding: 0 16px;
          }
        }

        .category-circle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          min-width: 96px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .category-circle-img-wrapper {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .category-circle-img-wrapper.light-badge {
          background: rgba(224, 204, 255, 0.35);
          border: 1px solid rgba(224, 204, 255, 0.5);
          padding: 8px;
        }

        .category-circle-img-wrapper.dark-badge {
          background: linear-gradient(135deg, #7c1a4e 0%, #4c0e2f 100%);
          border: 1px solid rgba(124, 26, 78, 0.4);
          padding: 0;
        }

        .category-circle-card:hover .category-circle-img-wrapper {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 20px rgba(124, 26, 78, 0.15);
        }

        .category-circle-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .category-circle-img-wrapper.light-badge .category-circle-img {
          object-fit: contain;
        }

        .category-circle-img-wrapper.dark-badge .category-circle-img {
          object-fit: cover;
        }

        .category-circle-label {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          text-align: center;
          transition: color 0.2s ease;
          letter-spacing: -0.01em;
        }

        .category-circle-card:hover .category-circle-label {
          color: #ff3e7e;
        }
      `}</style>
    </div>
  );
}
