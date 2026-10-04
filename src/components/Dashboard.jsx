import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Banknote, 
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ stats, onNavigate }) {
  const statCards = [
    {
      label: "Today's Sales",
      value: `₹${(stats?.todaysSales !== undefined ? stats.todaysSales : 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      label: "Bills Count",
      value: stats?.billsCount !== undefined ? stats.billsCount : 0,
      icon: Receipt,
      color: 'green'
    },
    {
      label: "Total Amount",
      value: `₹${(stats?.totalAmount !== undefined ? stats.totalAmount : 0).toLocaleString('en-IN')}`,
      icon: Banknote,
      color: 'purple'
    }
  ];

  return (
    <div>
      {/* 4 Stat Cards matching Photo 2 Design */}
      <div className="stats-grid">
        {statCards.map((card, index) => {
          const IconComp = card.icon;
          return (
            <div key={index} className="stat-card">
              <div className={`stat-icon-wrapper ${card.color}`}>
                <IconComp size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-label">{card.label}</span>
                <span className="stat-value">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity List matching Photo 2 */}
      <div className="dashboard-section" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Activity</h2>
          <button 
            onClick={() => onNavigate('bill-history')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#991b1b', 
              fontSize: '13px', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((bill, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b' }}>Bill #{bill.bill_no}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Customer: {bill.customer_name || 'Walk-in Customer'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: bill.status === 'Pending' ? '#ef4444' : '#dc2626' }}>
                    ₹{(Number(bill.grand_total) || 0).toLocaleString('en-IN')} {bill.status === 'Pending' ? '(Credit)' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{bill.created_at || 'Just now'}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              No bills created yet. Click "New Bill" to generate your first invoice!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
