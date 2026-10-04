import React from 'react';
import { TrendingUp, DollarSign, Award, CreditCard, Wallet, Smartphone, Clock } from 'lucide-react';

export default function Reports({ stats, bills = [] }) {
  const totalNetCollection = bills.reduce((sum, b) => sum + Number(b.grand_total || 0), 0);
  const totalGrossMRP = bills.reduce((sum, b) => sum + Number(b.subtotal || b.grand_total || 0), 0);
  const totalDiscount = bills.reduce((sum, b) => sum + Number(b.discount_total || 0), 0);

  const cashSales = bills
    .filter(b => (b.payment_mode || 'Cash') === 'Cash')
    .reduce((sum, b) => sum + Number(b.grand_total || 0), 0);

  const upiSales = bills
    .filter(b => b.payment_mode === 'UPI')
    .reduce((sum, b) => sum + Number(b.grand_total || 0), 0);

  const cardSales = bills
    .filter(b => b.payment_mode === 'Card')
    .reduce((sum, b) => sum + Number(b.grand_total || 0), 0);

  const pendingCredit = bills
    .reduce((sum, b) => sum + Number(b.pending_amount || 0), 0);

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">Sales & Billing Analytics Report</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Gross MRP</span>
            <span className="stat-value">₹{Math.round(totalGrossMRP).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <DollarSign size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Discount Savings</span>
            <span className="stat-value">₹{Math.round(totalDiscount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <Award size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Net Collection</span>
            <span className="stat-value" style={{ color: '#dc2626' }}>
              ₹{Math.round(totalNetCollection).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>Payment Method Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Wallet size={14} color="#991b1b" /> Cash Sales
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>
              ₹{Math.round(cashSales).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Smartphone size={14} color="#6366f1" /> GPay / UPI
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#6366f1' }}>
              ₹{Math.round(upiSales).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <CreditCard size={14} color="#3b82f6" /> Card Sales
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              ₹{Math.round(cardSales).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
