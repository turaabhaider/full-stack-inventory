import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [customerProducts, setCustomerProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [cart, setCart] = useState([]);

  // Use the environment variable for your API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch all data from the database on initial load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/customers`)
        ]);
        
        if(pRes.ok) setProducts(await pRes.json());
        if(cRes.ok) setCustomers(await cRes.json());
      } catch (err) {
        console.error("Connection error, ensure backend is running:", err);
      }
    };
    fetchData();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => { setUser(null); setCart([]); };

  // Helper for prices
  const getProductPriceForCustomer = (productId, customerId) => {
    const match = pricingRules.find(r => r.productId === productId && r.customerId === customerId);
    if (match) return match.customizedPrice;
    const prod = products.find(p => p.id === productId);
    return prod ? prod.basePrice : 0;
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout,
        products, setProducts,
        customerProducts, setCustomerProducts,
        customers, setCustomers,
        pricingRules, setPricingRules, cart,
        getProductPriceForCustomer
      }}
    >
      {children}
    </AppContext.Provider>
  );
};