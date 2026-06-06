import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="logo-icon" style={{
          width: 52, height: 52,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.5rem'
        }}>
          💸
        </div>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Loading Chillar...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;