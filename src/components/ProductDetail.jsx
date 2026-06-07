import React from 'react';
import './ProductDetail.css';

// showPrice: false on homepage, true on customer portal
// price: the actual price value (only shown when showPrice=true)
// onBack: function to go back to list
// onLoginForPrice: function to open login (homepage only)

const ProductDetail = ({ product, showPrice, price, onBack, onLoginForPrice }) => {
  if (!product) return null;

  return (
    <div className="pd-root">

      {/* ── Back ── */}
      <button className="pd-back" onClick={onBack}>
        ← Return to Catalogue
      </button>

      <div className="pd-layout">

        {/* ── Left: Image ── */}
        <div className="pd-img-col">
          <div className="pd-img-wrap">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="pd-img"
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="pd-info-col">

          <span className="pd-sku">{product.sku}</span>
          <h1 className="pd-name">{product.name}</h1>

          {product.description && (
            <p className="pd-desc">{product.description}</p>
          )}

          <div className="pd-divider" />

          {/* Price block */}
          {showPrice ? (
            <div className="pd-price-block">
              <span className="pd-price-label">Your Contract Rate</span>
              <span className="pd-price-value">
                {price != null ? `₨ ${Number(price).toLocaleString()}` : 'Contact for pricing'}
              </span>
              <span className="pd-price-note">
                This is your personalised wholesale rate. Prices are exclusive to your account.
              </span>
            </div>
          ) : (
            <div className="pd-login-block">
              <span className="pd-login-label">Pricing Available to Registered Clients</span>
              <p className="pd-login-note">
                Contract rates are personalised per client account.<br />
                Login to view pricing exclusive to your partnership.
              </p>
              <button className="pd-login-btn" onClick={onLoginForPrice}>
                Login for Pricing →
              </button>
            </div>
          )}

          <div className="pd-divider" />

          {/* Meta */}
          <div className="pd-meta">
            <div className="pd-meta-row">
              <span className="pd-meta-key">SKU Reference</span>
              <span className="pd-meta-val">{product.sku}</span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-key">Availability</span>
              <span className="pd-meta-val pd-meta-available">● In Stock</span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-key">Distribution</span>
              <span className="pd-meta-val">B2B Wholesale Only</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;