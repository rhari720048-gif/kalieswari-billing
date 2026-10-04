import React from 'react';
import { CheckCircle, Sparkles, Phone } from 'lucide-react';
import { getShopSettings } from '../utils/storage';

export default function InvoiceDocument({ 
  billNo = 'INV-01',
  billDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
  customerName = 'Walk-in Customer',
  customerPhone = '',
  customerAddress = '',
  items = [],
  paymentMode = 'Cash',
  subtotal = 0,
  discountTotal = 0,
  grandTotal = 0,
  status = 'Paid',
  isLivePreview = false,
  shopSettings: propShopSettings
}) {
  const shopSettings = propShopSettings || getShopSettings();
  const formattedSubtotal = Math.round(subtotal);
  const formattedDiscount = Math.round(discountTotal);
  const formattedNetTotal = Math.round(grandTotal);

  return (
    <div className="invoice-document printable-invoice" style={{
      background: '#ffffff',
      borderRadius: '0px',
      border: 'none',
      boxShadow: 'none',
      padding: '24px 28px',
      color: '#0f172a',
      fontFamily: "'Inter', sans-serif",
      width: '100%',
      maxWidth: '860px',
      margin: '0 auto',
      position: 'relative'
    }}>

      {/* 1. BRAND HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/logo.png" 
            alt="Sri Kalieswari Crackers Logo" 
            style={{ height: '85px', width: 'auto', objectFit: 'contain' }} 
          />
          <div>
            <div style={{ 
              fontSize: '22px', 
              fontWeight: 900, 
              color: '#dc2626', 
              fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', serif",
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              lineHeight: 1.15
            }}>
              {shopSettings.shopName || 'Sri Kalieswari Crackers'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
              Quality Fireworks & Sparklers • Sivakasi
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600 }}>{shopSettings.address || 'Main Road, Sivakasi - 626123, Tamil Nadu'}</div>
          {shopSettings.gstin && shopSettings.gstin.trim() !== '' && (
            <div style={{ fontWeight: 700, color: '#0f172a' }}>GSTIN: {shopSettings.gstin}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
            <Phone size={11} color="#991b1b" /> {shopSettings.phone || '+91 98765 43210'}
          </div>
        </div>
      </div>

      {/* 2. INVOICE TITLE ROW & BADGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '1px' }}>
            INVOICE
          </h2>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', marginTop: '2px' }}>
            # {billNo}
          </div>
          <div style={{ width: '40px', height: '3px', background: '#dc2626', borderRadius: '2px', marginTop: '6px' }}></div>
        </div>

        {/* Top Right Status Card */}
        <div style={{
          background: status === 'Paid' ? '#fef2f2' : '#fff1f2',
          border: `1px solid ${status === 'Paid' ? '#fecdd3' : '#fecdd3'}`,
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color={status === 'Paid' ? '#991b1b' : '#e11d48'} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: status === 'Paid' ? '#991b1b' : '#be123c' }}>
                {status}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {status === 'Paid' ? 'Payment Completed' : 'Payment Pending'}
              </div>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '16px' }}>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#991b1b' }}>
              ₹{formattedNetTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right' }}>
              Total Amount
            </div>
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER ("BILL TO") & INVOICE DETAILS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px', background: '#f8fafc', padding: '18px 20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            Bill To
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            {customerName || 'Walk-in Customer'}
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
            {customerAddress || 'Sivakasi, Tamil Nadu'}
          </div>
          {customerPhone && (
            <div style={{ fontSize: '12px', color: '#991b1b', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {customerPhone}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Invoice No :</span>
            <span style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>{billNo}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Date & Time :</span>
            <span style={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>{billDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Payment Mode :</span>
            <span style={{ fontWeight: 700, color: '#991b1b', whiteSpace: 'nowrap' }}>{paymentMode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>Status :</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: status === 'Paid' ? '#991b1b' : '#b91c1c',
              background: status === 'Paid' ? '#fef2f2' : '#fef2f2',
              padding: '2px 8px',
              borderRadius: '6px',
              whiteSpace: 'nowrap'
            }}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* 4. ITEMS TABLE */}
      <div style={{ marginBottom: '28px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Items</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{items.length} Item(s)</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', width: '35px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', width: '70px', whiteSpace: 'nowrap' }}>Code</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Item Name</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'center', width: '85px' }}>MRP</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#dc2626', textAlign: 'center', width: '70px' }}>Discount</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'right', width: '80px' }}>Price</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'center', width: '50px' }}>Qty</th>
              <th style={{ padding: '10px', fontSize: '11px', fontWeight: 700, color: '#991b1b', textAlign: 'right', width: '95px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => {
                const mrpVal = Number(item.mrp || 0);
                const priceVal = Number(item.price || (item.discount_price !== undefined ? item.discount_price : (mrpVal * 0.1)));
                const itemTotal = priceVal * item.quantity;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecdd3', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {item.code}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      {item.name_tamil && (
                        <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600, marginTop: '2px' }}>{item.name_tamil}</div>
                      )}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', textDecoration: mrpVal > 0 ? 'line-through' : 'none', color: '#94a3b8' }}>
                      {mrpVal > 0 ? `₹${mrpVal.toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                        90%
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      ₹{Math.round(priceVal)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#991b1b' }}>
                      ₹{Math.round(itemTotal).toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No items added to invoice yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. PAYMENT SUMMARY & NOTES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        
        {/* Payment Summary Box */}
        <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '18px 20px', border: '1px solid #fecdd3' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> Payment Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Subtotal MRP</span>
              <span style={{ fontWeight: 700 }}>₹{formattedSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 700 }}>
              <span>Cracker Discount Savings</span>
              <span>-₹{formattedDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ borderTop: '1px dashed #fecdd3', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Net Total</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#991b1b' }}>
                ₹{formattedNetTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Box */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
            Notes & Terms
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.7 }}>
            <li>Thank you for your business!</li>
            <li>Goods once sold will not be taken back or exchanged.</li>
            <li>For any support, call {shopSettings.phone || '+91 98765 43210'}.</li>
          </ul>
        </div>
      </div>

      {/* 6. FOOTER */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>
            Thank You!
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            We appreciate your trust in {shopSettings.shopName || 'Kalieswari Crackers'}.
          </div>
        </div>
      </div>
    </div>
  );
}
