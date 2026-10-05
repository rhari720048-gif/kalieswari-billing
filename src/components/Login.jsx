import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Calendar } from 'lucide-react';
import { getFinancialYears, getShopSettings } from '../utils/storage';

export default function Login({ onLoginSuccess }) {
  const shopSettings = getShopSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const availableYears = getFinancialYears();
  const [selectedYear, setSelectedYear] = useState(() => {
    return localStorage.getItem('kalieswari_financial_year') || '2026';
  });
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    localStorage.setItem('kalieswari_financial_year', selectedYear);

    if (email.trim() === 'admin@gmail.com' && password === 'admin@123') {
      onLoginSuccess({ id: 1, username: 'admin@gmail.com', name: 'Kalieswari Admin', role: 'Admin / Cashier', financialYear: selectedYear });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg-decor"></div>
      <div className="login-bg-decor-2"></div>

      <div className="login-card">
        <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '55px', width: 'auto', objectFit: 'contain', marginBottom: '6px', background: '#ffffff', padding: '4px 10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} 
          />
          <h1 className="login-title" style={{ fontSize: '20px', margin: 0, textAlign: 'center', color: '#0f172a' }}>{shopSettings.shopName || 'Sri Kalieswari'}</h1>
          <p className="login-subtitle" style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Cracker Shop Billing & Inventory System</p>
        </div>

        {error && <div className="error-badge" style={{ marginBottom: '16px' }}>{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          {/* FINANCIAL YEAR SELECTOR DROPDOWN */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991b1b', fontWeight: 800 }}>
              <Calendar size={15} color="#dc2626" /> Financial Billing Year
            </label>
            <div className="input-with-icon">
              <Calendar size={18} className="input-icon" style={{ color: '#dc2626' }} />
              <select
                className="form-input"
                value={selectedYear}
                onChange={e => {
                  setSelectedYear(e.target.value);
                  localStorage.setItem('kalieswari_financial_year', e.target.value);
                }}
                style={{
                  fontWeight: 700,
                  color: '#0f172a',
                  background: '#fff1f2',
                  border: '1.5px solid #fecdd3',
                  cursor: 'pointer'
                }}
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
            <span>Login to {selectedYear} Billing</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
