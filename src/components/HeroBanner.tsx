import Link from "next/link";
import Image from "next/image";
import React from "react";

export function HeroBanner() {
  return (
    <div className="modern-fashion-hero">
      <style>{`
        .modern-fashion-hero {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          display: flex;
          min-height: 80vh;
          font-family: var(--font-plus-jakarta), sans-serif;
          background: #faf9f6; /* Soft elegant off-white */
          overflow: hidden;
        }

        .hero-content-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 8%;
          position: relative;
          z-index: 10;
        }

        .hero-image-side {
          flex: 1.2;
          position: relative;
          min-height: 400px;
        }

        .hero-fashion-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
        }

        .fashion-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #cca052;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 24px;
        }

        .fashion-badge::before {
          content: '';
          display: block;
          width: 30px;
          height: 2px;
          background: #cca052;
        }

        .fashion-title {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 400;
          line-height: 1.1;
          color: #0d2b18; /* Deep rich green */
          font-family: var(--font-playfair), serif;
          margin: 0 0 24px 0;
          letter-spacing: -0.01em;
        }

        .fashion-title i {
          color: #cca052;
          font-style: italic;
        }

        .fashion-subtitle {
          color: #475569;
          font-size: clamp(16px, 1.5vw, 18px);
          line-height: 1.7;
          max-width: 480px;
          margin: 0 0 40px 0;
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: #0d2b18;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          padding: 18px 40px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: 1px solid #0d2b18;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #fff;
          color: #0d2b18;
        }

        .btn-secondary {
          color: #0d2b18;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid transparent;
          transition: all 0.3s ease;
          padding-bottom: 4px;
        }

        .btn-secondary:hover {
          border-bottom-color: #cca052;
          color: #cca052;
        }

        .hero-stats {
          display: flex;
          gap: 48px;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid rgba(13, 43, 24, 0.1);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 400;
          color: #0d2b18;
          font-family: var(--font-playfair), serif;
        }

        .stat-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        /* Fully Responsive Mobile Design */
        @media (max-width: 991px) {
          .modern-fashion-hero {
            flex-direction: column-reverse;
          }
          
          .hero-content-side {
            padding: 50px 24px;
            align-items: center;
            text-align: center;
          }

          .fashion-badge::before {
            display: none;
          }

          .fashion-subtitle {
            margin: 0 auto 32px auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
            width: 100%;
            gap: 32px;
          }

          .hero-image-side {
            min-height: 50vh;
            width: 100%;
          }
        }
      `}</style>

      {/* Text Content */}
      <div className="hero-content-side">
        <div className="fashion-badge">Luxury Tailoring</div>
        
        <h1 className="fashion-title">
          Bespoke Design &<br />
          <i>Flawless Fit</i>
        </h1>
        
        <p className="fashion-subtitle">
          Discover a world where traditional craftsmanship meets modern elegance. From exquisite bridal gowns to perfectly tailored suits, we bring your vision to life.
        </p>

        <div className="hero-actions">
          <Link prefetch={true} href="/category" className="btn-primary">
            Shop Collection
          </Link>
          <Link prefetch={true} href="/contact" className="btn-secondary">
            Book Consultation <span style={{ fontSize: '18px', lineHeight: 0 }}>→</span>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Years of Mastery</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5k+</span>
            <span className="stat-label">Bespoke Creations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Tailored Fit</span>
          </div>
        </div>
      </div>

      {/* Image Side */}
      <div className="hero-image-side">
        <Image 
          src="/fashion-bg.png" 
          alt="Luxury Tailoring Studio"
          fill
          className="hero-fashion-img"
          priority={true}
          sizes="(max-width: 991px) 100vw, 55vw"
        />
      </div>

    </div>
  );
}
