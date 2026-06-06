import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './Login.css';

// Hardcoded production URL — bypasses build-time env var issues
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

  // ── Login submit ──────────────────────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, isAdmin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.user);
      } else {
        setErrorMsg(data.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Connection Error:', err);
      setErrorMsg('Network error — please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register submit ───────────────────────────────────────────────────────
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // FIX: validate before hitting network
    if (!regForm.name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!regForm.email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (regForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     regForm.name.trim(),
          email:    regForm.email.trim().toLowerCase(),
          phone:    regForm.phone.trim(),
          password: regForm.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Account created! You can now sign in.');
        setClientAction('login');
        // FIX: pre-fill the login name field with the registered name
        // but clear password so user types it themselves
        setUsername(regForm.name.trim());
        setPassword('');
        setRegForm({ name: '', email: '', phone: '', password: '' });
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('Service unreachable — please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Tab switch helpers ────────────────────────────────────────────────────
  const switchToAdmin = () => {
    setIsAdmin(true);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
  };

  const switchToClient = () => {
    setIsAdmin(false);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
  };

  const switchClientAction = (action) => {
    setClientAction(action);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">
          <h2>Paktex Inventory</h2>
          <p>Commercial Distribution Control Panel</p>
        </div>

        {/* Role tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab-btn ${isAdmin ? 'active' : ''}`}
            onClick={switchToAdmin}
          >
            Logistics Admin
          </button>
          <button
            type="button"
            className={`role-tab-btn ${!isAdmin ? 'active' : ''}`}
            onClick={switchToClient}
          >
            Client Portal
          </button>
        </div>

        {/* Sign in / Create account toggle (client only) */}
        {!isAdmin && (
          <div className="client-action-toggle-container">
            <button
              type="button"
              className={`client-action-link ${clientAction === 'login' ? 'active' : ''}`}
              onClick={() => switchClientAction('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`client-action-link ${clientAction === 'register' ? 'active' : ''}`}
              onClick={() => switchClientAction('register')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg   && <p className="msg-error">{errorMsg}</p>}
        {successMsg && <p className="msg-success">{successMsg}</p>}

        {/* ── Login form (Admin or Client sign-in) ── */}
        {(isAdmin || clientAction === 'login') && (
          <form onSubmit={handleAuthSubmit}>
            <div className="input-group-container">
              <label>{isAdmin ? 'Identification Code' : 'Client Name'}</label>
              <input
                type="text"
                className="lux-input-field"
                required
                autoComplete="username"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Establish Secure Connection'}
            </button>
          </form>
        )}

        {/* ── Registration form (Client only) ── */}
        {!isAdmin && clientAction === 'register' && (
          <form onSubmit={handleRegistrationSubmit}>
            <div className="input-group-container">
              <label>Full Name</label>
              <input
                type="text"
                className="lux-input-field"
                required
                autoComplete="name"
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })}
              />
            </div>
            <div className="input-group-container">
              <label>Email Address</label>
              <input
                type="email"
                className="lux-input-field"
                required
                autoComplete="email"
                value={regForm.email}
                onChange={e => setRegForm({ ...regForm, email: e.target.value })}
              />
            </div>
            <div className="input-group-container">
              <label>Phone Number <span style={{ opacity: 0.5, fontSize: '11px' }}>(no +)</span></label>
              <input
                type="tel"
                className="lux-input-field"
                autoComplete="tel"
                value={regForm.phone}
                onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
              />
            </div>
            <div className="input-group-container">
              <label>Secure Password</label>
              <input
                type="password"
                className="lux-input-field"
                required
                autoComplete="new-password"
                value={regForm.password}
                onChange={e => setRegForm({ ...regForm, password: e.target.value })}
              />
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