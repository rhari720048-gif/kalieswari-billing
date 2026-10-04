import React, { useState } from 'react';
import { Plus, Search, X, Package, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function ProductList({ products = [], onAddProduct, onDeleteProduct, isStockMode = false }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    s_no: '',
    code: '',
    category: 'ONE SOUND CRACKERS',
    name: '',
    name_tamil: '',
    unit: '1PKT',
    mrp: '',
    discount_price: ''
  });

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

  const filtered = products
    .filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
                            (p.name_tamil && p.name_tamil.includes(search)) ||
                            (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
                            (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => Number(a.s_no || 0) - Number(b.s_no || 0));

  const handleOpenAddModal = () => {
    setEditingItem(null);
    const nextNo = products.length + 1;
    setFormData({
      s_no: nextNo,
      code: `K-${String(nextNo).padStart(2, '0')}`,
      category: 'ONE SOUND CRACKERS',
      name: '',
      name_tamil: '',
      unit: '1PKT',
      mrp: '',
      discount_price: '',
      stock: 100
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      s_no: item.s_no || '',
      code: item.code || '',
      category: item.category || 'ONE SOUND CRACKERS',
      name: item.name || '',
      name_tamil: item.name_tamil || '',
      unit: item.unit || '1PKT',
      mrp: item.mrp !== undefined ? item.mrp : '',
      discount_price: item.discount_price !== undefined ? item.discount_price : '',
      stock: item.stock !== undefined && item.stock !== null ? item.stock : 100
    });
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mrpNum = Number(formData.mrp || 0);
    const discNum = formData.discount_price !== '' ? Number(formData.discount_price) : (mrpNum * 0.1);
    const nextSNo = formData.s_no ? Number(formData.s_no) : (products.length + 1);
    const nextCode = formData.code ? formData.code : `K-${String(nextSNo).padStart(2, '0')}`;
    const stockNum = formData.stock !== undefined && formData.stock !== '' ? Number(formData.stock) : 100;

    onAddProduct({
      ...formData,
      s_no: nextSNo,
      code: nextCode,
      mrp: mrpNum,
      discount_price: discNum,
      price: discNum,
      stock: stockNum
    });

    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP TITLE & HEADER CARD */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isStockMode ? 'Cracker Stock Management' : 'Sri Kalieswari Product Catalogue'}
          </h1>
          <span style={{ fontSize: '12px', fontWeight: 700, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecdd3', padding: '2px 10px', borderRadius: '12px' }}>
            {products.length} Products
          </span>
        </div>

        {!isStockMode && (
          <button 
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAddModal}
          >
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="categories-bar" style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        {categories.map(cat => {
          const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? '#dc2626' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH & TABLE CARD */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '18px', maxWidth: '520px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#dc2626' }} />
          <input
            type="text"
            placeholder="Search product by Name, Tamil Name (e.g. லக்ஷ்மி), Code (e.g. K-01)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              background: '#ffffff'
            }}
          />
        </div>

        {/* Product Table with requested columns + ACTIONS column */}
        <div style={{ overflowX: 'auto' }}>
          <table className="cart-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '50px', textAlign: 'center' }}>S.NO</th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '90px', whiteSpace: 'nowrap' }}>CODE</th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '140px' }}>CATEGORY</th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>NAME OF CRACKERS</th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>பட்டாசின் பெயர் (TAMIL)</th>
                <th style={{ padding: '12px 10px', fontSize: '12px', fontWeight: 700, color: '#475569', width: '75px', textAlign: 'center', whiteSpace: 'nowrap' }}>PER</th>
                <th style={{ padding: '12px 6px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>RATE RS.(MRP)</th>
                <th style={{ padding: '12px 6px', fontSize: '12px', fontWeight: 700, color: '#dc2626', textAlign: 'center', width: '115px', whiteSpace: 'nowrap' }}>90% DISCOUNT PRICE</th>
                <th style={{ padding: '12px 6px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '50px' }}>QTY</th>
                <th style={{ padding: '12px 8px', fontSize: '12px', fontWeight: 700, color: '#991b1b', textAlign: 'right', width: '90px' }}>AMOUNT</th>
                <th style={{ padding: '12px 6px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'center', width: '120px', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const sNo = item.s_no || (index + 1);
                  const mrpNum = Number(item.mrp || 0);
                  const discPrice = Number(item.discount_price !== undefined && item.discount_price !== null ? item.discount_price : (item.price || (mrpNum * 0.1)));

                  return (
                    <tr key={item.code || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                        {sNo}
                      </td>
                      <td style={{ padding: '10px 6px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', background: '#fef2f2', border: '1px solid #fecdd3', padding: '4px 8px', borderRadius: '6px', display: 'inline-block', whiteSpace: 'nowrap' }}>
                          {item.code}
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: '#991b1b', fontSize: '13px' }}>
                        {item.name_tamil || '-'}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {item.unit || '1 BOX'}
                      </td>
                      <td style={{ padding: '10px 6px', textDecoration: mrpNum > 0 ? 'line-through' : 'none', color: '#94a3b8', fontSize: '13px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {mrpNum > 0 ? `₹${mrpNum.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 800, color: '#dc2626', fontSize: '13px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        ₹{discPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        {item.stock !== undefined && item.stock !== null ? item.stock : 100}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 800, color: '#991b1b', fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        ₹{discPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            title="Edit Product"
                            onClick={() => handleOpenEditModal(item)}
                            style={{
                              background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            title="Delete Product"
                            onClick={() => handleDelete(item)}
                            style={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.25)'
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No products found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, padding: '16px' }}>
          <div className="modal-content" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} color="#dc2626" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingItem ? `Edit Product (${formData.code})` : 'Add New Cracker Product'}
                </h3>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingItem(null); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '80px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>S.No *</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    value={formData.s_no}
                    onChange={e => setFormData({ ...formData, s_no: e.target.value })}
                  />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K-186"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Category *</label>
                  <select
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                    value={formData.category}
                    onChange={e => {
                      const newCat = e.target.value;
                      const numVal = Number(formData.mrp || 0);
                      const calculatedDiscPrice = numVal > 0 ? (numVal * 0.10).toFixed(2) : formData.discount_price;
                      setFormData({
                        ...formData,
                        category: newCat,
                        discount_price: calculatedDiscPrice
                      });
                    }}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Name of Crackers (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3.5 Lakshmi (3ply)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '4px', display: 'block' }}>பட்டாசின் பெயர் (Tamil)</label>
                <input
                  type="text"
                  placeholder="e.g. 3.5 லக்ஷ்மி (3 பிளே)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  value={formData.name_tamil}
                  onChange={e => setFormData({ ...formData, name_tamil: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Per (Unit)</label>
                  <select
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="1PKT">1PKT</option>
                    <option value="1 PKT">1 PKT</option>
                    <option value="1 BOX">1 BOX</option>
                    <option value="1BOX">1BOX</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Quantity (Stock / Qty) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="100"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'block' }}>Rate RS.(MRP)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2000.00"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    value={formData.mrp}
                    onChange={e => {
                      const val = e.target.value;
                      const numVal = Number(val || 0);
                      const calculatedDiscPrice = numVal > 0 ? (numVal * 0.10).toFixed(2) : '';
                      setFormData({ 
                        ...formData, 
                        mrp: val, 
                        discount_price: calculatedDiscPrice 
                      });
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '4px', display: 'block' }}>90% Discount Price (Selling Price)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="200.00"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    value={formData.discount_price}
                    onChange={e => setFormData({ ...formData, discount_price: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingItem(null); }}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  {editingItem ? 'Save Changes' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREEN CENTER CONFIRMATION TOAST MODAL FOR DELETING PRODUCT */}
      {itemToDelete && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', padding: '26px 28px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '90%', maxWidth: '420px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', border: '1px solid #fecdd3' }}>
              <AlertTriangle size={26} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Are you sure?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete product <strong style={{ color: '#0f172a' }}>"{itemToDelete.name}"</strong> (<strong style={{ color: '#991b1b' }}>{itemToDelete.code}</strong>)? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProduct) onDeleteProduct(itemToDelete.code || itemToDelete.id);
                  setItemToDelete(null);
                }}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)' }}
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
