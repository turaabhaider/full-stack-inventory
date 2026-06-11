import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import CustomerPortal from './views/CustomerPortal';
import HomePage from './components/HomePage';
import WelcomeScreen from './components/Welcomescreen';
import './styles/global.css';

function App() {
  const { user } = useContext(AppContext);
  const [showLogin, setShowLogin] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);

  // Show welcome splash on first load
  if (!welcomeDone) {
    return <WelcomeScreen onDone={() => setWelcomeDone(true)} />;
  }

  // Logged in — show correct dashboard
  if (user) {
    return user.role === 'admin' ? <AdminDashboard /> : <CustomerPortal />;
  }

  // Not logged in — show login page or homepage
  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  // Default: public homepage
  return <HomePage onLoginClick={() => setShowLogin(true)} />;
}

export default App;