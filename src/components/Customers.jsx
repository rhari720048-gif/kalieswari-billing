import React, { useState } from 'react';
import { Plus, Phone, Search, User, History, X, Receipt } from 'lucide-react';

export default function Customers({ customers = [], onAddCustomer, onSelectCustomerForBill, bills = [] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form fields matching user request (No GST field!)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Selected customer for viewing history modal
  const [selectedCustHistory, setSelectedCustHistory] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    onAddCustomer({ 
      name, 
      phone, 
      city: city || 'Sivakasi', 
      total_billed: 0, 
      total_bills: 0 
    });

    setName('');
    setPhone('');
    setCity('');
    setShowAddModal(false);
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const getCustomerBills = (cust) => {
    if (!cust) return [];
    return bills.filter(b => 
      (b.customer_phone && b.customer_phone === cust.phone) ||
      (b.customer_name && b.customer_name.toLowerCase() === cust.name.toLowerCase())
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP TITLE & HEADER CARD */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Customer Directory</h1>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecdd3', padding: '2px 10px', borderRadius: '12px' }}>
              {customers.length} Customers
            </span>
          </div>

        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* 2. SEARCH & TABLE CARD */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '18px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              background: '#f8fafc'
            }}
          />
        </div>

        {/* Customer Directory Table without GST column */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cart-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '160px' }}>CUSTOMER NAME</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>MOBILE NUMBER</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', minWidth: '160px', maxWidth: '240px' }}>CITY / ADDRESS</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>TOTAL BILLED (₹)</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>TOTAL BILLS</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', fontSize: '14px', minWidth: '160px' }}>
                      {c.name}
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 600, fontSize: '13px' }}>
                        <Phone size={14} color="#991b1b" /> {c.phone}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#475569', fontSize: '13px', minWidth: '160px', maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word', wordWrap: 'break-word' }}>
                      {c.city || '-'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, color: '#991b1b', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      ₹{(c.total_billed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8'
                      }}>
                        {c.total_bills || 0} Bills
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedCustHistory(c)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <History size={13} /> Bills ({c.total_bills || 0})
                        </button>
                        
                        <button
                          onClick={() => onSelectCustomerForBill && onSelectCustomerForBill(c)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                          }}
                        >
                          New Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No customers found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ADD NEW CUSTOMER MODAL (without GST field) */}
      {showAddModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="modal-content" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#dc2626" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add New Customer</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M/S. K.R. TRADERS"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9842154321"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  City / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. BANGALORE"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  Save Customer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER BILL HISTORY MODAL */}
      {selectedCustHistory && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="modal-content" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Billing History: {selectedCustHistory.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Phone: {selectedCustHistory.phone} | City: {selectedCustHistory.city}</span>
              </div>
              <button onClick={() => setSelectedCustHistory(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {getCustomerBills(selectedCustHistory).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                {getCustomerBills(selectedCustHistory).map((bill, i) => (
                  <div key={i} style={{ padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{bill.bill_no}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Date: {bill.created_at || 'Recent'} | Payment: {bill.payment_mode || 'Cash'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '15px' }}>₹{bill.grand_total}</div>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', fontWeight: 700 }}>
                        {bill.status || 'Paid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
                <Receipt size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <div>No previous bills found for this customer.</div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedCustHistory(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
