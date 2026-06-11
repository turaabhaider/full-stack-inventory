import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import ProductDetail from './ProductDetail';
import './HomePage.css';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600';

const CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600',
  'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=600',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=600',
];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Flexible Business Models',
    desc: 'Designed to support short lead times, optimized costs, and scalable production volumes.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    title: 'Sustainable Product Solutions',
    desc: 'Focused on eco-friendly materials, responsible sourcing, and long-term environmental impact.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Strong Global Sourcing',
    desc: 'Network across low-cost and duty-free regions to ensure efficiency and reliability.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .96h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15.92v1z"/>
      </svg>
    ),
    title: 'Competitive Pricing',
    desc: 'Strategies combined with high-quality service to deliver maximum value across the entire supply chain.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Delivering high-quality sourcing, manufacturing, and logistics services for global brands with a commitment to precision and compliance.',
  },
  {
    quote: 'From concept development to final production, our integrated workflow guarantees transparency, speed, and seamless collaboration at every stage.',
  },
];

const AVATAR_COLORS = ['#c9b99a', '#b5a28a', '#d4c5b0', '#a89070', '#c0aa90'];

const HomePage = ({ onLoginClick }) => {
  const { products = [], customerProducts = [] } = useContext(AppContext);
  const [visible, setVisible] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [testimIdx, setTestimIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cardRefs = useRef([]);

  const allProducts = [
    ...products,
    ...customerProducts.filter(cp => cp && cp.isCustomerProduct),
  ];

  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          setVisible(p => ({ ...p, [e.target.dataset.index]: true }));
        }
      }),
      { threshold: 0.12 }
    );
    cardRefs.current.forEach(r => r && observer.observe(r));
    return () => observer.disconnect();
  }, [allProducts.length, selectedProduct]);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  if (selectedProduct) {
    return (
      <div className="hp-root">
        <nav className="hp-nav">
          <div className="hp-nav-logo">
            <span className="hp-nav-logo-pk">PAKTEX</span>
            <span className="hp-nav-logo-sub">TEXTILE EXCHANGE</span>
          </div>
          <div className="hp-nav-links">
            <a href="#products" className="hp-nav-link">Collections</a>
            <a href="#" className="hp-nav-link" onClick={onLoginClick}>Pricing</a>
          </div>
          <div className="hp-nav-actions">
            <button className="hp-nav-btn-outline" onClick={onLoginClick}>Client Login</button>
            <button className="hp-nav-btn-solid" onClick={onLoginClick}>Get Started</button>
          </div>
        </nav>
        <div style={{ paddingTop: '72px' }}>
          <ProductDetail
            product={selectedProduct}
            showPrice={false}
            onBack={() => setSelectedProduct(null)}
            onLoginForPrice={onLoginClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hp-root">
      {/* ── Nav ── */}
      <nav className="hp-nav">
        <div className="hp-nav-logo">
          <span className="hp-nav-logo-pk">PAKTEX</span>
          <span className="hp-nav-logo-sub">TEXTILE EXCHANGE</span>
        </div>

        <div className={`hp-nav-links ${mobileMenuOpen ? 'hp-nav-links--open' : ''}`}>
          <a href="#products" className="hp-nav-link" onClick={() => setMobileMenuOpen(false)}>Collections</a>
          <a href="#" className="hp-nav-link" onClick={onLoginClick}>Pricing</a>
        </div>

        <div className="hp-nav-actions">
          <button className="hp-nav-btn-outline" onClick={onLoginClick}>Client Login</button>
          <button className="hp-nav-btn-solid" onClick={onLoginClick}>Get Started</button>
        </div>

        <button
          className="hp-nav-hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <p className="hp-hero-eyebrow">Premium Wholesale Fabrics</p>
          <h1 className="hp-hero-title">
            Pakistan Textile<br />Exchange
          </h1>
          <p className="hp-hero-sub">
            Curated wholesale fabrics and materials for discerning distributors.
            Contract pricing available for registered clients.
          </p>
          <div className="hp-hero-actions">
            <button className="hp-hero-btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
              Browse Collections →
            </button>
            <button className="hp-hero-btn-ghost" onClick={onLoginClick}>View Catalogue</button>
          </div>
          <div className="hp-hero-trust">
            <div className="hp-hero-avatars">
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} className="hp-hero-avatar" style={{ background: c, zIndex: 5 - i }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.7">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                  </svg>
                </div>
              ))}
              <span className="hp-hero-avatar hp-hero-avatar--plus">+</span>
            </div>
            <div className="hp-hero-trust-text">
              <span className="hp-hero-trust-bold">Trusted by 500+ Businesses</span>
              <span className="hp-hero-trust-sub">across Pakistan and worldwide</span>
            </div>
          </div>
        </div>

        <div className="hp-hero-image-wrap">
          <img
            src={HERO_IMAGE}
            alt="Premium textile fabric"
            className="hp-hero-image"
          />
        </div>
      </section>

      {/* ── Features Bar ── */}
      <div className="hp-features-bar">
        {FEATURES.map((f, i) => (
          <div key={i} className="hp-feature">
            <div className="hp-feature-icon">{f.icon}</div>
            <div className="hp-feature-text">
              <span className="hp-feature-title">{f.title}</span>
              <span className="hp-feature-desc">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Collections / Products ── */}
      <section className="hp-products" id="products">
        <div className="hp-products-header">
          <p className="hp-section-eyebrow">Our Collections</p>
          <h2 className="hp-section-title">Explore Our Premium Categories</h2>
        </div>

        {allProducts.length === 0 ? (
          <div className="hp-cat-grid">
            {[
              { name: 'Cotton Fabrics', desc: 'Premium quality cotton fabrics for all applications', img: CATEGORY_IMAGES[0] },
              { name: 'Linen Fabrics', desc: 'Natural linen fabrics for every need', img: CATEGORY_IMAGES[1] },
              { name: 'Blended Fabrics', desc: 'High-quality blended fabric solutions', img: CATEGORY_IMAGES[2] },
              { name: 'Sustainable Fabrics', desc: 'Eco-friendly fabrics for a better tomorrow', img: CATEGORY_IMAGES[3] },
            ].map((cat, i) => (
              <div key={i} className="hp-cat-card" onClick={onLoginClick}>
                <div className="hp-cat-img-wrap">
                  <img src={cat.img} alt={cat.name} className="hp-cat-img" />
                  <div className="hp-cat-icon-badge">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                    </svg>
                  </div>
                </div>
                <div className="hp-cat-body">
                  <h3 className="hp-cat-name">{cat.name}</h3>
                  <p className="hp-cat-desc">{cat.desc}</p>
                  <span className="hp-cat-cta">Explore →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hp-grid">
            {allProducts.map((product, i) => (
              <div
                key={product.id || i}
                className={`hp-card ${visible[i] ? 'hp-card--visible' : ''}`}
                ref={el => { cardRefs.current[i] = el; }}
                data-index={i}
                style={{ '--delay': `${i * 80}ms` }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="hp-card-img-wrap">
                  <img
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name || 'Product Image'}
                    className="hp-card-img"
                    onError={e => { e.target.src = FALLBACK_IMAGE; }}
                  />
                  <div className="hp-card-img-overlay" />
                  <span className="hp-card-sku">{product.sku || 'N/A'}</span>
                </div>
                <div className="hp-card-body">
                  <h3 className="hp-card-name">{product.name || 'Unnamed Product'}</h3>
                  {product.description && <p className="hp-card-desc">{product.description}</p>}
                  <div className="hp-card-cta">
                    View Details
                    <span className="hp-card-cta-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Testimonial ── */}
      <section className="hp-testimonial">
        <p className="hp-testim-eyebrow">Trusted by Industry Leaders</p>
        <div className="hp-testim-quote-icon">
          <svg width="36" height="28" viewBox="0 0 36 28" fill="currentColor">
            <path d="M0 28V17.2C0 11.8 1.6 7.4 4.8 4 8 0.6 12.6 0 16 0v4.8C13.2 4.8 11 6 9.4 8.4 7.8 10.8 7 13.8 7 17.2H14V28H0zm22 0V17.2C22 11.8 23.6 7.4 26.8 4 30 0.6 34.6 0 38 0v4.8c-2.8 0-5 1.2-6.6 3.6C29.8 10.8 29 13.8 29 17.2H36V28H22z" opacity="0.3"/>
          </svg>
        </div>
        <div className="hp-testim-body">
          <p className="hp-testim-text">{TESTIMONIALS[testimIdx].quote}</p>
          <div className="hp-testim-author-wrap">
            <div className="hp-testim-author-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <span className="hp-testim-name">{TESTIMONIALS[testimIdx].author}</span>
              <span className="hp-testim-role">{TESTIMONIALS[testimIdx].role}</span>
            </div>
          </div>
        </div>
        <div className="hp-testim-nav">
          <button
            className="hp-testim-arrow"
            onClick={() => setTestimIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            aria-label="Previous"
          >‹</button>
          <div className="hp-testim-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`hp-testim-dot ${i === testimIdx ? 'hp-testim-dot--active' : ''}`}
                onClick={() => setTestimIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            className="hp-testim-arrow"
            onClick={() => setTestimIdx(i => (i + 1) % TESTIMONIALS.length)}
            aria-label="Next"
          >›</button>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="hp-cta-banner">
        <div className="hp-cta-banner-bg" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="hp-cta-banner-overlay" />
        <div className="hp-cta-content">
          <div className="hp-cta-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          </div>
          <h2 className="hp-cta-title">Access Exclusive Contract Pricing</h2>
          <p className="hp-cta-sub">
            Register or login to view pricing<br />tailored to your business needs.
          </p>
          <button className="hp-cta-btn" onClick={onLoginClick}>Enter Client Portal →</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-footer-top">
          <div className="hp-footer-brand">
            <div className="hp-footer-logo-wrap">
              <span className="hp-footer-logo">PAKTEX</span>
              <span className="hp-footer-logo-sub">TEXTILE EXCHANGE</span>
            </div>
            <p className="hp-footer-brand-desc">
              Curated wholesale fabrics and materials for discerning distributors worldwide.
            </p>
            <div className="hp-footer-socials">
              {['f', 'in', 'ig', '✉'].map((s, i) => (
                <button key={i} className="hp-footer-social">{s}</button>
              ))}
            </div>
          </div>

          <div className="hp-footer-col">
            <button onClick={onLoginClick} className="hp-footer-link">Pricing</button>
            <button onClick={onLoginClick} className="hp-footer-link">Client Login</button>
          </div>

          
        </div>

        <div className="hp-footer-bottom">
          <span>© {new Date().getFullYear()} Paktex Textile Exchange. All rights reserved.</span>
          <span className="hp-footer-tagline">Designed with precision. Woven with trust.</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;