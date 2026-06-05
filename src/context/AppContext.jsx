import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Populated baseline products so your catalog displays immediately if localStorage is fresh
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ptx_products');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', sku: 'SILK-001', name: 'Premium Banarasi Silk', basePrice: 4500 },
      { id: 'p2', sku: 'COTN-092', name: 'Egyptian Long-Staple Cotton', basePrice: 1800 }
    ];
  });

  // customerProducts lives in context + localStorage so both Admin & Customer see them
  const [customerProducts, setCustomerProducts] = useState(() => {
    const saved = localStorage.getItem('ptx_customer_products');
    return saved ? JSON.parse(saved) : [];
  });

  // Updated default roster to eliminate accommodation and website values
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('ptx_customers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'c1',
        name: 'Textile Hub Corp',
        email: 'hub@textilecorp.com',
        phone: '02135551234',
      },
    ];
  });

  const [pricingRules, setPricingRules] = useState(() => {
    const saved = localStorage.getItem('ptx_pricing_rules');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ptx_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ptx_customer_products', JSON.stringify(customerProducts));
  }, [customerProducts]);

  useEffect(() => {
    localStorage.setItem('ptx_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('ptx_pricing_rules', JSON.stringify(pricingRules));
  }, [pricingRules]);

  const login = (userData) => setUser(userData);
  const logout = () => { setUser(null); setCart([]); };

  // Strict Pipeline: Only processes name, email, password, and phone number 
  const registerCustomer = (formData) => {
    const sanitizedPhone = formData.phone.replace(/\+/g, '');
    const generatedId = 'client_' + Math.random().toString(36).substr(2, 9);
    
    const newClient = {
      id: generatedId,
      name: formData.name,
      email: formData.email.toLowerCase().trim(),
      phone: sanitizedPhone,
      password: formData.password,
    };
    
    setCustomers(prev => [...prev, newClient]);
    return newClient;
  };

  const upsertPricingRule = (productId, customerId, price) => {
    const numericPrice = parseFloat(price);
    const existingIndex = pricingRules.findIndex(
      r => r.productId === productId && r.customerId === customerId
    );
    if (existingIndex > -1) {
      const updated = [...pricingRules];
      updated[existingIndex].customizedPrice = numericPrice;
      setPricingRules(updated);
    } else {
      setPricingRules(prev => [
        ...prev,
        { id: 'r_' + Date.now(), customerId, productId, customizedPrice: numericPrice },
      ]);
    }
  };

  const deletePricingRule = (ruleId) => {
    setPricingRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const getProductPriceForCustomer = (productId, customerId) => {
    const match = pricingRules.find(
      r => r.productId === productId && r.customerId === customerId
    );
    if (match) return match.customizedPrice;
    
    const prod = products.find(p => p.id === productId);
    if (prod) return prod.basePrice;
    
    const cp = customerProducts.find(p => p.id === productId);
    return cp ? (cp.customerPricing?.[customerId] ?? cp.basePrice) : 0;
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout,
        products, setProducts,
        customerProducts, setCustomerProducts,
        customers, setCustomers,
        pricingRules, cart,
        registerCustomer,
        upsertPricingRule,
        deletePricingRule,
        getProductPriceForCustomer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};