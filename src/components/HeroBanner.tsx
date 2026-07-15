'use client';

import Link from "next/link";
import React, { useState, useEffect } from "react";

const SLIDES = [
  {
    id: 1,
    image: "https://cdn.shopify.com/s/files/1/0280/7598/2985/files/ac54367d-838d-4806-a867-2a54e1307429.png?v=1766435278",
    tagline: "✨ Pure Luxury & Elegance",
    titleLine1: "Indulge in Your",
    titleLine2: "Sensual Desires",
    desc: "Discover our curated collection of ultra-premium intimate wellness products. Crafted with body-safe materials and designed for exquisite pleasure.",
    link: "/category/vibrators",
    accentColor: "#E0A96D", // Champagne Gold
    glowColor: "rgba(224, 169, 109, 0.2)"
  },
  {
    id: 2,
    image: "https://cdn.shopify.com/s/files/1/0280/7598/2985/files/aff2d1be-727e-4449-8231-aaeb0ae67e2a.png?v=1782704692",
    tagline: "🐰 Award-Winning Design",
    titleLine1: "Dual Stimulation",
    titleLine2: "Rabbit Vibrators",
    desc: "Experience dual climax stimulation with our ergonomic rabbit vibrators, featuring whisper-quiet motors and luxurious medical-grade silicone.",
    link: "/category/vibrators",
    accentColor: "#D4A5A5", // Rose Gold / Warm Blush
    glowColor: "rgba(212, 165, 165, 0.25)"
  },
  {
    id: 3,
    image: "https://cdn.shopify.com/s/files/1/0420/7699/5750/files/uni-vp01-a.jpg?v=1712681015",
    tagline: "🥂 Sensual Togetherness",
    titleLine1: "Uncompromising",
    titleLine2: "Couples Play",
    desc: "Elevate your intimate connections. Explore luxury remote-controlled toys, wellness essentials, and sensual accessories designed to build deeper bonds.",
    link: "/category/bdsm",
    accentColor: "#E0B0FF", // Mauve/Plum Accent
    glowColor: "rgba(224, 176, 255, 0.2)"
  }
];

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="luxury-hero-container">
      <style>{`
        .luxury-hero-container {
          width: 100vw;
          min-height: 80vh;
          background: #180d15; /* Elegant deep plum background */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          padding: 120px 24px 80px 24px;
          overflow: hidden;
          position: relative;
          font-family: var(--font-plus-jakarta), sans-serif;
        }

        @media (max-width: 991px) {
          .luxury-hero-container {
            padding: 60px 16px 80px 16px;
            min-height: auto;
          }
        }

        /* Ambient luxury light beams & warm bokeh effects */
        .luxury-glow-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: 
            radial-gradient(circle at 80% 20%, rgba(224, 169, 109, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(212, 165, 165, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, rgba(24, 13, 21, 0.2) 0%, #180d15 95%);
          pointer-events: none;
        }

        .luxury-hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          gap: 60px;
          max-width: 1280px;
          width: 100%;
          position: relative;
          z-index: 3;
        }

        @media (max-width: 991px) {
          .luxury-hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .luxury-visual-container {
            margin-bottom: 90px;
          }
        }

        /* Typography & Info Layout */
        .luxury-content-box {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @media (max-width: 991px) {
          .luxury-content-box {
            align-items: center;
          }
        }

        .luxury-tagline {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #E0A96D; /* Champagne gold primary */
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .luxury-title {
          font-family: var(--font-playfair), serif;
          font-size: 64px;
          font-weight: 400;
          line-height: 1.1;
          color: #ffffff;
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }

        .luxury-title-italic {
          font-family: var(--font-playfair), serif;
          font-style: italic;
          color: #E0A96D; /* Warm gold/rose accent */
          font-weight: 400;
        }

        @media (max-width: 768px) {
          .luxury-title {
            font-size: 38px;
            line-height: 1.2;
          }
          .luxury-desc {
            font-size: 15px;
            margin-bottom: 24px;
          }
          .luxury-glass-card {
            max-width: 300px;
            padding: 24px;
          }
        }

        .luxury-desc {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 40px;
          max-width: 540px;
        }

        .luxury-actions {
          display: flex;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .luxury-actions {
            flex-direction: column;
            width: 100%;
          }
        }

        .btn-luxury-primary {
          padding: 18px 42px;
          border-radius: 4px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          background: #E0A96D; /* Elegant Champagne Gold */
          color: #180d15;
          box-shadow: 0 10px 25px rgba(224, 169, 109, 0.25);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #E0A96D;
          cursor: pointer;
        }

        .btn-luxury-primary:hover {
          transform: translateY(-3px);
          background: transparent;
          color: #E0A96D;
          box-shadow: 0 15px 30px rgba(224, 169, 109, 0.15);
        }

        .btn-luxury-secondary {
          padding: 18px 42px;
          border-radius: 4px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-luxury-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #E0A96D;
          color: #E0A96D;
          transform: translateY(-3px);
        }

        /* Luxury Showcase Box */
        .luxury-visual-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .luxury-glass-card {
          width: 100%;
          max-width: 440px;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(224, 169, 109, 0.15);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 3;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          animation: luxuryFloat 8s ease-in-out infinite;
        }

        @keyframes luxuryFloat {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        .luxury-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .luxury-slide-img {
          position: absolute;
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          opacity: 0;
          transform: scale(0.92) translateY(15px);
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-slide-img.active {
          opacity: 1;
          transform: scale(1) translateY(0);
          z-index: 2;
        }

        /* Fine ornamental gold ring behind card */
        .luxury-gold-ring {
          position: absolute;
          width: 82%;
          height: 82%;
          border-radius: 50%;
          border: 1px dashed rgba(224, 169, 109, 0.25);
          z-index: 1;
          animation: spinRing 40s linear infinite;
        }

        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Slider Indicators */
        .luxury-dots-bar {
          display: flex;
          gap: 12px;
          position: absolute;
          bottom: -70px;
          z-index: 5;
        }

        .luxury-dot {
          width: 32px;
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .luxury-dot:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .luxury-dot.active {
          background: #E0A96D;
          box-shadow: 0 0 10px rgba(224, 169, 109, 0.5);
        }

        .luxury-animate-in {
          animation: luxuryFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes luxuryFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Decorative overlays */}
      <div className="luxury-glow-overlay" />

      <div className="luxury-hero-grid">
        
        {/* Left Side: Typography */}
        <div key={activeIndex} className="luxury-content-box luxury-animate-in">
          <span className="luxury-tagline" style={{ color: SLIDES[activeIndex].accentColor }}>
            {SLIDES[activeIndex].tagline}
          </span>
          <h1 className="luxury-title">
            {SLIDES[activeIndex].titleLine1}<br />
            <span className="luxury-title-italic" style={{ color: SLIDES[activeIndex].accentColor }}>{SLIDES[activeIndex].titleLine2}</span>
          </h1>
          <p className="luxury-desc">
            {SLIDES[activeIndex].desc}
          </p>
          
          <div className="luxury-actions">
            <Link href={SLIDES[activeIndex].link} className="btn-luxury-primary" style={{ background: SLIDES[activeIndex].accentColor, borderColor: SLIDES[activeIndex].accentColor, color: '#180d15' }}>
              Explore Collection
            </Link>
            <Link href="/deals" className="btn-luxury-secondary">
              View Offers
            </Link>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="luxury-visual-container">
          <div className="luxury-gold-ring" style={{ borderColor: `rgba(${SLIDES[activeIndex].accentColor === '#E0A96D' ? '224, 169, 109' : SLIDES[activeIndex].accentColor === '#D4A5A5' ? '212, 165, 165' : '224, 176, 255'}, 0.25)` }} />
          
          <div className="luxury-glass-card" style={{ borderColor: `rgba(${SLIDES[activeIndex].accentColor === '#E0A96D' ? '224, 169, 109' : SLIDES[activeIndex].accentColor === '#D4A5A5' ? '212, 165, 165' : '224, 176, 255'}, 0.2)` }}>
            <div className="luxury-image-wrapper">
              {SLIDES.map((slide, index) => (
                <img 
                  key={slide.id}
                  src={slide.image} 
                  alt={slide.titleLine1 + ' ' + slide.titleLine2} 
                  className={`luxury-slide-img ${index === activeIndex ? "active" : ""}`}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="luxury-dots-bar">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                className={`luxury-dot ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                style={{
                  backgroundColor: index === activeIndex ? SLIDES[activeIndex].accentColor : 'rgba(255, 255, 255, 0.15)'
                }}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
