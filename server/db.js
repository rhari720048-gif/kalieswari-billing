import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER || '2NZ98TsqYW9Ftow.root',
  password: process.env.DB_PASSWORD || 'IbLVkvv6WzgJB8k8',
  database: process.env.DB_NAME || 'kalishwaricrakers',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(dbConfig);

export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to TiDB Cloud database!');

    // 1. Create Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        s_no INT,
        code VARCHAR(50) UNIQUE,
        category VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        name_tamil VARCHAR(255),
        unit VARCHAR(50) DEFAULT '1 BOX',
        mrp DECIMAL(10,2) DEFAULT 0.00,
        discount_price DECIMAL(10,2) DEFAULT 0.00,
        discount_percent DECIMAL(5,2) DEFAULT 90.00,
        price DECIMAL(10,2) DEFAULT 0.00,
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was previously created
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN s_no INT AFTER id;`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN name_tamil VARCHAR(255) AFTER name;`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2) DEFAULT 0.00 AFTER mrp;`);
    } catch (e) {}

    // 2. Create Customers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        city TEXT,
        total_billed DECIMAL(12,2) DEFAULT 0.00,
        total_bills INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Bills Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_no VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        items_json JSON,
        subtotal DECIMAL(12,2) DEFAULT 0.00,
        discount_total DECIMAL(12,2) DEFAULT 0.00,
        grand_total DECIMAL(12,2) DEFAULT 0.00,
        paid_amount DECIMAL(12,2) DEFAULT 0.00,
        pending_amount DECIMAL(12,2) DEFAULT 0.00,
        payment_mode VARCHAR(50) DEFAULT 'Cash',
        status VARCHAR(50) DEFAULT 'Paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        shop_name VARCHAR(255) DEFAULT 'Kalieswari Crackers & Fireworks',
        phone VARCHAR(50) DEFAULT '+91 98765 43210',
        gstin VARCHAR(50) DEFAULT '33ABCDE1234F1Z5',
        address TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure default row exists
    const [settingsRows] = await connection.query('SELECT COUNT(*) as cnt FROM settings');
    if (settingsRows[0]?.cnt === 0) {
      await connection.query(
        `INSERT INTO settings (id, shop_name, phone, gstin, address) VALUES (1, ?, ?, ?, ?)`,
        ['Kalieswari Crackers & Fireworks', '+91 98765 43210', '33ABCDE1234F1Z5', 'Main Road, Sivakasi - 626123, Tamil Nadu']
      );
    }

    console.log('✅ All TiDB Database tables initialized and verified.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error connecting/initializing TiDB database:', error);
    return false;
  }
}
