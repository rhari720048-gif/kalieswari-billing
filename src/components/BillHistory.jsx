import React, { useState } from 'react';
import { Search, Printer, Eye, Phone, Calendar, X, Receipt, CheckCircle, FileText, Trash2, AlertTriangle, MessageSquare } from 'lucide-react';
import InvoiceDocument from './InvoiceDocument';
import { getShopSettings } from '../utils/storage';
import { createInvoicePDF, downloadInvoicePDF } from '../utils/pdfGenerator';

export default function BillHistory({ bills = [], onDeleteBill }) {
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const filteredBills = bills.filter(b => 
    (b.bill_no && b.bill_no.toLowerCase().includes(search.toLowerCase())) ||
    (b.customer_name && b.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (b.customer_phone && b.customer_phone.includes(search))
  );

  const downloadPDF = async () => {
    const sourceEl = document.getElementById('history-modal-invoice-document') || document.querySelector('.printable-invoice');
    if (!sourceEl || !selectedBill) return;
    await downloadInvoicePDF(sourceEl, `Bill_${selectedBill.bill_no}.pdf`);
  };

  const shareWhatsApp = (billToShare) => {
    const bill = billToShare || selectedBill;
    let rawPhone = (bill?.customer_phone || '');
    let digits = rawPhone.replace(/\D/g, '');

    if (!digits) {
      const entered = window.prompt('Enter customer WhatsApp number:');
      if (!entered) return;
      digits = entered.replace(/\D/g, '');
    }

    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    if (digits.length === 10) {
      digits = '91' + digits;
    }

    if (!digits) return;

    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    const waUrl = isMobile
      ? `https://api.whatsapp.com/send?phone=${digits}`
      : `https://web.whatsapp.com/send?phone=${digits}`;

    window.open(waUrl, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP TITLE & HEADER CARD */}
      <div className="no-print" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Bill History</h1>
            <span style={{ fontSize: '12px', fontWeight: 700, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecdd3', padding: '2px 10px', borderRadius: '12px' }}>
              {bills.length} Bills Issued
            </span>
          </div>
      </div>

      {/* 2. SEARCH & NEAT TABLE CARD */}
      <div className="no-print" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '18px', maxWidth: '480px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by Bill #, Customer Name, or Phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        {/* Neat Table matching Customers page design */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cart-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>BILL NO</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>CUSTOMER NAME</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>MOBILE NUMBER</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>ITEMS</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>NET AMOUNT (₹)</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>PAYMENT</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>DATE</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.bill_no} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecdd3', padding: '4px 10px', borderRadius: '6px' }}>
                        {bill.bill_no}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                      {bill.customer_name || 'Walk-in Customer'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 600, fontSize: '13px' }}>
                        <Phone size={14} color="#991b1b" /> {bill.customer_phone || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#475569', fontSize: '13px' }}>
                      {bill.item_count || (bill.items ? bill.items.length : 1)} Items
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, color: '#991b1b', fontSize: '14px' }}>
                      ₹{(bill.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px' }}>
                        {bill.payment_mode || 'Cash'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 10px', 
                        borderRadius: '12px',
                        backgroundColor: bill.status === 'Paid' ? '#fef2f2' : '#fee2e2',
                        color: bill.status === 'Paid' ? '#991b1b' : '#991b1b'
                      }}>
                        {bill.status || 'Paid'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12px', color: '#64748b' }}>
                      {bill.created_at || 'Recent'}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#991b1b',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                          }}
                        >
                          <Eye size={14} /> View Bill
                        </button>

                        <button
                          onClick={() => setBillToDelete(bill)}
                          title="Delete Bill"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #fecdd3',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No bills found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RECEIPT MODAL */}
      {selectedBill && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="modal-content" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '820px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 800, fontSize: '16px' }}>
                <Receipt size={20} />
                <span>Bill Receipt ({selectedBill.bill_no})</span>
              </div>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <InvoiceDocument
              id="history-modal-invoice-document"
              billNo={selectedBill.bill_no}
              billDate={selectedBill.created_at || 'Recent'}
              customerName={selectedBill.customer_name}
              customerPhone={selectedBill.customer_phone}
              customerAddress={selectedBill.customer_address}
              items={selectedBill.items || []}
              paymentMode={selectedBill.payment_mode || 'Cash'}
              subtotal={selectedBill.subtotal || selectedBill.grand_total}
              discountTotal={selectedBill.discount_total || 0}
              grandTotal={selectedBill.grand_total || 0}
              status={selectedBill.status || 'Paid'}
            />

            <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button 
                className="btn-primary" 
                onClick={() => window.print()}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
              >
                <Printer size={16} /> Print Bill
              </button>
              <button 
                onClick={downloadPDF}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #dc2626', background: '#fef2f2', color: '#991b1b', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileText size={16} /> Download PDF
              </button>
              <button 
                onClick={() => shareWhatsApp(selectedBill)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)' }}
              >
                <MessageSquare size={16} /> WhatsApp Share
              </button>
              <button 
                onClick={() => setSelectedBill(null)} 
                style={{ flex: 0.6, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SCREEN CENTER CONFIRMATION TOAST MODAL FOR DELETING BILL */}
      {billToDelete && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', padding: '26px 28px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '90%', maxWidth: '420px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', border: '1px solid #fecdd3' }}>
              <AlertTriangle size={26} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Are you sure?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete bill <strong style={{ color: '#0f172a' }}>{billToDelete.bill_no}</strong> ({billToDelete.customer_name || 'Walk-in Customer'})? This action will permanently remove the bill from the database.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteBill) {
                    onDeleteBill(billToDelete.id || billToDelete.bill_no);
                  }
                  setBillToDelete(null);
                }}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
