import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, LogOut, Sliders, ArrowRight, X, Plus, Minus } from 'lucide-react';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const { user, products, customerProducts = [], pricingRules, logout, getProductPriceForCustomer } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('curated-catalog');
  const [stagedAllocations, setStagedAllocations] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Merge base inventory with any products the Admin exclusively assigned to this logged-in client
  const myExclusiveProducts = customerProducts.filter(p => p.assignedCustomers?.includes(user?.id));
  const combinedCatalog = [...products, ...myExclusiveProducts];

  const adjustQty = (productId, change) => {
    const currentQty = quantities[productId] || 1;
    setQuantities({
      ...quantities,
      [productId]: Math.max(1, currentQty + change)
    });
  };

  const handleInputChange = (productId, val) => {
    setQuantities({
      ...quantities,
      [productId]: Math.max(1, parseInt(val) || 1)
    });
  };

  const handleAddToManifest = (product) => {
    // getProductPriceForCustomer easily checks both rule overrides and exclusive product structures
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
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: dynamicContractPrice,
        qty: requestedQty,
        total: aggregateCost,
        image: product.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80'
      }]);
    }
    setQuantities({ ...quantities, [product.id]: 1 });
  };

  const handleRemoveItem = (id) => {
    setStagedAllocations(stagedAllocations.filter(item => item.id !== id));
  };

  const grandPortfolioValuation = stagedAllocations.reduce((sum, item) => sum + item.total, 0);
  const totalUnitsCount = stagedAllocations.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="cp-root">
      
      <header className="cp-nav">
        <div className="cp-nav-brand">
          <span className="cp-nav-eyebrow">Pre-Negotiated Corporate Vault</span>
          <h1 className="cp-nav-logo">PAKTEX</h1>
        </div>

        <nav className="cp-nav-tabs">
          <button 
            className={`cp-tab ${activeTab === 'curated-catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('curated-catalog')}
          >
            <Sliders size={13} /> Collection Matrix
          </button>
          <button 
            className={`cp-tab ${activeTab === 'requisition-manifest' ? 'active' : ''}`}
            onClick={() => setActiveTab('requisition-manifest')}
          >
            <ShoppingBag size={13} /> Allocation Manifest
            {stagedAllocations.length > 0 && (
              <span className="cp-tab-dot">{stagedAllocations.length}</span>
            )}
          </button>
        </nav>

        <div className="cp-nav-right">
          <div className="cp-nav-identity">
            <span className="cp-nav-identity-label">Secure Node Session</span>
            <span className="cp-nav-identity-name">{user?.name || 'Premium Client'}</span>
          </div>
          <button className="cp-nav-logout" onClick={logout}>
            <LogOut size={12} /> Leave Matrix
          </button>
        </div>
      </header>

      <main className="cp-stage">

        {activeTab === 'curated-catalog' && (
          <div>
            <div className="cp-page-intro">
              <div>
                <span className="cp-page-intro-eyebrow">Wholesale Asset Registry</span>
                <h2 className="cp-page-intro-title">Curated Collection</h2>
                <p className="cp-page-intro-sub">
                  Cryptographic handshake verified. Displaying live contract asset tiers calculated for your corporate profile.
                </p>
              </div>
              <button className="cp-intro-view-btn" onClick={() => setActiveTab('requisition-manifest')}>
                Review Manifest <ArrowRight size={12} style={{ marginLeft: 6 }} />
              </button>
            </div>

            <div className="cp-catalog-layout">
              
              <div className="cp-grid">
                {/* Looping over the newly combined catalog block */}
                {combinedCatalog.map(product => {
                  const dynamicContractPrice = getProductPriceForCustomer(product.id, user?.id) || product.basePrice;
                  const currentProductQty = quantities[product.id] || 1;

                  return (
                    <div key={product.id} className="cp-card">
                      <div className="cp-card-image-wrap">
                        <img 
                          className="cp-card-image"
                          src={product.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'} 
                          alt={product.name} 
                        />
                        <span className="cp-card-sku">{product.sku}</span>
                      </div>

                      <div className="cp-card-body">
                        <h3 className="cp-card-name">{product.name}</h3>
                        <p className="cp-card-desc">Premium grade corporate asset refined under verified contract provisions.</p>
                        
                        <div className="cp-card-footer">
                          <div className="cp-card-price-block">
                            <span className="cp-card-price-label">Pre-Negotiated Contract Rate</span>
                            <span className="cp-card-price">Rs {Number(dynamicContractPrice).toLocaleString()}</span>
                          </div>

                          <div className="cp-card-actions">
                            <div className="cp-stepper">
                              <button 
                                type="button" 
                                className="cp-stepper-btn"
                                onClick={() => adjustQty(product.id, -1)}
                                disabled={currentProductQty <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <input 
                                type="number" 
                                className="cp-stepper-input"
                                value={currentProductQty}
                                onChange={(e) => handleInputChange(product.id, e.target.value)}
                              />
                              <button 
                                type="button" 
                                className="cp-stepper-btn"
                                onClick={() => adjustQty(product.id, 1)}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button 
                              type="button" 
                              className="cp-add-btn"
                              onClick={() => handleAddToManifest(product)}
                            >
                              Stage Asset <ArrowRight size={12} className="cp-add-btn-arrow" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <aside className="cp-cart-sidebar">
                <div className="cp-cart-header">
                  <h3 className="cp-cart-title">Staged Allocation Matrix</h3>
                  <span className="cp-cart-count">{stagedAllocations.length} Items</span>
                </div>

                {stagedAllocations.length === 0 ? (
                  <div className="cp-cart-empty">
                    <ShoppingBag size={28} className="cp-cart-empty-icon" />
                    <p>No active material allocations are currently staged in this session framework.</p>
                  </div>
                ) : (
                  <div>
                    <ul className="cp-cart-list">
                      {stagedAllocations.map(item => (
                        <li key={item.id} className="cp-cart-item">
                          <img src={item.image} alt="" className="cp-cart-item-img" />
                          <div className="cp-cart-item-info">
                            <span className="cp-cart-item-name">{item.name}</span>
                            <span className="cp-cart-item-meta">{item.qty} units × Rs {item.price.toLocaleString()}</span>
                          </div>
                          <div className="cp-cart-item-right">
                            <span className="cp-cart-item-total">Rs {item.total.toLocaleString()}</span>
                            <button className="cp-cart-remove" onClick={() => handleRemoveItem(item.id)}>
                              <X size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="cp-cart-total-row">
                      <span>Est. Valuation</span>
                      <span className="cp-cart-grand-total">Rs {grandPortfolioValuation.toLocaleString()}</span>
                    </div>

                    <button className="cp-cart-checkout-btn" onClick={() => setActiveTab('requisition-manifest')}>
                      Proceed to Manifest Audit
                    </button>
                  </div>
                )}
              </aside>

            </div>
          </div>
        )}

        {activeTab === 'requisition-manifest' && (
          <div>
            <div className="cp-page-intro cp-page-intro--manifest">
              <div>
                <span className="cp-page-intro-eyebrow">Corporate Requisition Manifest Audit</span>
                <h2 className="cp-page-intro-title">Manifest Verification</h2>
                <p className="cp-page-intro-sub">Verify custom ledger parameters and computational lines prior to node transmission.</p>
              </div>
              <button className="cp-back-btn" onClick={() => setActiveTab('curated-catalog')}>
                Return to Collection Matrix
              </button>
            </div>

            {stagedAllocations.length === 0 ? (
              <div className="cp-manifest-empty">
                <ShoppingBag size={40} style={{ marginBottom: 8 }} />
                <p>Your compilation registry is completely empty.</p>
                <button className="cp-back-to-catalog" onClick={() => setActiveTab('curated-catalog')}>
                  Back to Collection Matrix
                </button>
              </div>
            ) : (
              <div className="cp-manifest-layout">
                
                <div className="cp-manifest-card">
                  <table className="cp-manifest-table">
                    <thead>
                      <tr>
                        <th>Asset Specification</th>
                        <th>Inventory SKU</th>
                        <th>Negotiated Pricing Unit</th>
                        <th>Allocated Quantity</th>
                        <th className="align-right">Total Valuation</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {stagedAllocations.map(item => (
                        <tr key={item.id} className="cp-manifest-row">
                          <td>
                            <div className="cp-manifest-product-cell">
                              <img src={item.image} alt="" className="cp-manifest-thumb" />
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="cp-manifest-sku">{item.sku}</span>
                          </td>
                          <td>Rs {item.price.toLocaleString()}</td>
                          <td className="cp-manifest-qty">{item.qty} Units</td>
                          <td className="cp-manifest-line-total align-right">Rs {item.total.toLocaleString()}</td>
                          <td className="align-right">
                            <button className="cp-manifest-remove" onClick={() => handleRemoveItem(item.id)}>
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <aside className="cp-manifest-summary-card">
                  <h3 className="cp-manifest-summary-title">Summary Ledger</h3>
                  
                  <div className="cp-manifest-summary-line">
                    <span>Authorized Representative</span>
                    <span>{user?.name || 'Client Node'}</span>
                  </div>
                  <div className="cp-manifest-summary-line">
                    <span>Total Dispatched Lots</span>
                    <span>{stagedAllocations.length} Items</span>
                  </div>
                  <div className="cp-manifest-summary-line">
                    <span>Cumulative Unit Weight</span>
                    <span>{totalUnitsCount} Units</span>
                  </div>

                  <div className="cp-manifest-summary-divider" />

                  <div className="cp-manifest-grand-row">
                    <span>Grand Total Ledger</span>
                    <span className="cp-manifest-grand-value">Rs {grandPortfolioValuation.toLocaleString()}</span>
                  </div>

                  <button 
                    className="cp-manifest-submit-btn"
                    onClick={() => alert('Procurement credentials securely transmitted to inventory nodes.')}
                  >
                    Transmit Authenticated Requisition
                  </button>

                  <p className="cp-manifest-disclaimer">
                    By submitting, you authorize the clearance of pre-negotiated wholesale quantities mapped under secure node protocol agreements.
                  </p>
                </aside>

              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default CustomerPortal;