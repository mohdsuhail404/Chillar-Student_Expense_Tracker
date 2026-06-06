import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { generateAvatarColor, getInitials } from '../../utils/helpers';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { budget } = useExpenses();

  const alertCount = budget?.alerts?.filter(a => a.type === 'danger').length || 0;
  const avatarColor = generateAvatarColor(user?.name);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <button
        className="btn btn-ghost"
        onClick={onMenuClick}
        style={{ display: 'none' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Alert Bell */}
        <button className="btn btn-ghost" style={{ position: 'relative' }}>
          <Bell size={18} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: 'var(--danger)',
              borderRadius: '50%',
              border: '2px solid var(--bg-primary)'
            }} />
          )}
        </button>

        {/* Avatar */}
        <div
          className="user-avatar"
          style={{ background: avatarColor, cursor: 'pointer' }}
        >
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;