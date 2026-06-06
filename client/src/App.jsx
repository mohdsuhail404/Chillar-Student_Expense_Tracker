import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ExpenseList from './components/expenses/ExpenseList';
import Analytics from './components/dashboard/Analytics';
import BudgetManager from './components/budget/BudgetManager';
import ExpenseForm from './components/expenses/ExpenseForm';
import './styles/globals.css';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <Routes>
          <Route
            path="/dashboard"
            element={
              <Dashboard onAddExpense={() => setShowAddExpense(true)} />
            }
          />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/budget" element={<BudgetManager />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Quick Add from Dashboard */}
      {showAddExpense && (
        <ExpenseForm
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => setShowAddExpense(false)}
        />
      )}
    </div>
  );
};

// Simple Settings Page
const Settings = () => {
  const { user, updateUser, logout } = require('./context/AuthContext').useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const { authService } = require('./services/authService');
  const toast = require('react-hot-toast').default;

  const handleSave = async () => {
    try {
      await authService.updateProfile({ name, currency });
      updateUser({ name, currency });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 500 }}>
        <h2 className="card-title" style={{ marginBottom: 20 }}>Profile</h2>

        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={user?.email}
            className="form-control"
            disabled
          />
        </div>

        <div className="form-group">
          <label className="form-label">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="form-control"
          >
            <option value="INR">₹ Indian Rupee (INR)</option>
            <option value="USD">$ US Dollar (USD)</option>
            <option value="EUR">€ Euro (EUR)</option>
            <option value="GBP">£ British Pound (GBP)</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExpenseProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#16213e',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '0.875rem'
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#16213e' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#16213e' }
              }
            }}
          />
        </ExpenseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;