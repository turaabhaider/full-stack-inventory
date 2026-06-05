/* src/App.jsx */
import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import CustomerPortal from './views/CustomerPortal';
import './styles/global.css';

function App() {
  const { user } = useContext(AppContext);

  if (!user) {
    return <Login />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <CustomerPortal />;
}

export default App;