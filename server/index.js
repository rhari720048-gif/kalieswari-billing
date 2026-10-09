import express from 'express';
import cors from 'cors';
import { pool, initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database connection on server start
initDatabase();

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as result');
    res.json({ status: 'online', database: 'connected', time: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ---------------- PRODUCTS ----------------
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY s_no ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { s_no, code, name, name_tamil, category, unit, mrp, discount_price, stock } = req.body;
    const calcDiscPrice = discount_price !== undefined ? Number(discount_price) : (mrp ? Number(mrp) * 0.1 : 0);
    const [result] = await pool.query(
      `INSERT INTO products (s_no, code, name, name_tamil, category, unit, mrp, discount_price, price, stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         s_no=VALUES(s_no), name=VALUES(name), name_tamil=VALUES(name_tamil),
         category=VALUES(category), unit=VALUES(unit), 
         mrp=VALUES(mrp), discount_price=VALUES(discount_price), price=VALUES(discount_price), stock=VALUES(stock)`,
      [s_no || 0, code, name, name_tamil || '', category || '', unit || '1 BOX', mrp || 0, calcDiscPrice, calcDiscPrice, stock || 100]
    );
    const [inserted] = await pool.query('SELECT * FROM products WHERE id = ? OR code = ?', [result.insertId || result.id, code]);
    res.json(inserted[0] || req.body);
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ? OR code = ?', [req.params.id, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CUSTOMERS ----------------
// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, city, total_billed, total_bills } = req.body;
    const [result] = await pool.query(
      `INSERT INTO customers (name, phone, city, total_billed, total_bills) VALUES (?, ?, ?, ?, ?)`,
      [name, phone || '', city || '', total_billed || 0, total_bills || 0]
    );
    res.json({ id: result.insertId, name, phone, city, total_billed, total_bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM customers WHERE id = ? OR phone = ? OR name = ?', [id, id, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BILLS ----------------
// Get all bills
app.get('/api/bills', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bills ORDER BY id DESC');
    const formatted = rows.map(b => ({
      ...b,
      items: typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || [])
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const billData = req.body || {};
    const [allBills] = await pool.query('SELECT bill_no FROM bills');
    const existingBillNos = new Set(allBills.map(b => b.bill_no));
    const numbers = allBills.map(b => {
      const match = String(b.bill_no || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(n => !isNaN(n) && n > 0);
    const maxNum = numbers.length > 0 ? Math.max(0, ...numbers) : 0;

    let newBillNo = billData.bill_no;
    if (!newBillNo || existingBillNos.has(newBillNo)) {
      newBillNo = `INV-${String(maxNum + 1).padStart(2, '0')}`;
    }
    const grandTotal = Number(billData.grand_total || 0);
    const paidAmount = Number(billData.paid_amount || 0);
    const pendingAmount = Math.max(0, grandTotal - paidAmount);
    const status = pendingAmount <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending');
    const created_at = new Date().toLocaleString();

    const [result] = await pool.query(
      `INSERT INTO bills (bill_no, customer_name, customer_phone, customer_address, items_json, subtotal, discount_total, grand_total, paid_amount, pending_amount, payment_mode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newBillNo,
        billData.customer_name || 'Walk-in Customer',
        billData.customer_phone || '',
        billData.customer_address || '',
        JSON.stringify(billData.items || []),
        billData.subtotal || 0,
        billData.discount_total || 0,
        grandTotal,
        paidAmount,
        pendingAmount,
        billData.payment_mode || 'Cash',
        status
      ]
    );

    const createdBill = {
      id: result.insertId,
      bill_no: newBillNo,
      customer_name: billData.customer_name || 'Walk-in Customer',
      customer_phone: billData.customer_phone || '',
      customer_address: billData.customer_address || '',
      items: billData.items || [],
      subtotal: billData.subtotal || 0,
      discount_total: billData.discount_total || 0,
      grand_total: grandTotal,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      payment_mode: billData.payment_mode || 'Cash',
      status,
      created_at
    };

    // Auto-update or save customer statistics
    if (billData.customer_name || billData.customer_phone) {
      const [existingCust] = await pool.query(
        `SELECT * FROM customers WHERE (phone = ? AND phone != '') OR LOWER(name) = LOWER(?) LIMIT 1`,
        [billData.customer_phone || '___', billData.customer_name || '___']
      );

      if (existingCust.length > 0) {
        const cust = existingCust[0];
        await pool.query(
          `UPDATE customers SET total_billed = total_billed + ?, total_bills = total_bills + 1, city = COALESCE(NULLIF(?, ''), city) WHERE id = ?`,
          [grandTotal, billData.customer_address || '', cust.id]
        );
      } else if (billData.customer_name) {
        await pool.query(
          `INSERT INTO customers (name, phone, city, total_billed, total_bills) VALUES (?, ?, ?, ?, 1)`,
          [billData.customer_name, billData.customer_phone || '', billData.customer_address || '', grandTotal]
        );
      }
    }

    res.json(createdBill);
  } catch (err) {
    console.error('Error saving bill:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete bill
app.delete('/api/bills/:id', async (req, res) => {
  try {
    const param = req.params.id;
    if (!isNaN(Number(param))) {
      await pool.query('DELETE FROM bills WHERE id = ? OR bill_no = ?', [param, param]);
    } else {
      await pool.query('DELETE FROM bills WHERE bill_no = ?', [param]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset bills for a specific financial year (Keep products & customers safe!)
app.delete('/api/bills/reset/:year', async (req, res) => {
  try {
    const year = req.params.year;
    await pool.query('DELETE FROM bills WHERE created_at LIKE ? OR created_at LIKE ?', [`%${year}%`, `%/${year}%`]);
    res.json({ success: true, year });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const [bills] = await pool.query('SELECT * FROM bills ORDER BY id DESC');
    const todaysSales = bills.reduce((sum, b) => sum + Number(b.grand_total || 0), 0);
    const billsCount = bills.length;
    const totalAmount = todaysSales;
    const pendingAmount = bills.reduce((sum, b) => sum + Number(b.pending_amount || 0), 0);

    const formattedBills = bills.slice(0, 10).map(b => ({
      ...b,
      items: typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || [])
    }));

    res.json({
      todaysSales,
      billsCount,
      totalAmount,
      pendingAmount,
      recentActivity: formattedBills
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SETTINGS ----------------
// Get shop settings
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (rows.length > 0) {
      res.json({
        shopName: rows[0].shop_name,
        phone: rows[0].phone,
        gstin: rows[0].gstin,
        address: rows[0].address
      });
    } else {
      res.json({
        shopName: 'Kalieswari Crackers & Fireworks',
        phone: '+91 98765 43210',
        gstin: '33ABCDE1234F1Z5',
        address: 'Main Road, Sivakasi - 626123, Tamil Nadu'
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update shop settings
app.post('/api/settings', async (req, res) => {
  try {
    const { shopName, phone, gstin, address } = req.body;
    await pool.query(
      `INSERT INTO settings (id, shop_name, phone, gstin, address)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         shop_name = VALUES(shop_name),
         phone = VALUES(phone),
         gstin = VALUES(gstin),
         address = VALUES(address)`,
      [shopName || 'Kalieswari Crackers & Fireworks', phone || '', gstin || '', address || '']
    );
    res.json({ shopName, phone, gstin, address });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get admin credentials
app.get('/api/settings/credentials', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT admin_email, admin_password FROM settings WHERE id = 1');
    if (rows.length > 0 && rows[0].admin_email) {
      res.json({
        email: rows[0].admin_email,
        password: rows[0].admin_password
      });
    } else {
      res.json({
        email: 'admin@gmail.com',
        password: 'admin@123'
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update admin credentials
app.post('/api/settings/credentials', async (req, res) => {
  try {
    const { email, password } = req.body;
    await pool.query(
      `UPDATE settings SET admin_email = ?, admin_password = ? WHERE id = 1`,
      [email || 'admin@gmail.com', password || 'admin@123']
    );
    res.json({ email, password });
  } catch (err) {
    console.error('Error saving admin credentials:', err);
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT} with TiDB Cloud connection`);
  });
}

export default app;
