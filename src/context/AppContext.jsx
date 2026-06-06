import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext(null);

// Detect environment automatically
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Safe string helper — prevents .toLowerCase() / .trim() crashes ────────────
const safeStr = (val) => (val == null ? '' : String(val));

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('paktex_user')) || null; }
    catch { return null; }
  });

  const [products, setProductsState] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pricingRules, setPricingRulesState] = useState([]);
  const [customerProducts, setCustomerProductsState] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all data from DB on mount ───────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, custRes, rulesRes, cprodRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/customers`),
        fetch(`${API_BASE}/pricing-rules`),
        fetch(`${API_BASE}/customer-products`),
      ]);

      // Parse each response safely — never throw on bad JSON or non-200
      const safeJson = async (res) => {
        if (!res.ok) return [];
        try { return await res.json(); } catch { return []; }
      };

      const [prods, custs, rules, cprods] = await Promise.all([
        safeJson(prodRes),
        safeJson(custRes),
        safeJson(rulesRes),
        safeJson(cprodRes),
      ]);

      setProductsState(Array.isArray(prods) ? prods : []);

      // FIX: null-safe every string field so .toLowerCase() never crashes
      setCustomers(
        (Array.isArray(custs) ? custs : []).map(c => ({
          ...c,
          companyName: safeStr(c.companyName || c.name) || 'Unknown Client',
          name:        safeStr(c.name        || c.companyName) || 'Unknown Client',
          email:       safeStr(c.email),
          phone:       safeStr(c.phone),
        }))
      );

      setPricingRulesState(Array.isArray(rules) ? rules : []);
      setCustomerProductsState(Array.isArray(cprods) ? cprods : []);
    } catch (err) {
      console.error('AppContext fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = (userData) => {
    // FIX: normalise ALL string fields before storing — prevents undefined
    const normalised = {
      ...userData,
      companyName: safeStr(userData.companyName || userData.name) || 'User',
      name:        safeStr(userData.name        || userData.companyName) || 'User',
      email:       safeStr(userData.email),
      phone:       safeStr(userData.phone),
    };
    setUser(normalised);
    sessionStorage.setItem('paktex_user', JSON.stringify(normalised));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('paktex_user');
  };

  // ── Products ───────────────────────────────────────────────────────────────
  const setProducts = useCallback((updaterOrValue) => {
    setProductsState(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      // Detect newly added product (one more than before) → persist to DB
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

    // Optimistic update
    setPricingRulesState(prev => {
      const filtered = prev.filter(r => !(r.productId === productId && r.customerId === customerId));
      return [...filtered, { id: ruleId, productId, customerId, customizedPrice: Number(customizedPrice) }];
    });

    // Persist to DB
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

    // 1. Customer-exclusive product pricing
    const custProd = customerProducts.find(p => p.id === productId);
    if (custProd?.customerPricing?.[customerId] !== undefined) {
      return custProd.customerPricing[customerId];
    }

    // 2. Pricing rule overrides on global products
    const rule = pricingRules.find(r => r.productId === productId && r.customerId === customerId);
    if (rule) return Number(rule.customizedPrice);

    // 3. Base price fallback
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