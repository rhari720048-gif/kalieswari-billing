// Data Layer with TiDB Cloud MySQL Database Integration & Local Cache

const API_BASE = '/api';

const KEYS = {
  PRODUCTS: 'kalieswari_products',
  BILLS: 'kalieswari_bills',
  CUSTOMERS: 'kalieswari_customers',
  USER: 'kalieswari_user'
};

const DEFAULT_PRODUCTS = [];
const DEFAULT_BILLS = [];
const DEFAULT_CUSTOMERS = [];

// Helper to handle API requests securely
async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`TiDB API Call to ${endpoint} failed, falling back to local cache:`, err);
    return null;
  }
}

// ---------------- PRODUCTS ----------------
export const getProducts = () => {
  const saved = localStorage.getItem(KEYS.PRODUCTS);
  if (!saved) return DEFAULT_PRODUCTS;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.some(p => !p.code || !p.code.startsWith('K-'))) {
      localStorage.removeItem(KEYS.PRODUCTS);
      return [];
    }
    return parsed;
  } catch (e) {
    localStorage.removeItem(KEYS.PRODUCTS);
    return [];
  }
};

export const getProductsAsync = async () => {
  const data = await fetchAPI('/products');
  if (data && Array.isArray(data)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data));
    return data;
  }
  return getProducts();
};

export const saveProduct = (product) => {
  const products = getProducts();
  const existingIdx = products.findIndex(p => p.code === product.code || p.id === product.id);
  let updated;
  if (existingIdx > -1) {
    updated = [...products];
    updated[existingIdx] = product;
  } else {
    updated = [product, ...products];
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));

  // Sync to TiDB Cloud Database
  fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  }).then(saved => {
    if (saved) {
      getProductsAsync();
    }
  });

  return updated;
};

export const deleteProduct = (idOrCode) => {
  const products = getProducts().filter(p => p.id !== idOrCode && p.code !== idOrCode);
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

  fetchAPI(`/products/${idOrCode}`, { method: 'DELETE' }).then(() => {
    getProductsAsync();
  });

  return products;
};

// ---------------- BILLS ----------------
export const getBills = () => {
  const saved = localStorage.getItem(KEYS.BILLS);
  if (!saved) return DEFAULT_BILLS;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.some(b => b.bill_no === 'INV-202601')) {
      localStorage.setItem(KEYS.BILLS, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch (e) {
    return [];
  }
};

export const getBillsAsync = async () => {
  const data = await fetchAPI('/bills');
  if (data && Array.isArray(data)) {
    localStorage.setItem(KEYS.BILLS, JSON.stringify(data));
    return data;
  }
  return getBills();
};

export const saveBill = (billData) => {
  const bills = getBills();
  const newBillNo = billData.bill_no || ('INV-' + Math.floor(100000 + Math.random() * 900000));
  const pending = Math.max(0, billData.grand_total - (billData.paid_amount || 0));
  
  const createdBill = {
    ...billData,
    bill_no: newBillNo,
    pending_amount: pending,
    status: pending <= 0 ? 'Paid' : (billData.paid_amount > 0 ? 'Partial' : 'Pending'),
    created_at: billData.created_at || new Date().toLocaleString()
  };

  const updated = [createdBill, ...bills];
  localStorage.setItem(KEYS.BILLS, JSON.stringify(updated));

  // Also update customer local cache
  if (billData.customer_phone || billData.customer_name) {
    const customers = getCustomers();
    const existingIndex = customers.findIndex(c => 
      (billData.customer_phone && c.phone === billData.customer_phone) || 
      (c.name && billData.customer_name && c.name.toLowerCase() === billData.customer_name.toLowerCase())
    );
    if (existingIndex > -1) {
      customers[existingIndex].total_billed = (customers[existingIndex].total_billed || 0) + billData.grand_total;
      customers[existingIndex].total_bills = (customers[existingIndex].total_bills || 0) + 1;
      if (billData.customer_address) customers[existingIndex].city = billData.customer_address;
    } else if (billData.customer_name) {
      customers.unshift({
        name: billData.customer_name,
        phone: billData.customer_phone || '',
        city: billData.customer_address || '',
        total_billed: billData.grand_total,
        total_bills: 1
      });
    }
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // Sync to TiDB Cloud Database
  fetchAPI('/bills', {
    method: 'POST',
    body: JSON.stringify(billData)
  }).then(saved => {
    if (saved) {
      getBillsAsync();
      getCustomersAsync();
    }
  });

  return createdBill;
};

export const deleteBill = (idOrBillNo) => {
  const bills = getBills().filter(b => b.id !== idOrBillNo && b.bill_no !== idOrBillNo);
  localStorage.setItem(KEYS.BILLS, JSON.stringify(bills));

  fetchAPI(`/bills/${idOrBillNo}`, { method: 'DELETE' }).then(() => {
    getBillsAsync();
  });

  return bills;
};

// ---------------- CUSTOMERS ----------------
export const getCustomers = () => {
  const saved = localStorage.getItem(KEYS.CUSTOMERS);
  if (!saved) return DEFAULT_CUSTOMERS;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.some(c => c.name === 'Hari Raj' || c.name === 'Murugan (Sivakasi)')) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify([]));
      return [];
    }
    return parsed;
  } catch (e) {
    return [];
  }
};

