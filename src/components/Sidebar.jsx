import React from 'react';
import { 
  Home, 
  Receipt, 
  History, 
  Users, 
  Package, 
  Archive, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isOpen, setIsOpen, shopSettings }) {
  const navGroups = [
    {
      title: null,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home }
      ]
    },
    {
      title: 'BILLING',
      items: [
        { id: 'new-bill', label: 'New Bill', icon: Receipt },
        { id: 'bill-history', label: 'Bill History', icon: History }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'customers', label: 'Customers', icon: Users }
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { id: 'product-list', label: 'Product List', icon: Package }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header matching screenshot */}
        <div className="sidebar-brand" style={{ gap: '10px', alignItems: 'center' }}>
          <img src="/logo.png" alt="Sri Kalieswari Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', background: '#ffffff', borderRadius: '6px', padding: '2px' }} />
          <span className="brand-title" style={{ 
            fontSize: '14px', 
            fontWeight: 900, 
            color: '#ffffff',
            fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', serif",
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            lineHeight: 1.25
          }}>
            {shopSettings?.shopName || 'Sri Kalieswari Crackers'}
          </span>
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Menu matching exact 8 links */}
        <div className="sidebar-menu">
          {navGroups.map((group, idx) => (
            <div key={idx} className="menu-group">
              {group.title && (
                <div className="menu-group-title">{group.title}</div>
              )}
              {group.items.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="nav-item-icon">
                      <IconComponent size={18} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0) : 'K'}
            </div>
            <div>
              <div className="user-name">{user?.name || 'Kalieswari Admin'}</div>
              <div className="user-role">{user?.role || 'Admin / Cashier'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
