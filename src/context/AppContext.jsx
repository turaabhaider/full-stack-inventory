import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Guarantee a safe non-null string — prevents ANY .toLowerCase() crash ──────
const s = (val) => (val == null ? '' : String(val));

// ── Normalize a user/customer row coming from the DB ─────────────────────────
// Removes companyName requirement — just uses `name` everywhere
const normalizeUser = (u) => ({
  ...u,
  id:    s(u.id),
  role:  s(u.role),
  name:  s(u.name) || s(u.companyName) || 'Unknown',
  email: s(u.email),
  phone: s(u.phone),
  // Keep companyName as an alias so any old code referencing it doesn't break
  companyName: s(u.name) || s(u.companyName) || 'Unknown',
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('paktex_user'));
      return stored ? normalizeUser(stored) : null;
    } catch { return null; }
  });

  const [products,         setProductsState]       = useState([]);
  const [customers,        setCustomers]            = useState([]);
  const [pricingRules,     setPricingRulesState]    = useState([]);
  const [customerProducts, setCustomerProductsState] = useState([]);
  const [loading,          setLoading]              = useState(true);

  // ── Fetch everything from DB ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, custRes, rulesRes, cprodRes] = await Promise.all([
        fetch(`${API_BASE}/products`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/customers`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/pricing-rules`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/customer-products`).catch(() => ({ ok: false })),
      ]);

      const getJson = async (res) => (res.ok ? await res.json() : []);

      const [products, customers, pricingRules, customerProducts] = await Promise.all([
        getJson(prodRes),
        getJson(custRes),
        getJson(rulesRes),
        getJson(cprodRes),
      ]);

      // Force these to be arrays even if the API returns something weird
      setProductsState(Array.isArray(products) ? products : []);
      setCustomers(Array.isArray(customers) ? customers : []);
      setPricingRulesState(Array.isArray(pricingRules) ? pricingRules : []);
      setCustomerProductsState(Array.isArray(customerProducts) ? customerProducts : []);
      
    } catch (err) {
      console.error("Critical Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    sessionStorage.setItem('paktex_user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('paktex_user');
  };

  // ── Products ───────────────────────────────────────────────────────────────
  const setProducts = useCallback((updaterOrValue) => {
    setProductsState(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      if (next.length > prev.length) {
        const newProd = next[next.length - 1];
        fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        }).catch(err => console.error('Product save error:', err));
      }
      return next;
    });
  }, []);

  // ── Pricing Rules ──────────────────────────────────────────────────────────
  const upsertPricingRule = useCallback(async (productId, customerId, customizedPrice) => {
    const existingRule = pricingRules.find(
      r => r.productId === productId && r.customerId === customerId
    );
    const ruleId = existingRule?.id || `rule_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    setPricingRulesState(prev => {
      const filtered = prev.filter(r => !(r.productId === productId && r.customerId === customerId));
      return [...filtered, { id: ruleId, productId, customerId, customizedPrice: Number(customizedPrice) }];
    });

    try {
      await fetch(`${API_BASE}/pricing-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, productId, customerId, customizedPrice }),
      });
    } catch (err) {
      console.error('Pricing rule save error:', err);
    }
  }, [pricingRules]);

  const deletePricingRule = useCallback(async (ruleId) => {
    setPricingRulesState(prev => prev.filter(r => r.id !== ruleId));
    try {
      await fetch(`${API_BASE}/pricing-rules/${ruleId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Pricing rule delete error:', err);
    }
  }, []);

  // ── Customer Products ──────────────────────────────────────────────────────
  const setCustomerProducts = useCallback((updaterOrValue) => {
    setCustomerProductsState(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;

      if (next.length > prev.length) {
        const newProd = next[next.length - 1];
        fetch(`${API_BASE}/customer-products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd),
        }).catch(err => console.error('Customer product save error:', err));
      }

      if (next.length < prev.length) {
        const deleted = prev.find(p => !next.find(n => n.id === p.id));
        if (deleted) {
          fetch(`${API_BASE}/customer-products/${deleted.id}`, { method: 'DELETE' })
            .catch(err => console.error('Customer product delete error:', err));
        }
      }

      return next;
    });
  }, []);

  // ── Price Lookup ───────────────────────────────────────────────────────────
  const getProductPriceForCustomer = useCallback((productId, customerId) => {
    if (!customerId) return null;

    const custProd = customerProducts.find(p => p.id === productId);
    if (custProd?.customerPricing?.[customerId] !== undefined) {
      return custProd.customerPricing[customerId];
    }

    const rule = pricingRules.find(r => r.productId === productId && r.customerId === customerId);
    if (rule) return Number(rule.customizedPrice);

    const product = products.find(p => p.id === productId);
    return product ? Number(product.basePrice) : null;
  }, [customerProducts, pricingRules, products]);

  return (
    <AppContext.Provider value={{
      user, login, logout,
      products, setProducts,
      customers,
      pricingRules, upsertPricingRule, deletePricingRule,
      customerProducts, setCustomerProducts,
      getProductPriceForCustomer,
      loading,
      refreshAll: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
};
