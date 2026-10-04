import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewBill from './components/NewBill';
import BillHistory from './components/BillHistory';
import Customers from './components/Customers';
import ProductList from './components/ProductList';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';
import { Menu, Sparkles, Calendar } from 'lucide-react';
import { 
  getProducts, 
  getProductsAsync,
  saveProduct, 
  deleteProduct,
  getBills, 
  getBillsAsync,
  getCustomers, 
  getCustomersAsync,
  saveCustomer, 
  getDashboardStats,
  getDashboardStatsAsync,
  getFinancialYears,
  getShopSettings,
  getShopSettingsAsync
} from './utils/storage';

export default function App() {
  // Financial Year State
  const [financialYear, setFinancialYear] = useState(() => {
    return localStorage.getItem('kalieswari_financial_year') || '2026';
  });

  // Persist authentication state in localStorage so refresh stays logged in!
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kalieswari_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kalieswari_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Update year if stored in user
  useEffect(() => {
    if (currentUser && currentUser.financialYear) {
      setFinancialYear(currentUser.financialYear);
    }
  }, [currentUser]);

  // Persist active tab in localStorage so refresh stays on current page!
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('kalieswari_active_tab') || 'dashboard';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('kalieswari_active_tab', tab);
  };

  const handleYearChange = (newYear) => {
    setFinancialYear(newYear);
    localStorage.setItem('kalieswari_financial_year', newYear);
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // App state
  const [shopSettings, setShopSettings] = useState(() => getShopSettings());
  const [products, setProducts] = useState([]);
  const [rawBills, setRawBills] = useState([]);
  const [rawCustomers, setRawCustomers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [selectedCustomerForBill, setSelectedCustomerForBill] = useState(null);

  const refreshData = async () => {
    // 1. Instant local load
    setShopSettings(getShopSettings());
    setProducts(getProducts());
    setRawBills(getBills());
    setRawCustomers(getCustomers());
    setDashboardStats(getDashboardStats());

    // 2. Fetch fresh data from TiDB Cloud database
    const liveSettings = await getShopSettingsAsync();
    setShopSettings(liveSettings);

    const liveProds = await getProductsAsync();
    setProducts(liveProds);

    const liveBills = await getBillsAsync();
    setRawBills(liveBills);

    const liveCusts = await getCustomersAsync();
    setRawCustomers(liveCusts);

    const liveStats = await getDashboardStatsAsync();
    setDashboardStats(liveStats);
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Filter bills & customers by selected Financial Year (Products remain SHARED across all years!)
  const bills = rawBills.filter(b => {
    const dateString = b.created_at || b.bill_date || '';
    return dateString.includes(financialYear);
  });

  // Customers are SHARED across all financial years (regular customers stay saved!)
  const customers = rawCustomers;

  // Calculate year-specific dashboard stats
  const yearTodaysSales = bills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
  const yearBillsCount = bills.length;
  const yearPendingAmount = bills.reduce((sum, b) => sum + (Number(b.pending_amount) || 0), 0);

  const currentDashboardStats = {
    todaysSales: yearTodaysSales,
    billsCount: yearBillsCount,
    totalAmount: yearTodaysSales,
    pendingAmount: yearPendingAmount,
    recentActivity: bills.slice(0, 10)
  };

  const handleAddProduct = (newProd) => {
    const updated = saveProduct(newProd);
    setProducts(updated);
  };

  const handleDeleteProduct = (codeOrId) => {
    const updated = deleteProduct(codeOrId);
    setProducts(updated);
  };

  const handleAddCustomer = (newCust) => {
    const updated = saveCustomer(newCust);
    setRawCustomers(updated);
  };

  const handleSelectCustomerForBill = (cust) => {
    setSelectedCustomerForBill(cust);
    handleTabChange('new-bill');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('kalieswari_auth');
    localStorage.removeItem('kalieswari_user');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'new-bill': return 'New Bill';
      case 'bill-history': return 'Bill History';
      case 'customers': return 'Customers';
      case 'product-list': return 'Product List';
      case 'reports': return 'Reports';
      case 'settings': return 'Settings';
      default: return 'Dashboard Overview';
    }
  };

  if (!isAuthenticated) {
    return (
      <Login 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.financialYear) setFinancialYear(user.financialYear);
          setIsAuthenticated(true);
          localStorage.setItem('kalieswari_auth', 'true');
          localStorage.setItem('kalieswari_user', JSON.stringify(user));
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileOpen}
        setIsOpen={setIsMobileOpen}
        shopSettings={shopSettings}
      />

      {/* Main Right Content */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button className="mobile-toggle" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>

          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* FINANCIAL YEAR FIXED BADGE */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 800,
              color: '#991b1b'
            }}>
              <Calendar size={15} color="#dc2626" />
              <span>FY: <strong>{financialYear}</strong></span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={currentDashboardStats} 
              onNavigate={(tab) => handleTabChange(tab)} 
            />
          )}

          {activeTab === 'new-bill' && (
            <NewBill 
              products={products} 
              bills={bills}
              initialCustomer={selectedCustomerForBill}
              onBillCreated={() => {
                refreshData();
                setSelectedCustomerForBill(null);
              }} 
            />
          )}

          {activeTab === 'bill-history' && (
            <BillHistory bills={bills} />
          )}

          {activeTab === 'customers' && (
            <Customers 
              customers={customers} 
              bills={bills}
              onAddCustomer={handleAddCustomer} 
              onSelectCustomerForBill={handleSelectCustomerForBill}
            />
          )}

          {activeTab === 'product-list' && (
            <ProductList products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} isStockMode={false} />
          )}

          {activeTab === 'reports' && (
            <Reports stats={currentDashboardStats} bills={bills} />
          )}

          {activeTab === 'settings' && (
            <Settings 
              financialYear={financialYear}
              onUpdateShopSettings={(updated) => setShopSettings(updated)} 
              onResetSuccess={refreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
