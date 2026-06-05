import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './Login.css';

const Login = () => {
  const { login, registerCustomer, customers } = useContext(AppContext);
  const [isAdmin, setIsAdmin] = useState(true);
  const [clientAction, setClientAction] = useState('login');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isAdmin) {
      if (username.trim() === 'admin' && password === 'paktex 2026') {
        login({ id: 'admin_root', role: 'admin', name: 'System Admin' });
      } else {
        setErrorMsg('Invalid administrative cryptographic signature.');
      }
    } else {
      const matchedClient = customers.find(
        c => c.companyName.toLowerCase().trim() === username.toLowerCase().trim() && c.password === password
      );

      if (matchedClient) {
        login({ id: matchedClient.id, role: 'client', name: matchedClient.companyName });
      } else {
        setErrorMsg('Client name or password not located in active registry.');
      }
    }
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clientNameClean = regForm.name.trim();
    const duplicate = customers.find(
      c => c.companyName.toLowerCase().trim() === clientNameClean.toLowerCase()
    );
    
    if (duplicate) {
      setErrorMsg('This company name is already registered.');
      return;
    }

    // Strict exact mapping constraint 
    const exactPayload = {
      companyName: clientNameClean,
      email: regForm.email.toLowerCase().trim(), 
      phone: regForm.phone.replace(/\+/g, ''),
      password: regForm.password
    };

    registerCustomer(exactPayload);
    setSuccessMsg(`Account for ${clientNameClean} compiled successfully.`);
    
    setClientAction('login');
    setUsername(clientNameClean);
    setRegForm({ name: '', email: '', phone: '', password: '' });
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">
          <h2>Paktex Inventory</h2>
          <p>Commercial Distribution Control Panel</p>
        </div>

        <div className="role-selector-tabs">
          <button 
            type="button" 
            className={`role-tab-btn ${isAdmin ? 'active' : ''}`}
            onClick={() => { setIsAdmin(true); setErrorMsg(''); setSuccessMsg(''); setUsername(''); setPassword(''); }}
          >
            Logistics Admin
          </button>
          <button 
            type="button" 
            className={`role-tab-btn ${!isAdmin ? 'active' : ''}`}
            onClick={() => { setIsAdmin(false); setErrorMsg(''); setSuccessMsg(''); setUsername(''); setPassword(''); }}
          >
            Client Portal
          </button>
        </div>

        {!isAdmin && (
          <div className="client-action-toggle-container">
            <button 
              type="button" 
              className={`client-action-link ${clientAction === 'login' ? 'active' : ''}`}
              onClick={() => { setClientAction('login'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`client-action-link ${clientAction === 'register' ? 'active' : ''}`}
              onClick={() => { setClientAction('register'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Create Account
            </button>
          </div>
        )}

        {errorMsg && <p style={{ color: '#db4455', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: '#b39246', fontSize: '12px', textAlign: 'center', marginBottom: '16px', fontWeight: 'bold' }}>{successMsg}</p>}

        {isAdmin || clientAction === 'login' ? (
          <form onSubmit={handleAuthSubmit}>
            <div className="input-group-container">
              <label>{isAdmin ? 'Identification Code' : 'Client Name'}</label>
              <input 
                type="text" 
                className="lux-input-field" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="" 
              />
            </div>

            <div className="input-group-container">
              <label>Security Passphrase</label>
              <input 
                type="password" 
                className="lux-input-field" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
              />
            </div>

            <button type="submit" className="login-submit-btn">
              Establish Secure Connection
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistrationSubmit} className="client-registration-grid-clean">
            <div className="input-group-container">
              <label>Full Name</label>
              <input 
                type="text" 
                className="lux-input-field" 
                required 
                value={regForm.name} 
                onChange={e => setRegForm({...regForm, name: e.target.value})} 
              />
            </div>

            <div className="input-group-container">
              <label>Email Address</label>
              <input 
                type="email" 
                className="lux-input-field" 
                required 
                value={regForm.email} 
                onChange={e => setRegForm({...regForm, email: e.target.value})} 
              />
            </div>

            <div className="input-group-container">
              <label>Phone Number (No +)</label>
              <input 
                type="text" 
                className="lux-input-field" 
                required 
                value={regForm.phone} 
                onChange={e => setRegForm({...regForm, phone: e.target.value})} 
              />
            </div>

            <div className="input-group-container">
              <label>Secure Password</label>
              <input 
                type="password" 
                className="lux-input-field" 
                required 
                value={regForm.password} 
                onChange={e => setRegForm({...regForm, password: e.target.value})} 
              />
            </div>

            <button type="submit" className="login-submit-btn structural-span-full">
              Register Corporate Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;