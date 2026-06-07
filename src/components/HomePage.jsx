import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import './HomePage.css';

const HomePage = ({ onLoginClick }) => {
  const { products, customerProducts } = useContext(AppContext);
  const [visible, setVisible] = useState({});
  const cardRefs = useRef([]);

  // Merge global products + customer products for display (no price shown)
  const allProducts = [
    ...(products || []),
    ...(customerProducts || []).filter(cp => cp.isCustomerProduct),
  ];

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(prev => ({ ...prev, [entry.target.dataset.index]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [allProducts.length]);

  return (
    <div className="hp-root">

      {/* ── Nav ── */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">
          <span className="hp-nav-logo-pk">PAKTEX</span>
          <span className="hp-nav-logo-divider">|</span>
          <span className="hp-nav-logo-inv">INVENTORY</span>
        </div>
        <button className="hp-nav-login-btn" onClick={onLoginClick}>
          Client Portal →
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero-bg">
          <div className="hp-hero-grain" />
          <div className="hp-hero-blob hp-hero-blob-1" />
          <div className="hp-hero-blob hp-hero-blob-2" />
          <div className="hp-hero-blob hp-hero-blob-3" />
        </div>
        <div className="hp-hero-content">
          <p className="hp-hero-eyebrow">Commercial Distribution</p>
          <h1 className="hp-hero-title">
            <span className="hp-hero-title-line1">Premium</span>
            <span className="hp-hero-title-line2">Textile</span>
            <span className="hp-hero-title-line3">Materials</span>
          </h1>
          <p className="hp-hero-sub">
            Curated wholesale fabrics and materials for discerning distributors.
            <br />Contract pricing available exclusively to registered clients.
          </p>
          <div className="hp-hero-actions">
            <button className="hp-hero-btn-primary" onClick={onLoginClick}>
              <span>Login for Pricing</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#products" className="hp-hero-btn-ghost">View Catalogue</a>
          </div>
        </div>
        <div className="hp-hero-scroll-hint">
          <span>Scroll</span>
          <div className="hp-hero-scroll-line" />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div className="hp-stats-bar">
        <div className="hp-stat">
          <span className="hp-stat-num">{allProducts.length || '—'}</span>
          <span className="hp-stat-label">Active SKUs</span>
        </div>
        <div className="hp-stat-divider" />
        <div className="hp-stat">
          <span className="hp-stat-num">B2B</span>
          <span className="hp-stat-label">Wholesale Only</span>
        </div>
        <div className="hp-stat-divider" />
        <div className="hp-stat">
          <span className="hp-stat-num">PKR</span>
          <span className="hp-stat-label">Contract Pricing</span>
        </div>
        <div className="hp-stat-divider" />
        <div className="hp-stat">
          <span className="hp-stat-num">✦</span>
          <span className="hp-stat-label">Premium Grade</span>
        </div>
      </div>

      {/* ── Products Section ── */}
      <section className="hp-products" id="products">
        <div className="hp-products-header">
          <div className="hp-products-header-left">
            <span className="hp-section-tag">Our Catalogue</span>
            <h2 className="hp-section-title">Current Collection</h2>
          </div>
          <p className="hp-section-desc">
            All pricing is contract-based and personalised per client.<br />
            <button className="hp-inline-login" onClick={onLoginClick}>Login to view your rates →</button>
          </p>
        </div>

        {allProducts.length === 0 ? (
          <div className="hp-empty">
            <div className="hp-empty-icon">◈</div>
            <p>Products are being added to the catalogue.</p>
            <p className="hp-empty-sub">Check back soon or contact us directly.</p>
          </div>
        ) : (
          <div className="hp-grid">
            {allProducts.map((product, i) => (
              <div
                key={product.id}
                className={`hp-card ${visible[i] ? 'hp-card--visible' : ''}`}
                ref={el => { cardRefs.current[i] = el; }}
                data-index={i}
                style={{ '--delay': `${i * 80}ms` }}
              >
                <div className="hp-card-img-wrap">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="hp-card-img"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="hp-card-img-overlay" />
                  <span className="hp-card-sku">{product.sku}</span>
                </div>
                <div className="hp-card-body">
                  <h3 className="hp-card-name">{product.name}</h3>
                  {product.description && (
                    <p className="hp-card-desc">{product.description}</p>
                  )}
                  <button className="hp-card-cta" onClick={onLoginClick}>
                    Login for Pricing
                    <span className="hp-card-cta-arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="hp-cta-banner">
        <div className="hp-cta-banner-bg" />
        <div className="hp-cta-content">
          <p className="hp-cta-tag">Registered Clients Only</p>
          <h2 className="hp-cta-title">Access Your Contract Rates</h2>
          <p className="hp-cta-sub">Each client receives personalised pricing tailored to their partnership level and volume.</p>
          <button className="hp-cta-btn" onClick={onLoginClick}>
            Enter Client Portal
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer-top">
          <div className="hp-footer-brand">
            <span className="hp-footer-logo">PAKTEX</span>
            <p>Commercial Distribution Control Panel</p>
          </div>
          <div className="hp-footer-links">
            <button onClick={onLoginClick} className="hp-footer-link">Client Login</button>
            <span className="hp-footer-dot">·</span>
            <span className="hp-footer-link">Wholesale Enquiries</span>
          </div>
        </div>
        <div className="hp-footer-bottom">
          <span>© {new Date().getFullYear()} Paktex. All rights reserved.</span>
          <span className="hp-footer-tagline">Precision in every thread.</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;