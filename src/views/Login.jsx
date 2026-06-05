import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './Login.css';

// Hardcoded production URL to bypass build-time environment variable issues
const API_BASE = 'https://backend-inventory-production-e725.up.railway.app/api';

const Login = () => {
  const { login } = useContext(AppContext);
  const [isAdmin, setIsAdmin] = useState(true);
  const [clientAction, setClientAction] = useState('login');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Connecting to:", `${API_BASE}/auth/login`);
    
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, isAdmin })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
      } else {
        setErrorMsg(data.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Connection Error:', err);
      setErrorMsg('Network error. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    if (regForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message);
        setClientAction('login');
        setUsername(regForm.name);
        setPassword('');
        setRegForm({ name: '', email: '', phone: '', password: '' });
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('Service unreachable.');
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => { setIsAdmin(true); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Logistics Admin
          </button>
          <button
            type="button"
            className={`role-tab-btn ${!isAdmin ? 'active' : ''}`}
            onClick={() => { setIsAdmin(false); setErrorMsg(''); setSuccessMsg(''); }}
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
              />
            </div>
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Establish Secure Connection'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistrationSubmit}>
            <div className="input-group-container">
              <label>Full Name</label>
              <input type="text" className="lux-input-field" required
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Email Address</label>
              <input type="email" className="lux-input-field" required
                value={regForm.email}
                onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Phone Number</label>
              <input type="text" className="lux-input-field"
                value={regForm.phone}
                onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Secure Password</label>
              <input type="password" className="lux-input-field" required
                value={regForm.password}
                onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
            </div>
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Corporate Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;