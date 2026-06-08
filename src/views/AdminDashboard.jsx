import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Users, Layers, Trash2, LogOut, CheckCircle, ShieldAlert,
  Globe, PlusCircle, Package, X, Upload, Link
} from 'lucide-react';
import './AdminDashboard.css';

// ── SAFE name helper — this is the fix for ALL toLowerCase crashes ────────────
// Never call .name or .companyName directly — always go through this.
const getClientName = (client) => {
  if (!client) return 'Unknown Client';
  const n = client.name || client.companyName;
  return (n && String(n).trim()) ? String(n).trim() : 'Unknown Client';
};

const ImageInput = ({ value, onChange, preview, onPreview }) => {
  const fileRef = useRef(null);
  const [mode, setMode] = useState('url');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { onPreview(reader.result); onChange(reader.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="ad-image-input-wrapper">
      <div className="ad-image-mode-toggle">
        <button type="button" className={`ad-mode-btn ${mode === 'url' ? 'active' : ''}`} onClick={() => setMode('url')}>
          <Link size={11} /> URL
        </button>
        <button type="button" className={`ad-mode-btn ${mode === 'file' ? 'active' : ''}`}
          onClick={() => { setMode('file'); fileRef.current?.click(); }}>
          <Upload size={11} /> Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
      {mode === 'url' && (
        <input className="ad-input" type="url" value={value}
          onChange={e => { onChange(e.target.value); onPreview(e.target.value); }}
          placeholder="https://images.unsplash.com/..." />
      )}
      {mode === 'file' && (
        <div className="ad-file-drop-zone" onClick={() => fileRef.current?.click()}>
          {preview
            ? <img src={preview} alt="preview" className="ad-file-preview-img" />
            : <><Upload size={20} style={{ color: '#ccc', marginBottom: '6px' }} /><span>Click to select image from device</span></>}
        </div>
      )}
      {preview && (
        <div className="ad-image-preview-strip">
          <img src={preview} alt="preview" /><span>Preview</span>
        </div>
      )}
    </div>
  );
};

const AddCustomerProductModal = ({ customers, onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [allSamePrice, setAllSamePrice] = useState(true);
  const [perCustomerPrices, setPerCustomerPrices] = useState({});

  const toggleCustomer = (id) =>
    setSelectedCustomers(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const handleSubmit = () => {
    if (!name || !sku || selectedCustomers.length === 0) return;
    const newProd = {
      id: `cprod_${Date.now()}`,
      name,
      sku: sku.toUpperCase().trim(),
      description,
      basePrice: Number(basePrice) || 0,
      image: image.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      isCustomerProduct: true,
      assignedCustomers: selectedCustomers,
      customerPricing: selectedCustomers.reduce((acc, cId) => {
        acc[cId] = allSamePrice
          ? (Number(basePrice) || 0)
          : (Number(perCustomerPrices[cId]) || Number(basePrice) || 0);
        return acc;
      }, {}),
    };
    onAdd(newProd);
    onClose();
  };

  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal-box">
        <div className="ad-modal-header">
          <h2>Add Product to Client(s)</h2>
          <button className="ad-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ad-modal-body">
          {step === 1 && (
            <>
              <span className="ad-modal-step-label">Step 1 of 2 — Product Details</span>
              <div className="ad-form-group">
                <label className="ad-label">Product / Material Name *</label>
                <input className="ad-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Lawn Fabric" />
              </div>
              <div className="ad-form-group">
                <label className="ad-label">SKU Code *</label>
                <input className="ad-input" value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. LAWN-220" />
              </div>
              <div className="ad-form-group">
                <label className="ad-label">Description</label>
                <textarea className="ad-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Fabric weight, quality grade, notes..." />
              </div>
              <div className="ad-form-group">
                <label className="ad-label">Base Price (₨) *</label>
                <input className="ad-input" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div className="ad-form-group">
                <label className="ad-label">Product Image</label>
                <ImageInput value={image} onChange={setImage} preview={imagePreview} onPreview={setImagePreview} />
              </div>
              <button className="ad-btn-gold" disabled={!name || !sku || !basePrice} onClick={() => setStep(2)}>
                Continue → Select Clients &amp; Pricing
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <span className="ad-modal-step-label">Step 2 of 2 — Assign Clients &amp; Set Prices</span>
              <div className="ad-form-group">
                <label className="ad-label">Assign to Clients * (select one or more)</label>
                <div className="ad-customer-select-list">
                  {customers.map(c => (
                    <div key={c.id}
                      className={`ad-customer-chip ${selectedCustomers.includes(c.id) ? 'selected' : ''}`}
                      onClick={() => toggleCustomer(c.id)}>
                      <span>{getClientName(c)}</span>
                      {selectedCustomers.includes(c.id) && <CheckCircle size={14} />}
                    </div>
                  ))}
                </div>
              </div>
              {selectedCustomers.length > 0 && (
                <>
                  <label className="ad-same-price-toggle">
                    <input type="checkbox" checked={allSamePrice} onChange={e => setAllSamePrice(e.target.checked)} />
                    Same price for all selected clients
                  </label>
                  {!allSamePrice && (
                    <div className="ad-form-group">
                      <label className="ad-label">Per-Client Contract Price (₨)</label>
                      {selectedCustomers.map(cId => {
                        const client = customers.find(c => c.id === cId);
                        return (
                          <div key={cId} className="ad-per-client-row">
                            <span className="ad-per-client-row-name">{getClientName(client)}</span>
                            <input className="ad-input" type="number"
                              placeholder={`Base: ₨ ${basePrice}`}
                              value={perCustomerPrices[cId] || ''}
                              onChange={e => setPerCustomerPrices(prev => ({ ...prev, [cId]: e.target.value }))} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              <div className="ad-modal-btn-row">
                <button className="ad-btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="ad-btn-gold" disabled={selectedCustomers.length === 0} onClick={handleSubmit}>
                  Assign to {selectedCustomers.length} Client{selectedCustomers.length !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const {
    customers, products, pricingRules,
    upsertPricingRule, deletePricingRule,
    logout, setProducts,
    customerProducts, setCustomerProducts,
    user
  } = useContext(AppContext);

  const [currentTab,        setCurrentTab]        = useState('clients');
  const [selectedClientId,  setSelectedClientId]  = useState(customers[0]?.id || '');
  const [targetProductId,   setTargetProductId]   = useState('');
  const [customPriceInput,  setCustomPriceInput]  = useState('');
  const [newProdName,       setNewProdName]        = useState('');
  const [newProdSku,        setNewProdSku]         = useState('');
  const [newProdPrice,      setNewProdPrice]       = useState('');
  const [newProdImg,        setNewProdImg]         = useState('');
  const [newProdImgPreview, setNewProdImgPreview]  = useState('');
  const [newProdDesc,       setNewProdDesc]        = useState('');
  const [showAddModal,      setShowAddModal]       = useState(false);

  const handleAssignPriceOverride = (e) => {
    e.preventDefault();
    if (!selectedClientId || !targetProductId || !customPriceInput) return;
    upsertPricingRule(targetProductId, selectedClientId, customPriceInput);
    setCustomPriceInput('');
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdSku || !newProdPrice) return;
    const obj = {
      id: `prod_${Date.now()}`,
      name: newProdName,
      sku: newProdSku.toUpperCase().trim(),
      basePrice: Number(newProdPrice),
      description: newProdDesc,
      image: newProdImg.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    };
    try {
      const API = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj),
      });
      if (!res.ok) throw new Error('Server error');
      if (setProducts) setProducts(prev => [...prev, obj]);
      setNewProdName(''); setNewProdSku(''); setNewProdPrice('');
      setNewProdImg(''); setNewProdImgPreview(''); setNewProdDesc('');
    } catch (err) {
      console.error('Failed to save product to Railway DB:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const API = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server error');
      if (setProducts) setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product from Railway DB:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleAddCustomerProduct = async (prod) => {
    try {
      const API = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API}/api/customer-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod),
      });
      if (!res.ok) throw new Error('Server error');
      setCustomerProducts(prev => [...prev, prod]);
    } catch (err) {
      console.error('Failed to save customer product to Railway DB:', err);
      alert('Failed to save client product. Please try again.');
    }
  };

  const deleteCustomerProduct = async (id) => {
    try {
      const API = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API}/api/customer-products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server error');
      setCustomerProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete customer product from Railway DB:', err);
      alert('Failed to delete client product. Please try again.');
    }
  };

  // Safe lookups — never crash if selectedClientId is stale
  const selectedClient  = customers.find(c => c.id === selectedClientId) || null;
  const isolatedRules   = pricingRules.filter(r => r.customerId === selectedClientId);
  const clientCustProds = customerProducts.filter(p => p.assignedCustomers?.includes(selectedClientId));

  const NAV_ITEMS = [
    { key: 'clients',           icon: <Users size={15} />,   label: 'Client Pricing' },
    { key: 'all-clients',       icon: <Globe size={15} />,   label: 'All Clients Matrix' },
    { key: 'global-catalog',    icon: <Layers size={15} />,  label: 'Add Product' },
    { key: 'customer-products', icon: <Package size={15} />, label: 'Client Products' },
  ];

  const TAB_TITLES = {
    'clients':           'Contract Pricing Control',
    'all-clients':       'Master Pricing Cross-Reference',
    'global-catalog':    'Product Creation System',
    'customer-products': 'Client-Assigned Products',
  };

  return (
    <div className="ad-shell">
      {showAddModal && (
        <AddCustomerProductModal
          customers={customers}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCustomerProduct}
        />
      )}

      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo"><h2>Paktex</h2><span>Inventory Console</span></div>
        <nav className="ad-nav-group">
          {NAV_ITEMS.map(({ key, icon, label }) => (
            <button key={key} className={`ad-nav-btn ${currentTab === key ? 'active' : ''}`} onClick={() => setCurrentTab(key)}>
              {icon} {label}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-footer">
          <p className="ad-operator-label">Operator: <strong>{getClientName(user)}</strong></p>
          <button className="ad-logout-btn" onClick={logout}><LogOut size={14} /> Log Out Session</button>
        </div>
      </aside>

      <main className="ad-viewport">
        <header className="ad-viewport-header">
          <h1>{TAB_TITLES[currentTab]}</h1>
          <div className="ad-header-actions">
            <div className="ad-status-pill"><CheckCircle size={10} color="#b39246" /> Console Active</div>
          </div>
        </header>

        {/* ── CLIENT PRICING TAB ── */}
        {currentTab === 'clients' && (
          <div className="ad-split-grid">
            <div className="ad-card">
              <div className="ad-card-header">
                <h3>Select Target Client</h3>
                <span className="ad-badge">{customers.length} Registered</span>
              </div>
              {customers.length === 0 ? (
                <div className="ad-empty-clients">
                  <ShieldAlert size={24} style={{ color: '#b39246', marginBottom: '12px' }} />
                  <p>No client records found.</p>
                </div>
              ) : (
                <div className="ad-client-list">
                  {customers.map(client => {
                    const ruleCount     = pricingRules.filter(r => r.customerId === client.id).length;
                    const custProdCount = customerProducts.filter(p => p.assignedCustomers?.includes(client.id)).length;
                    return (
                      <div key={client.id}
                        className={`ad-client-card ${selectedClientId === client.id ? 'active' : ''}`}
                        onClick={() => { setSelectedClientId(client.id); setTargetProductId(''); }}>
                        <div>
                          <p className="ad-client-card-name">{getClientName(client)}</p>
                          <span className="ad-client-card-sub">{client.city || 'Standard Territory'}</span>
                        </div>
                        <div className="ad-client-card-badges">
                          {ruleCount     > 0 && <span className="ad-override-pill">{ruleCount} Price Rules</span>}
                          {custProdCount > 0 && <span className="ad-prod-pill">{custProdCount} Products</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside>
              <div className="ad-card">
                <div className="ad-card-header"><h3>Contract Pricing Setup</h3></div>
                {selectedClient ? (
                  <>
                    <div className="ad-focus-banner">
                      <span className="ad-focus-banner-label">Configuring Rates For</span>
                      <h2>{getClientName(selectedClient)}</h2>
                    </div>
                    <form onSubmit={handleAssignPriceOverride}>
                      <div className="ad-form-group">
                        <label className="ad-label">Select Baseline Material</label>
                        <div className="ad-product-plate-list">
                          {products.map(prod => (
                            <div key={prod.id}
                              className={`ad-product-plate ${targetProductId === prod.id ? 'selected' : ''}`}
                              onClick={() => setTargetProductId(prod.id)}>
                              <div className="ad-product-plate-left">
                                <img src={prod.image || 'https://via.placeholder.com/40'} alt="" />
                                <div>
                                  <span className="ad-product-plate-name">{prod.name}</span>
                                  <code className="ad-product-plate-sku">{prod.sku}</code>
                                </div>
                              </div>
                              <div className="ad-product-plate-right">
                                <span className="ad-product-plate-label">Standard</span>
                                <span className="ad-product-plate-price">₨ {Number(prod.basePrice).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ad-form-group">
                        <label className="ad-label">Contract Price (₨)</label>
                        <input className="ad-input" type="number" required disabled={!targetProductId}
                          placeholder={targetProductId ? 'Enter client-specific rate' : 'Select a product first'}
                          value={customPriceInput} onChange={e => setCustomPriceInput(e.target.value)} />
                      </div>
                      <button type="submit" className="ad-btn-black" disabled={!targetProductId}>
                        Apply Contract Price Override
                      </button>
                    </form>

                    <h4 className="ad-divider-title">Active Price Overrides — {getClientName(selectedClient)}</h4>
                    {isolatedRules.length === 0 ? (
                      <div className="ad-empty-box">No overrides set. Client is on standard market pricing.</div>
                    ) : (
                      isolatedRules.map(rule => {
                        const prod = products.find(p => p.id === rule.productId);
                        return (
                          <div key={rule.id} className="ad-rule-row">
                            <div>
                              <span className="ad-rule-row-name">{prod?.name}</span>
                              <span className="ad-rule-row-base">Base: ₨ {Number(prod?.basePrice || 0).toLocaleString()}</span>
                            </div>
                            <div className="ad-rule-row-right">
                              <span className="ad-rule-price">₨ {Number(rule.customizedPrice).toLocaleString()}</span>
                              <button className="ad-delete-btn" onClick={() => deletePricingRule(rule.id)}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <h4 className="ad-divider-title">Client-Specific Products — {getClientName(selectedClient)}</h4>
                    {clientCustProds.length === 0 ? (
                      <div className="ad-empty-box-large">
                        <Package size={22} style={{ color: '#ccc' }} />
                        <span>No products assigned exclusively to this client.</span>
                        <button className="ad-btn-gold" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowAddModal(true)}>
                          <PlusCircle size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Assign Product
                        </button>
                      </div>
                    ) : (
                      clientCustProds.map(cp => (
                        <div key={cp.id} className="ad-cust-prod-card">
                          <div className="ad-cust-prod-left">
                            <img src={cp.image} alt={cp.name} />
                            <div>
                              <span className="ad-cust-prod-name">{cp.name}</span>
                              <code className="ad-cust-prod-sku">{cp.sku}</code>
                              {cp.description && <p className="ad-cust-prod-desc">{cp.description}</p>}
                            </div>
                          </div>
                          <div className="ad-cust-prod-right">
                            <span className="ad-cust-prod-price">₨ {(cp.customerPricing?.[selectedClientId] || cp.basePrice).toLocaleString()}</span>
                            <button className="ad-delete-btn" onClick={() => deleteCustomerProduct(cp.id)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <div className="ad-placeholder-box">Select a business profile on the left to activate controls.</div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* ── ALL CLIENTS MATRIX TAB ── */}
        {currentTab === 'all-clients' && (
          <div className="ad-matrix-stack">
            <div className="ad-card">
              <div className="ad-card-header"><h3>Live Valuation Matrix — All Corporate Clients</h3></div>
              <div className="ad-table-wrapper">
                <table className="ad-matrix-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      {products.map(p => <th key={p.id}>{p.name}</th>)}
                      {customerProducts.length > 0 && <th className="gold-col">Client Products</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(client => {
                      const custProds = customerProducts.filter(p => p.assignedCustomers?.includes(client.id));
                      return (
                        <tr key={client.id}>
                          <td><span className="ad-matrix-client-name">{getClientName(client)}</span></td>
                          {products.map(prod => {
                            const rule = pricingRules.find(r => r.customerId === client.id && r.productId === prod.id);
                            return (
                              <td key={prod.id}>
                                <span className={`ad-matrix-price ${rule ? 'gold' : ''}`}>
                                  ₨ {rule ? Number(rule.customizedPrice).toLocaleString() : Number(prod.basePrice).toLocaleString()}
                                </span>
                                <span className={`ad-matrix-price-label ${rule ? 'gold' : 'muted'}`}>{rule ? 'Contract' : 'Standard'}</span>
                              </td>
                            );
                          })}
                          {customerProducts.length > 0 && (
                            <td>
                              {custProds.length === 0
                                ? <span style={{ color: '#ddd', fontSize: '12px' }}>—</span>
                                : (
                                  <div className="ad-matrix-cust-prod-list">
                                    {custProds.map(cp => (
                                      <div key={cp.id} className="ad-matrix-cust-prod-item">
                                        <span>{cp.name}</span>
                                        <em>₨ {(cp.customerPricing?.[client.id] || cp.basePrice).toLocaleString()}</em>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── GLOBAL CATALOG TAB ── */}
        {currentTab === 'global-catalog' && (
          <div className="ad-catalog-split">
            <div className="ad-card">
              <div className="ad-card-header"><h3>Mint New Global SKU</h3></div>
              <form onSubmit={handleCreateProduct}>
                <div className="ad-form-group">
                  <label className="ad-label">Material / Item Name *</label>
                  <input className="ad-input" placeholder="e.g. Pure Kimkhwab Silk" required value={newProdName} onChange={e => setNewProdName(e.target.value)} />
                </div>
                <div className="ad-form-group">
                  <label className="ad-label">SKU Code *</label>
                  <input className="ad-input" placeholder="e.g. SILK-991" required value={newProdSku} onChange={e => setNewProdSku(e.target.value)} />
                </div>
                <div className="ad-form-group">
                  <label className="ad-label">Description</label>
                  <textarea className="ad-textarea" placeholder="Quality grade, weight, notes..." value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} />
                </div>
                <div className="ad-form-group">
                  <label className="ad-label">Baseline Wholesale Price (₨) *</label>
                  <input className="ad-input" type="number" placeholder="Base market value" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} />
                </div>
                <div className="ad-form-group">
                  <label className="ad-label">Product Image</label>
                  <ImageInput value={newProdImg} onChange={setNewProdImg} preview={newProdImgPreview} onPreview={setNewProdImgPreview} />
                </div>
                <button type="submit" className="ad-btn-black">Inject Into Base Pipeline</button>
              </form>
            </div>
            <div className="ad-card">
              <div className="ad-card-header">
                <h3>Base Inventory</h3>
                <span className="ad-badge">{products.length} SKUs</span>
              </div>
              <div className="ad-catalog-grid">
                {products.map(p => (
                  <div key={p.id} className="ad-catalog-card">
                    <img src={p.image || 'https://via.placeholder.com/300x150'} alt={p.name} />
                    <div className="ad-catalog-card-body">
                      <code className="ad-catalog-sku">{p.sku}</code>
                      <h4>{p.name}</h4>
                      {p.description && <p>{p.description}</p>}
                      <div className="ad-catalog-price-row">
                        <div>
                          <span>Baseline</span>
                          <strong>₨ {Number(p.basePrice).toLocaleString()}</strong>
                        </div>
                        <button className="ad-delete-btn" title="Delete product" onClick={() => {
                          if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                            handleDeleteProduct(p.id);
                          }
                        }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMER PRODUCTS TAB ── */}
        {currentTab === 'customer-products' && (
          <div>
            <div className="ad-cust-tab-banner">
              <div>
                <h3>Client-Specific Product Assignments</h3>
                <p>Products created exclusively for selected clients with custom per-client pricing.</p>
              </div>
              <button className="ad-btn-gold" onClick={() => setShowAddModal(true)}>
                <PlusCircle size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Add Product
              </button>
            </div>
            {customerProducts.length === 0 ? (
              <div className="ad-empty-box-large">
                <Package size={32} style={{ color: '#ddd' }} />
                <span>No client-specific products created yet.</span>
                <button className="ad-btn-gold" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => setShowAddModal(true)}>
                  Create First Client Product
                </button>
              </div>
            ) : (
              customers.map(client => {
                const prods = customerProducts.filter(p => p.assignedCustomers?.includes(client.id));
                if (prods.length === 0) return null;
                return (
                  <div key={client.id} className="ad-card">
                    <div className="ad-card-header">
                      <h3>{getClientName(client)}</h3>
                      <span className="ad-badge">{prods.length} Product{prods.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="ad-catalog-grid">
                      {prods.map(cp => (
                        <div key={cp.id} className="ad-catalog-card">
                          <img src={cp.image} alt={cp.name} />
                          <div className="ad-catalog-card-body">
                            <code className="ad-catalog-sku">{cp.sku}</code>
                            <h4>{cp.name}</h4>
                            {cp.description && <p>{cp.description}</p>}
                            <div className="ad-catalog-price-row">
                              <div>
                                <span>Client Rate</span>
                                <strong style={{ color: '#b39246', display: 'block' }}>
                                  ₨ {(cp.customerPricing?.[client.id] || cp.basePrice).toLocaleString()}
                                </strong>
                              </div>
                              <button className="ad-delete-btn" onClick={() => deleteCustomerProduct(cp.id)}><Trash2 size={13} /></button>
                            </div>
                            {cp.assignedCustomers?.length > 1 && (
                              <div className="ad-assigned-breakdown">
                                <span className="ad-assigned-breakdown-label">Also assigned to</span>
                                {cp.assignedCustomers.filter(cId => cId !== client.id).map(cId => {
                                  const other = customers.find(c => c.id === cId);
                                  return (
                                    <div key={cId} className="ad-assigned-breakdown-row">
                                      <span>{getClientName(other)}</span>
                                      <strong>₨ {(cp.customerPricing?.[cId] || cp.basePrice).toLocaleString()}</strong>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;