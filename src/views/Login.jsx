import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import './Login.css';

const API_BASE = 'https://backend-inventory-production-e725.up.railway.app/api';

const Login = ({ onBack }) => {
  const { login } = useContext(AppContext);
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [clientAction, setClientAction] = useState('login');
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [regForm,      setRegForm]      = useState({ name: '', email: '', phone: '', password: '' });

  const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };
  const switchToAdmin  = () => { setIsAdmin(true);  setUsername(''); setPassword(''); clearMessages(); };
  const switchToClient = () => { setIsAdmin(false); setUsername(''); setPassword(''); clearMessages(); };
  const switchAction   = (a) => { setClientAction(a); clearMessages(); };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, isAdmin }),
      });
      const data = await res.json();
      if (res.ok && data.success) { login(data.user); }
      else { setErrorMsg(data.error || 'Login failed.'); }
    } catch (err) {
      setErrorMsg('Network error — please check your connection.');
    } finally { setIsLoading(false); }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!regForm.name.trim())        return setErrorMsg('Full name is required.');
    if (!regForm.email.trim())       return setErrorMsg('Email is required.');
    if (regForm.password.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     regForm.name.trim(),
          email:    regForm.email.trim().toLowerCase(),
          phone:    regForm.phone.trim(),
          password: regForm.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Account created! You can now sign in.');
        setClientAction('login');
        setUsername(regForm.name.trim());
        setPassword('');
        setRegForm({ name: '', email: '', phone: '', password: '' });
      } else { setErrorMsg(data.error || 'Registration failed.'); }
    } catch (err) {
      setErrorMsg('Service unreachable — please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="login-root">
      <div className="login-card">

        {/* Back to homepage */}
        {onBack && (
          <button className="login-back-btn" onClick={onBack}>
            ← Back to Home
          </button>
        )}

        <div className="login-brand">
          <h2>Paktex Inventory</h2>
          <p>Commercial Distribution Control Panel</p>
        </div>

        <div className="role-selector-tabs">
          <button type="button" className={`role-tab-btn ${isAdmin ? 'active' : ''}`}  onClick={switchToAdmin}>Logistics Admin</button>
          <button type="button" className={`role-tab-btn ${!isAdmin ? 'active' : ''}`} onClick={switchToClient}>Client Portal</button>
        </div>

        {!isAdmin && (
          <div className="client-action-toggle-container">
            <button type="button" className={`client-action-link ${clientAction === 'login'    ? 'active' : ''}`} onClick={() => switchAction('login')}>Sign In</button>
            <button type="button" className={`client-action-link ${clientAction === 'register' ? 'active' : ''}`} onClick={() => switchAction('register')}>Create Account</button>
          </div>
        )}

        {errorMsg   && <p style={{ color: '#db4455', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: '#b39246', fontSize: '12px', textAlign: 'center', marginBottom: '16px', fontWeight: 'bold' }}>{successMsg}</p>}

        {(isAdmin || clientAction === 'login') && (
          <form onSubmit={handleAuthSubmit}>
            <div className="input-group-container">
              <label>{isAdmin ? 'Identification Code' : 'Client Name'}</label>
              <input type="text" className="lux-input-field" required autoComplete="username"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="input-group-container">
              <label>Security Passphrase</label>
              <input type="password" className="lux-input-field" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Establish Secure Connection'}
            </button>
          </form>
        )}

        {!isAdmin && clientAction === 'register' && (
          <form onSubmit={handleRegistrationSubmit}>
            <div className="input-group-container">
              <label>Full Name</label>
              <input type="text" className="lux-input-field" required autoComplete="name"
                value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Email Address</label>
              <input type="email" className="lux-input-field" required autoComplete="email"
                value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Phone Number <span style={{ opacity: 0.5, fontSize: '11px' }}>(no +)</span></label>
              <input type="tel" className="lux-input-field" autoComplete="tel"
                value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
            </div>
            <div className="input-group-container">
              <label>Secure Password</label>
              <input type="password" className="lux-input-field" required autoComplete="new-password"
                value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
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