import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, LogOut, Sliders, X, Package, TrendingUp } from 'lucide-react';
import ProductDetail from '../components/ProductDetail';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const { user, products, customerProducts = [], logout, getProductPriceForCustomer } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('curated-catalog');
  const [stagedAllocations, setStagedAllocations] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  const myExclusiveProducts = customerProducts.filter(p => p.assignedCustomers?.includes(user?.id));
  const combinedCatalog = [...products, ...myExclusiveProducts];

  const adjustQty = (productId, change) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 1) + change) }));
  };

  const handleInputChange = (productId, val) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, parseInt(val) || 1) }));
  };

  const handleAddToManifest = (product) => {
    const dynamicContractPrice = getProductPriceForCustomer(product.id, user?.id) || product.basePrice;
    const requestedQty = quantities[product.id] || 1;
    const aggregateCost = dynamicContractPrice * requestedQty;
    const matchIndex = stagedAllocations.findIndex(item => item.id === product.id);
    if (matchIndex > -1) {
      const updatedRules = [...stagedAllocations];
      updatedRules[matchIndex].qty += requestedQty;
      updatedRules[matchIndex].total = updatedRules[matchIndex].qty * dynamicContractPrice;
      setStagedAllocations(updatedRules);
    } else {
      setStagedAllocations([...stagedAllocations, {
        id: product.id, name: product.name, sku: product.sku,
        price: dynamicContractPrice, qty: requestedQty, total: aggregateCost,
        image: product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
      }]);
    }
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleRemoveItem = (id) => setStagedAllocations(stagedAllocations.filter(item => item.id !== id));

  const grandPortfolioValuation = stagedAllocations.reduce((sum, item) => sum + item.total, 0);
  const totalUnitsCount = stagedAllocations.reduce((sum, item) => sum + item.qty, 0);
  const displayName = user?.companyName || user?.name || 'Premium Client';

  // ── Product Detail Overlay ─────────────────────────────────────────────────
  if (selectedProduct) {
    const price = getProductPriceForCustomer(selectedProduct.id, user?.id) ?? selectedProduct.basePrice;
    return (
      <div className="cp-root">
        <header className="cp-nav">
          <div className="cp-nav-brand">
            <span className="cp-nav-eyebrow">Pre-Negotiated Corporate Vault</span>
            <h1 className="cp-nav-logo">PAKTEX</h1>
          </div>
          <div className="cp-nav-right">
            <div className="cp-nav-identity">
              <span className="cp-nav-identity-label">Secure Node Session</span>
              <span className="cp-nav-identity-name">{displayName}</span>
            </div>
            <button className="cp-nav-logout" onClick={logout}><LogOut size={12} /> Leave Portal</button>
          </div>
        </header>
        <div className="cp-stage">
          <ProductDetail
            product={selectedProduct}
            showPrice={true}
            price={price}
            onBack={() => setSelectedProduct(null)}
          />
        </div>
      </div>
    );
  }

  // ── Main Portal ────────────────────────────────────────────────────────────
  return (
    <div className="cp-root">
      <header className="cp-nav">
        <div className="cp-nav-brand">
          <span className="cp-nav-eyebrow">Pre-Negotiated Corporate Vault</span>
          <h1 className="cp-nav-logo">PAKTEX</h1>
        </div>

        <nav className="cp-nav-tabs">
          <button className={`cp-tab ${activeTab === 'curated-catalog' ? 'active' : ''}`} onClick={() => setActiveTab('curated-catalog')}>
            <Sliders size={13} /> Collection Matrix
          </button>
          <button className={`cp-tab ${activeTab === 'requisition-manifest' ? 'active' : ''}`} onClick={() => setActiveTab('requisition-manifest')}>
            <ShoppingBag size={13} /> Allocation Manifest
            {stagedAllocations.length > 0 && <span className="cp-tab-dot">{stagedAllocations.length}</span>}
          </button>
        </nav>

        <div className="cp-nav-right">
          <div className="cp-nav-identity">
            <span className="cp-nav-identity-label">Secure Node Session</span>
            <span className="cp-nav-identity-name">{displayName}</span>
          </div>
          <button className="cp-nav-logout" onClick={logout}><LogOut size={12} /> Leave Matrix</button>
        </div>
      </header>

      <main className="cp-stage">
        {activeTab === 'curated-catalog' && (
          <div className="cp-catalog-layout">

            {/* ── Section Header ── */}
            <div className="cp-section-header">
              <div className="cp-section-header-left">
                <span className="cp-section-eyebrow">Exclusive Contract Access</span>
                <h2 className="cp-section-title">Collection Matrix</h2>
              </div>
              <div className="cp-section-header-right">
                <div className="cp-section-stat">
                  <Package size={14} />
                  <span>{combinedCatalog.length} Products</span>
                </div>
                {stagedAllocations.length > 0 && (
                  <div className="cp-section-stat cp-section-stat--gold">
                    <ShoppingBag size={14} />
                    <span>{stagedAllocations.length} Staged</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="cp-grid">
              {combinedCatalog.map((product, idx) => {
                const dynamicContractPrice = getProductPriceForCustomer(product.id, user?.id) || product.basePrice;
                const currentProductQty = quantities[product.id] || 1;
                const isStaged = stagedAllocations.some(a => a.id === product.id);
                return (
                  <div key={product.id} className={`cp-card ${isStaged ? 'cp-card--staged' : ''}`} style={{ animationDelay: `${idx * 60}ms` }}>

                    {/* Image */}
                    <div className="cp-card-clickable" onClick={() => setSelectedProduct(product)}>
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}
                        alt={product.name}
                        className="cp-card-image"
                      />
                      {/* SKU badge */}
                      {product.sku && (
                        <span className="cp-card-sku-badge">{product.sku}</span>
                      )}
                      {/* Staged indicator */}
                      {isStaged && (
                        <span className="cp-card-staged-badge">
                          <ShoppingBag size={10} /> Staged
                        </span>
                      )}
                      {/* Hover overlay */}
                      <div className="cp-card-overlay">
                        <span className="cp-card-overlay-label">View Details →</span>
                      </div>
                    </div>

                    <div className="cp-card-body">
                      <h3 className="cp-card-name" onClick={() => setSelectedProduct(product)}>
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="cp-card-desc">{product.description}</p>
                      )}

                      <div className="cp-card-price-block">
                        <span className="cp-card-price-label">Contract Rate</span>
                        <div className="cp-card-price-row">
                          <span className="cp-card-price">Rs {Number(dynamicContractPrice).toLocaleString()}</span>
                          <span className="cp-card-price-unit">/ unit</span>
                        </div>
                        <div className="cp-card-price-bar" />
                      </div>

                      <div className="cp-card-actions">
                        <div className="cp-stepper">
                          <button onClick={() => adjustQty(product.id, -1)} className="cp-stepper-btn" aria-label="Decrease">
                            <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1"/></svg>
                          </button>
                          <input
                            type="number"
                            value={currentProductQty}
                            onChange={(e) => handleInputChange(product.id, e.target.value)}
                            aria-label="Quantity"
                          />
                          <button onClick={() => adjustQty(product.id, 1)} className="cp-stepper-btn" aria-label="Increase">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="5" width="2" height="12" rx="1"/><rect y="5" width="12" height="2" rx="1"/></svg>
                          </button>
                        </div>
                        <button className="cp-add-btn" onClick={() => handleAddToManifest(product)}>
                          <ShoppingBag size={12} />
                          Stage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Empty State ── */}
            {combinedCatalog.length === 0 && (
              <div className="cp-empty">
                <div className="cp-empty-icon"><Package size={32} /></div>
                <h3 className="cp-empty-title">No products assigned</h3>
                <p className="cp-empty-desc">Your contract catalogue will appear here once products are assigned to your account.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requisition-manifest' && (
          <div className="cp-manifest-layout">

            {/* ── Manifest Header ── */}
            <div className="cp-section-header">
              <div className="cp-section-header-left">
                <span className="cp-section-eyebrow">Current Requisition</span>
                <h2 className="cp-section-title">Allocation Manifest</h2>
              </div>
              {stagedAllocations.length > 0 && (
                <div className="cp-section-header-right">
                  <div className="cp-section-stat cp-section-stat--gold">
                    <TrendingUp size={14} />
                    <span>Rs {grandPortfolioValuation.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Table ── */}
            <div className="cp-manifest-scroll">
              <table className="cp-manifest-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>SKU</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {stagedAllocations.length === 0 ? (
                    <tr className="cp-manifest-empty-row">
                      <td colSpan={6}>
                        <div className="cp-manifest-empty">
                          <ShoppingBag size={28} />
                          <p>Your manifest is empty</p>
                          <span>Go to Collection Matrix to stage products for requisition</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stagedAllocations.map((item, idx) => (
                      <tr key={item.id} style={{ animationDelay: `${idx * 40}ms` }}>
                        <td>
                          <div className="cp-manifest-asset">
                            <div className="cp-manifest-thumb">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <span className="cp-manifest-name">{item.name}</span>
                          </div>
                        </td>
                        <td><span className="cp-manifest-sku">{item.sku || '—'}</span></td>
                        <td><span className="cp-manifest-rate">Rs {item.price.toLocaleString()}</span></td>
                        <td><span className="cp-manifest-qty">{item.qty}</span></td>
                        <td><span className="cp-manifest-total">Rs {item.total.toLocaleString()}</span></td>
                        <td>
                          <button className="cp-manifest-remove" onClick={() => handleRemoveItem(item.id)} aria-label="Remove">
                            <X size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Grand Total Footer ── */}
            {stagedAllocations.length > 0 && (
              <div className="cp-manifest-footer">
                <div className="cp-manifest-footer-stats">
                  <div className="cp-manifest-footer-stat">
                    <span className="cp-manifest-footer-label">Total SKUs</span>
                    <span className="cp-manifest-footer-value">{stagedAllocations.length}</span>
                  </div>
                  <div className="cp-manifest-footer-stat">
                    <span className="cp-manifest-footer-label">Total Units</span>
                    <span className="cp-manifest-footer-value">{totalUnitsCount}</span>
                  </div>
                  <div className="cp-manifest-footer-stat cp-manifest-footer-stat--grand">
                    <span className="cp-manifest-footer-label">Grand Total</span>
                    <span className="cp-manifest-footer-value--grand">Rs {grandPortfolioValuation.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;