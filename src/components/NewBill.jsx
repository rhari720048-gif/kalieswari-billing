import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Printer, 
  CheckCircle, 
  Sparkles, 
  Receipt,
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Wallet,
  Smartphone,
  Layers,
  Plus,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveBill, getCustomers } from '../utils/storage';
import InvoiceDocument from './InvoiceDocument';
import { createInvoicePDF, downloadInvoicePDF } from '../utils/pdfGenerator';

export default function NewBill({ products, bills = [], onBillCreated, initialCustomer }) {
  const generateNextBillNo = (billsList) => {
    if (!billsList || !Array.isArray(billsList) || billsList.length === 0) {
      return 'INV-01';
    }
    const numbers = billsList.map(b => {
      if (!b || !b.bill_no) return 0;
      const match = String(b.bill_no).match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(n => !isNaN(n) && n > 0);

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `INV-${String(nextNum).padStart(2, '0')}`;
  };

  const [billNo, setBillNo] = useState(() => generateNextBillNo(bills));

  useEffect(() => {
    setBillNo(generateNextBillNo(bills));
  }, [bills]);

  // Live running time & date clock
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Customer state (Default empty unless initialCustomer provided!)
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustDropdownOpen, setIsCustDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState(initialCustomer ? initialCustomer.name || '' : '');
  const [customerAddress, setCustomerAddress] = useState(initialCustomer ? initialCustomer.city || '' : '');
  const [customerPhone, setCustomerPhone] = useState(initialCustomer ? initialCustomer.phone || '' : '');
  const [gstin, setGstin] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Product Selection & Cart state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Cash');

  // Per-product inline quantity inputs map { [productCode]: qtyNumber }
  const [itemQuantities, setItemQuantities] = useState({});

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);

  const categories = [
    'All',
    'ONE SOUND CRACKERS',
    'DELUXE CRACKERS',
    'GIANT CRACKERS',
    'GARLAND CRACKERS',
    'BIJILI CRACKERS',
    'BOMB CRACKERS',
    'ADIYAL',
    'GROUND CHAKKARA',
    'FLOWER POTS',
    'PEACOCK SERIES',
    'TWINKLING STAR',
    'SIREN',
    'LOVELY SPARKLERS',
    'ROCKET',
    'CHILDREN SPECIAL',
    'GUN SHOOT WAR',
    'MULTI COLOUR FOUNTAIN',
    'KIDS SPECIAL',
    '2026 SPECIAL EDITION',
    '2026 SPL EDUCATION',
    'MULTI COLOUR FOUNTAIN (SHOTS)',
    'FANCY OUT ITEMS',
    '7 CM SPARKLERS',
    '10 CM SPARKLERS',
    '12 CM SPARKLERS',
    '15 CM SPARKLERS',
    '30 CM SPARKLERS',
    '50 CM SPARKLERS',
    'GIFT BOX ( NO DISCOUNT )'
  ];

  useEffect(() => {
    const custs = getCustomers();
    setSavedCustomers(custs);
    if (initialCustomer) {
      setCustomerName(initialCustomer.name || '');
      setCustomerPhone(initialCustomer.phone || '');
      setCustomerAddress(initialCustomer.city || '');
      setCustomerSearchQuery(initialCustomer.name ? `${initialCustomer.name} (${initialCustomer.phone || ''})` : '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerSearchQuery('');
    }
  }, [initialCustomer]);

  const handleSelectCustomerFromPicker = (c) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone || '');
    setCustomerAddress(c.city || '');
    setCustomerSearchQuery(`${c.name} (${c.phone || ''})`);
    setIsCustDropdownOpen(false);
  };

  const filteredSavedCustomers = savedCustomers.filter(c => {
    const q = customerSearchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.name_tamil && p.name_tamil.includes(searchQuery)) ||
                          (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const shouldShowProducts = searchQuery.trim() !== '' || selectedCategory !== 'All';

  // Handle inline quantity change on card
  const handleInlineQtyChange = (code, value) => {
    setItemQuantities({
      ...itemQuantities,
      [code]: value
    });
  };

  // Add Product to Cart with inline quantity from card
  const addToCartWithQty = (product) => {
    const rawVal = itemQuantities[product.code];
    const qtyToAdd = Math.max(1, parseInt(rawVal, 10) || 1);
    const calculatedPrice = Number(product.discount_price !== undefined ? product.discount_price : (product.price || (product.mrp * 0.1)));

    const existingIndex = cart.findIndex(item => item.code === product.code);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qtyToAdd;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          ...product,
          discount_percent: 90,
          price: calculatedPrice,
          quantity: qtyToAdd
        }
      ]);
    }

    // Auto-hide product cards after adding to bill as requested
    setSearchQuery('');
    setSelectedCategory('All');
    setItemQuantities(prev => ({ ...prev, [product.code]: 1 }));
  };

  const updateQuantity = (code, delta) => {
    const updated = cart.map(item => {
      if (item.code === code) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const handleCartQtyChange = (code, valStr) => {
    const val = parseInt(valStr, 10);
    const updated = cart.map(item => {
      if (item.code === code) {
        return { ...item, quantity: isNaN(val) ? 0 : Math.max(0, val) };
      }
      return item;
    });
    setCart(updated);
  };

  const handleCartQtyBlur = (code) => {
    const updated = cart.map(item => {
      if (item.code === code) {
        return { ...item, quantity: item.quantity <= 0 ? 1 : item.quantity };
      }
      return item;
    });
    setCart(updated);
  };

  const removeFromCart = (code) => {
    setCart(cart.filter(item => item.code !== code));
  };

  const totalMRP = cart.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = totalMRP - grandTotal;
  const totalItemsCount = cart.length;
  const totalQtyCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSaveAndPrint = () => {
    if (cart.length === 0) {
      alert('Please add at least one cracker product to the bill!');
      return;
    }

    const billData = {
      bill_no: billNo,
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone,
      customer_address: customerAddress,
      gstin: gstin,
      items: cart,
      subtotal: totalMRP,
      discount_total: totalDiscount,
      grand_total: Math.round(grandTotal),
      paid_amount: paymentMode === 'Credit' ? 0 : Math.round(grandTotal),
      payment_mode: paymentMode
    };

    const saved = saveBill(billData);

    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.5 }
    });

    setCompletedBill(saved);
    setShowReceiptModal(true);
    if (onBillCreated) onBillCreated();

    // Reset Invoice Items cart & customer fields immediately after saving
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerSearchQuery('');
    setGstin('');
    setItemQuantities({});
    setSearchQuery('');
    setSelectedCategory('All');

    // Auto-trigger print dialog with the exact Live Invoice document design
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const downloadPDF = async () => {
    const sourceEl = (completedBill && document.getElementById('modal-invoice-document')) || document.getElementById('live-invoice-document') || document.querySelector('.printable-invoice');
    if (!sourceEl) return;
    await downloadInvoicePDF(sourceEl, `Bill_${completedBill?.bill_no || billNo}.pdf`);
  };

  const shareWhatsApp = (billToShare) => {
    const bill = billToShare || completedBill;
    let rawPhone = (bill?.customer_phone || customerPhone || '');
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
      
      {/* 1. TOP HEADER BAR */}
      <div className="no-print" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quick Billing</h1>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Kalieswari Crackers • Sivakasi | BILL NO: <strong style={{ color: '#dc2626' }}>{billNo}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Live Running Clock & Date Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fef2f2',
            border: '1px solid #fecdd3',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#991b1b',
            boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)'
          }}>
            <Clock size={15} color="#991b1b" />
            <span>{liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            <span style={{ color: '#fca5a5' }}>•</span>
            <Calendar size={14} color="#991b1b" />
            <span>{liveTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', fontSize: '14px' }}
            onClick={() => {
              setCart([]);
              setBillNo(generateNextBillNo(bills));
            }}
          >
            <Plus size={16} /> New Bill
          </button>
        </div>
      </div>

      {/* 2. CUSTOMER DETAILS CARD */}
      <div className="no-print" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Customer Details</h3>
            </div>
          </div>

          {/* Custom Searchable Customer Picker Combobox */}
          <div style={{ position: 'relative', width: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>Quick Pick:</span>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#991b1b' }} />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={customerSearchQuery}
                  onFocus={() => setIsCustDropdownOpen(true)}
                  onChange={e => {
                    setCustomerSearchQuery(e.target.value);
                    setIsCustDropdownOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 28px 7px 30px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
                {customerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerSearchQuery('');
                      setIsCustDropdownOpen(false);
                      setCustomerName('');
                      setCustomerPhone('');
                      setCustomerAddress('');
                    }}
                    style={{ position: 'absolute', right: '8px', top: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Floating Custom Dropdown Menu */}
            {isCustDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsCustDropdownOpen(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '320px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: '6px'
                }}>
                  {filteredSavedCustomers.length > 0 ? (
                    filteredSavedCustomers.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectCustomerFromPicker(c)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'background 0.15s',
                          borderBottom: i < filteredSavedCustomers.length - 1 ? '1px solid #f1f5f9' : 'none'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={11} /> {c.phone}
                          </span>
                        </div>
                        {c.city && (
                          <div 
                            title={c.city}
                            style={{ 
                              fontSize: '11px', 
                              color: '#64748b', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '290px'
                            }}
                          >
                            <MapPin size={11} color="#991b1b" style={{ flexShrink: 0 }} /> 
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.city.replace(/\s*,\s*/g, ', ').trim()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                      No matching saved customer found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} color="#991b1b" /> Customer Name
            </label>
            <input
              type="text"
              placeholder=""
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#991b1b" /> City / Address
            </label>
            <input
              type="text"
              placeholder=""
              value={customerAddress}
              onChange={e => setCustomerAddress(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="#991b1b" /> Mobile Number
            </label>
            <input
              type="text"
              placeholder=""
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '320px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#991b1b" /> Despatch / Bill Date
          </label>
          <input
            type="date"
            value={billDate}
            onChange={e => setBillDate(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#ffffff' }}
          />
        </div>
      </div>

      {/* 3. SELECT PRODUCT CARD */}
      <div className="no-print" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Search size={18} color="#dc2626" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Select Product</h3>
          <span style={{ fontSize: '11px', background: '#fef2f2', color: '#991b1b', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
            {products.length} Products Available
          </span>
        </div>

        {/* Category Pills */}
        <div className="categories-bar" style={{ marginBottom: '14px' }}>
          {categories.map(cat => {
            const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? '#dc2626' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#475569'
                }}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} className="input-icon" style={{ top: '12px' }} />
          <input
            type="text"
            className="product-search-input"
            placeholder="Search cracker product by Name, Code (e.g. K101), Category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px', marginBottom: 0 }}
          />
        </div>

        {/* Products Grid matching Photo 2 Design */}
        {shouldShowProducts ? (
          <div className="product-items-grid" style={{ maxHeight: '380px' }}>
            {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => {
                    const currentPrice = Number(product.discount_price !== undefined ? product.discount_price : (product.price || (product.mrp * 0.1)));
                    const rawQty = itemQuantities[product.code];
                    const currentQty = rawQty !== undefined ? rawQty : 1;
                    return (
                      <div
                        key={product.code}
                        className="product-item-card"
                        style={{ borderColor: '#e2e8f0', padding: '14px', background: '#ffffff', borderRadius: '10px' }}
                      >
                        {/* Top Badges Row matching photo 2 */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecdd3', padding: '2px 8px', borderRadius: '6px' }}>
                            {product.code}
                          </span>
                          <span style={{ fontSize: '10px', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {product.category}
                          </span>
                        </div>

                        {/* Title & Subtitle matching photo 2 */}
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px', lineHeight: 1.3 }}>
                          {product.name}
                        </div>
                        {product.name_tamil && (
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>
                            {product.name_tamil}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                          Sri Kalieswari • /{product.unit || '1 BOX'}
                        </div>

                        {/* Price & Discount Row + Inline Qty & Add Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>₹{currentPrice.toFixed(2)}</span>
                            {product.mrp > 0 && (
                              <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>₹{product.mrp}</span>
                            )}
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#991b1b', marginLeft: '2px' }}>
                              {product.mrp > 0 ? '90% OFF' : 'NET'}
                            </span>
                          </div>

                      {/* INLINE QUANTITY INPUT & + ADD BUTTON (Exact Photo 2 Design!) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                        <input
                          type="number"
                          min="1"
                          value={currentQty}
                          onFocus={e => e.target.select()}
                          onChange={e => handleInlineQtyChange(product.code, e.target.value)}
                          style={{
                            width: '60px',
                            padding: '6px 4px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => addToCartWithQty(product)}
                          style={{
                            padding: '7px 14px',
                            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No cracker products matched "{searchQuery}"
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#f8fafc', padding: '32px 20px', borderRadius: '10px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
            <Search size={24} color="#dc2626" style={{ marginBottom: '8px', opacity: 0.8 }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Type product name or code (e.g. K101) in the search box or select a category tab above to view products
            </div>
          </div>
        )}
      </div>

      {/* 4. SIDE-BY-SIDE: INVOICE ITEMS & PAYMENT MODE (LEFT) + LIVE INVOICE PREVIEW (RIGHT) */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Side: Invoice Items & Payment Mode Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Invoice Items Box (Compact Size) */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Layers size={18} color="#dc2626" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Invoice Items ({totalItemsCount})
              </h3>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <Receipt size={30} color="#dc2626" style={{ marginBottom: '6px', opacity: 0.6 }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>No Cracker Items Added</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '230px' }}>
                <table className="cart-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>#</th>
                      <th style={{ whiteSpace: 'nowrap', minWidth: '70px' }}>Code</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Item Name</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>MRP</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Disc%</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Price</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Qty</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Amount</th>
                      <th style={{ width: '30px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={item.code}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ whiteSpace: 'nowrap', minWidth: '70px' }}>
                          <span className="product-item-code" style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all', display: 'inline-block' }}>
                            {item.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ textDecoration: 'line-through', color: '#94a3b8', whiteSpace: 'nowrap' }}>₹{item.mrp}</td>
                        <td style={{ color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center' }}>{item.discount_percent}%</td>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'right' }}>₹{Math.round(item.price)}</td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button className="qty-btn" onClick={() => updateQuantity(item.code, -1)}>-</button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onFocus={e => e.target.select()}
                              onChange={e => handleCartQtyChange(item.code, e.target.value)}
                              onBlur={() => handleCartQtyBlur(item.code)}
                              style={{
                                width: '54px',
                                padding: '3px 4px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 700,
                                textAlign: 'center',
                                outline: 'none',
                                color: '#0f172a',
                                background: '#ffffff'
                              }}
                            />
                            <button className="qty-btn" onClick={() => updateQuantity(item.code, 1)}>+</button>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap' }}>
                          ₹{Math.round(item.price * item.quantity)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => removeFromCart(item.code)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAYMENT MODE & Summary Card right below Invoice Items */}
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', margin: 0 }}>PAYMENT MODE</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'Cash', label: 'Cash', icon: Wallet },
                { id: 'UPI', label: 'UPI', icon: Smartphone },
                { id: 'Card', label: 'Card', icon: CreditCard }
              ].map(pm => {
                const IconC = pm.icon;
                const isSelected = paymentMode === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMode(pm.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      background: isSelected ? '#fef2f2' : '#ffffff',
                      color: isSelected ? '#991b1b' : '#475569',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <IconC size={16} />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>Subtotal MRP:</span>
                <span>₹{Math.round(totalMRP)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>
                <span>Cracker Discount Savings:</span>
                <span>-₹{Math.round(totalDiscount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Net Total:</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>₹{Math.round(grandTotal)}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleSaveAndPrint}
              disabled={cart.length === 0}
              style={{
                padding: '14px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                opacity: cart.length === 0 ? 0.5 : 1,
                borderRadius: '10px'
              }}
            >
              <Printer size={18} />
              <span>SAVE & PRINT BILL</span>
            </button>
          </div>
        </div>

        {/* Right Side: Live Invoice Preview Bill */}
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
            Live Invoice Preview
          </h3>

          {!showReceiptModal && (
            <InvoiceDocument
              id="live-invoice-document"
              billNo={billNo}
              billDate={`${billDate} • ${liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`}
              customerName={customerName}
              customerPhone={customerPhone}
              customerAddress={customerAddress}
              items={cart}
              paymentMode={paymentMode}
              subtotal={totalMRP}
              discountTotal={totalDiscount}
              grandTotal={grandTotal}
              status="Paid"
              isLivePreview={true}
            />
          )}
        </div>
      </div>

      {/* 6. INVOICE MODAL WHEN COMPLETED */}
      {showReceiptModal && completedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px', padding: '24px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800 }}>
                <CheckCircle size={24} />
                <span style={{ fontSize: '18px' }}>Bill Generated Successfully!</span>
              </div>
              <button onClick={() => setShowReceiptModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <InvoiceDocument
              id="modal-invoice-document"
              billNo={completedBill.bill_no}
              billDate={completedBill.created_at || `${billDate} • ${liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`}
              customerName={completedBill.customer_name}
              customerPhone={completedBill.customer_phone}
              customerAddress={completedBill.customer_address}
              items={completedBill.items || []}
              paymentMode={completedBill.payment_mode || 'Cash'}
              subtotal={completedBill.subtotal || completedBill.grand_total}
              discountTotal={completedBill.discount_total || 0}
              grandTotal={completedBill.grand_total || 0}
              status={completedBill.status || 'Paid'}
            />

            <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn-primary" onClick={() => window.print()} style={{ flex: 1, padding: '12px' }}>
                <Printer size={18} /> Print Invoice
              </button>
              
              <button className="btn-demo" onClick={downloadPDF} style={{ flex: 1, padding: '12px', color: '#0f172a', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700 }}>
                Download PDF
              </button>

              <button 
                onClick={() => shareWhatsApp(completedBill)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)' }}
              >
                <MessageSquare size={18} /> Share WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
