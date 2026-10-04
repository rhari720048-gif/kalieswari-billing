import React, { useState, useEffect } from 'react';
import { Save, Store, Phone, MapPin, Receipt, CheckCircle, Calendar, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { getFinancialYears, saveFinancialYear, deleteFinancialYear, getShopSettings, saveShopSettings } from '../utils/storage';

export default function Settings({ onUpdateShopSettings }) {
  const [initialSettings] = useState(() => getShopSettings());
  const [shopName, setShopName] = useState(initialSettings.shopName);
  const [phone, setPhone] = useState(initialSettings.phone);
  const [address, setAddress] = useState(initialSettings.address);
  const [gstin, setGSTIN] = useState(initialSettings.gstin);
  const [saved, setSaved] = useState(false);

  // Financial Years state
  const [yearsList, setYearsList] = useState(() => getFinancialYears());
  const [newYearInput, setNewYearInput] = useState('');
  const [yearSuccessMsg, setYearSuccessMsg] = useState('');
  const [yearToDelete, setYearToDelete] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = saveShopSettings({
      shopName,
      phone,
      gstin,
      address
    });
    if (onUpdateShopSettings) {
      onUpdateShopSettings(updated);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddNewYear = (e) => {
    e.preventDefault();
    if (!newYearInput || !newYearInput.trim()) return;
    const yearVal = newYearInput.trim();
    const updated = saveFinancialYear(yearVal);
    setYearsList(updated);
    setNewYearInput('');
    setYearSuccessMsg(`Financial Year ${yearVal} added successfully!`);
    setTimeout(() => setYearSuccessMsg(''), 4000);
  };

  const handleConfirmDeleteYear = () => {
    if (!yearToDelete) return;
    const updated = deleteFinancialYear(yearToDelete);
    setYearsList(updated);
    setYearToDelete(null);
    setYearSuccessMsg(`Financial Year ${yearToDelete} deleted successfully!`);
    setTimeout(() => setYearSuccessMsg(''), 4000);
  };

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Shop Settings & Invoice Customization</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>Configure business details and manage financial billing years</p>
      </div>

      {saved && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
          <CheckCircle size={18} /> Settings saved successfully!
        </div>
      )}

      {/* 1. SHOP DETAILS FORM */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Shop / Company Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Store size={18} style={{ position: 'absolute', left: '12px', color: '#991b1b' }} />
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', color: '#991b1b' }} />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>GSTIN / Reg No.</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Receipt size={18} style={{ position: 'absolute', left: '12px', color: '#991b1b' }} />
                <input
                  type="text"
                  placeholder="Optional (Leave empty for no GST)"
                  value={gstin}
                  onChange={e => setGSTIN(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>Shop Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '12px', color: '#991b1b' }} />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)' }}
          >
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>

      {/* 2. FINANCIAL YEARS MANAGEMENT CARD */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Calendar size={20} color="#dc2626" />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Financial Years Management (நிதி ஆண்டுகள்)
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
          Create new billing years (e.g. 2027). All cracker products & saved regular customers carry over automatically.
        </p>

        {yearSuccessMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
            {yearSuccessMsg}
          </div>
        )}

        {/* Existing Years Badges List with Delete option */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          {yearsList.map(yr => (
            <div key={yr} style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '6px 12px 6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={14} color="#dc2626" />
              <span>{yr}</span>
              {yearsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => setYearToDelete(yr)}
                  title={`Delete Financial Year ${yr}`}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Year Form */}
        <form onSubmit={handleAddNewYear} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#dc2626' }} />
            <input
              type="text"
              placeholder="Enter Year e.g. 2027"
              value={newYearInput}
              onChange={e => setNewYearInput(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Add New Year
          </button>
        </form>
      </div>

      {/* SCREEN CENTER CONFIRMATION TOAST MODAL FOR DELETING FINANCIAL YEAR */}
      {yearToDelete && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', padding: '26px 28px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '90%', maxWidth: '420px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', border: '1px solid #fecdd3' }}>
              <AlertTriangle size={26} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Are you sure?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: '#0f172a' }}>Financial Year {yearToDelete}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setYearToDelete(null)}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteYear}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)' }}
              >
                Yes, Delete Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
