import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, LogOut, Sliders, X } from 'lucide-react';
import ProductDetail from '../components/ProductDetail';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const { user, products, customerProducts = [], logout, getProductPriceForCustomer } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('curated-catalog');
  const [stagedAllocations, setStagedAllocations] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null); // NEW

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
            <div className="cp-grid">
              {combinedCatalog.map(product => {
                const dynamicContractPrice = getProductPriceForCustomer(product.id, user?.id) || product.basePrice;
                const currentProductQty = quantities[product.id] || 1;
                return (
                  <div key={product.id} className="cp-card">
                    {/* Clickable image + name area → opens detail */}
                    <div className="cp-card-clickable" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'}
                        alt={product.name}
                        className="cp-card-image"
                      />
                    </div>
                    <div className="cp-card-body">
                      <h3 className="cp-card-name" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                        {product.name}
                      </h3>
                      <div className="cp-card-price-block">
                        <span className="cp-card-price">Rs {Number(dynamicContractPrice).toLocaleString()}</span>
                      </div>
                      <div className="cp-card-actions">
                        <div className="cp-stepper">
                          <button onClick={() => adjustQty(product.id, -1)} className="cp-stepper-btn">-</button>
                          <input type="number" value={currentProductQty} onChange={(e) => handleInputChange(product.id, e.target.value)} />
                          <button onClick={() => adjustQty(product.id, 1)} className="cp-stepper-btn">+</button>
                        </div>
                        <button className="cp-add-btn" onClick={() => handleAddToManifest(product)}>Stage</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'requisition-manifest' && (
          <div className="cp-manifest-layout">
            <table className="cp-manifest-table">
              <thead>
                <tr><th>Asset</th><th>SKU</th><th>Rate</th><th>Qty</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {stagedAllocations.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>No items staged yet. Go to Collection Matrix to add products.</td></tr>
                ) : (
                  stagedAllocations.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.sku}</td>
                      <td>Rs {item.price.toLocaleString()}</td>
                      <td>{item.qty}</td>
                      <td>Rs {item.total.toLocaleString()}</td>
                      <td><button onClick={() => handleRemoveItem(item.id)}><X size={14} /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {stagedAllocations.length > 0 && (
              <div className="cp-manifest-footer" style={{ padding: '16px 0', textAlign: 'right', borderTop: '1px solid #eee', marginTop: '12px' }}>
                <span style={{ marginRight: '24px', color: '#888' }}>{totalUnitsCount} units</span>
                <strong>Grand Total: Rs {grandPortfolioValuation.toLocaleString()}</strong>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPortal;