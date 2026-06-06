import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, PieChart, Wallet,
  Settings, LogOut, TrendingUp, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateAvatarColor, getInitials } from '../../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarColor = generateAvatarColor(user?.name);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-150"
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">💸</div>
          <span className="logo-text">CHILLAR</span>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto', display: 'none' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="nav-section">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
              onClick={() => handleNav(path)}
            >
              <span className="nav-icon"><Icon size={18} /></span>
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 8 }}>
          <button className="nav-link" onClick={handleLogout} style={{ color: '#f87171' }}>
            <span className="nav-icon"><LogOut size={18} /></span>
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-card">
            <div
              className="user-avatar"
              style={{ background: avatarColor }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;