export const getCustomersAsync = async () => {
  const data = await fetchAPI('/customers');
  if (data && Array.isArray(data)) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data));
    return data;
  }
  return getCustomers();
};

export const saveCustomer = (cust) => {
  const customers = getCustomers();
  const newCust = {
    name: cust.name,
    phone: cust.phone || '',
    city: cust.city || '',
    total_billed: cust.total_billed || 0,
    total_bills: cust.total_bills || 0
  };
  const updated = [newCust, ...customers];
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(updated));

  // Sync to TiDB Cloud Database
  fetchAPI('/customers', {
    method: 'POST',
    body: JSON.stringify(cust)
  }).then(saved => {
    if (saved) {
      getCustomersAsync();
    }
  });

  return updated;
};

// ---------------- DASHBOARD STATS ----------------
export const getDashboardStats = () => {
  const bills = getBills();
  const todaysSales = bills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
  const billsCount = bills.length;
  const totalAmount = todaysSales;
  const pendingAmount = bills.reduce((sum, b) => sum + (Number(b.pending_amount) || 0), 0);

  return {
    todaysSales,
    billsCount,
    totalAmount,
    pendingAmount,
    recentActivity: bills.slice(0, 10)
  };
};

export const getDashboardStatsAsync = async () => {
  const data = await fetchAPI('/dashboard-stats');
  if (data) {
    return data;
  }
  return getDashboardStats();
};

// ---------------- FINANCIAL YEARS MANAGEMENT ----------------
export const getFinancialYears = () => {
  const saved = localStorage.getItem('kalieswari_financial_years_list');
  if (!saved) return ['2026'];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['2026'];
  } catch (e) {
    return ['2026'];
  }
};

export const saveFinancialYear = (newYear) => {
  const years = getFinancialYears();
  const yearStr = String(newYear).trim();
  if (!yearStr) return years;
  if (!years.includes(yearStr)) {
    const updated = [...years, yearStr].sort((a, b) => Number(a) - Number(b));
    localStorage.setItem('kalieswari_financial_years_list', JSON.stringify(updated));
    return updated;
  }
  return years;
};

export const deleteFinancialYear = (yearToDelete) => {
  const years = getFinancialYears();
  const yearStr = String(yearToDelete).trim();
  const updated = years.filter(y => y !== yearStr);
  const finalYears = updated.length > 0 ? updated : ['2026'];
  localStorage.setItem('kalieswari_financial_years_list', JSON.stringify(finalYears));
  return finalYears;
};

// ---------------- SHOP SETTINGS MANAGEMENT ----------------
const DEFAULT_SHOP_SETTINGS = {
  shopName: 'Kalieswari Crackers & Fireworks',
  phone: '+91 98765 43210',
  gstin: '',
  address: 'Main Road, Sivakasi - 626123, Tamil Nadu'
};

export const getShopSettings = () => {
  const saved = localStorage.getItem('kalieswari_shop_settings');
  if (!saved) return DEFAULT_SHOP_SETTINGS;
  try {
    const parsed = JSON.parse(saved);
    return {
      shopName: parsed.shopName || DEFAULT_SHOP_SETTINGS.shopName,
      phone: parsed.phone || DEFAULT_SHOP_SETTINGS.phone,
      gstin: parsed.gstin !== undefined ? parsed.gstin : '',
      address: parsed.address || DEFAULT_SHOP_SETTINGS.address
    };
  } catch (e) {
    return DEFAULT_SHOP_SETTINGS;
  }
};

export const getShopSettingsAsync = async () => {
  const data = await fetchAPI('/settings');
  if (data && data.shopName) {
    const settings = {
      shopName: data.shopName,
      phone: data.phone || '',
      gstin: data.gstin || '',
      address: data.address || ''
    };
    localStorage.setItem('kalieswari_shop_settings', JSON.stringify(settings));
    return settings;
  }
  return getShopSettings();
};

export const saveShopSettings = (settings) => {
  const formatted = {
    shopName: settings.shopName || DEFAULT_SHOP_SETTINGS.shopName,
    phone: settings.phone || '',
    gstin: settings.gstin || '',
    address: settings.address || ''
  };
  localStorage.setItem('kalieswari_shop_settings', JSON.stringify(formatted));

  fetchAPI('/settings', {
    method: 'POST',
    body: JSON.stringify(formatted)
  }).then(saved => {
    if (saved) {
      getShopSettingsAsync();
    }
  });

  return formatted;
};

export const resetYearData = (year) => {
  const yearStr = String(year).trim();
  const bills = getBills();
  const remainingBills = bills.filter(b => {
    const dateString = b.created_at || b.bill_date || '';
    return !dateString.includes(yearStr);
  });
  localStorage.setItem(KEYS.BILLS, JSON.stringify(remainingBills));

  fetchAPI(`/bills/reset/${yearStr}`, { method: 'DELETE' }).then(() => {
    getBillsAsync();
  });

  return remainingBills;
};

