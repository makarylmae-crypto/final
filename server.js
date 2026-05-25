import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// FreshKart PH full-stack server for Render + Aiven MySQL
// Build: npm run build
// Start: npm start

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ssl:
    String(process.env.MYSQL_SSL || process.env.DB_SSL || 'true').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
};

const requiredDbFields = ['host', 'user', 'database'];
const missingDbFields = requiredDbFields.filter((field) => !dbConfig[field]);
let pool;

const newId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const seedUsers = [
  {
    id: 'seed-admin-1',
    name: 'Admin FreshKart',
    email: 'admin@freshkart.ph',
    password: 'admin123',
    role: 'admin',
    address: 'Hinunangan, Southern Leyte',
    phone: '+63 999 000 1111',
    farmName: '',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-farmer-1',
    name: 'Juan Dela Cruz',
    email: 'juan@freshkart.ph',
    password: 'farmer123',
    role: 'farmer',
    address: 'Poblacion, Hinunangan, Southern Leyte',
    phone: '+63 912 345 6789',
    farmName: 'Bayanihan Farm',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'seed-farmer-2',
    name: 'Maria Santos',
    email: 'maria@freshkart.ph',
    password: 'farmer123',
    role: 'farmer',
    address: 'Brgy. San Jose, Hinunangan, Southern Leyte',
    phone: '+63 923 456 7890',
    farmName: 'Masagana Agri-Farm',
    createdAt: '2026-01-02T08:00:00Z',
  },
  {
    id: 'seed-farmer-3',
    name: 'Pedro Reyes',
    email: 'pedro@freshkart.ph',
    password: 'farmer123',
    role: 'farmer',
    address: 'Brgy. Mahayahay, Hinunangan, Southern Leyte',
    phone: '+63 934 567 8901',
    farmName: 'Bulacan Harvest',
    createdAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'seed-resident-1',
    name: 'Anna Gonzales',
    email: 'anna@freshkart.ph',
    password: 'resident123',
    role: 'resident',
    address: 'Brgy. Catublian, Hinunangan, Southern Leyte',
    phone: '+63 945 678 9012',
    farmName: '',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'seed-resident-2',
    name: 'Benito Reyes',
    email: 'ben@freshkart.ph',
    password: 'resident123',
    role: 'resident',
    address: 'Brgy. San Antonio, Hinunangan, Southern Leyte',
    phone: '+63 956 789 0123',
    farmName: '',
    createdAt: '2026-01-07T08:00:00Z',
  },
];

const seedProducts = [
  {
    id: 'seed-p-1', farmerId: 'seed-farmer-1', farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
    name: 'Fresh Baguio Beans', description: 'Freshly picked green beans from the cool highlands. Pesticide-free.',
    price: 80, unit: 'kg', category: 'vegetables',
    image: 'https://images.pexels.com/photos/4148642/pexels-photo-4148642.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 50, isAvailable: true, createdAt: '2026-01-15T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-2', farmerId: 'seed-farmer-1', farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
    name: 'Organic Eggplant', description: 'Large, glossy purple eggplants grown with natural compost.',
    price: 60, unit: 'kg', category: 'vegetables',
    image: 'https://images.pexels.com/photos/16732700/pexels-photo-16732700.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 40, isAvailable: true, createdAt: '2026-01-15T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-3', farmerId: 'seed-farmer-1', farmerName: 'Juan Dela Cruz', farmName: 'Bayanihan Farm',
    name: 'Cavendish Banana', description: 'Sweet ripe Cavendish bananas from our plantation.',
    price: 50, unit: 'kg', category: 'fruits',
    image: 'https://images.pexels.com/photos/30893281/pexels-photo-30893281.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 100, isAvailable: true, createdAt: '2026-01-15T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-4', farmerId: 'seed-farmer-2', farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
    name: 'Fresh Tilapia', description: 'Live fresh tilapia from our fishpond. Clean and sweet-tasting.',
    price: 120, unit: 'kg', category: 'fish',
    image: 'https://images.pexels.com/photos/36618317/pexels-photo-36618317.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 30, isAvailable: true, createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-5', farmerId: 'seed-farmer-2', farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
    name: 'Free-Range Native Chicken', description: 'Native chicken raised free-range. Perfect for tinola.',
    price: 250, unit: 'piece', category: 'poultry',
    image: 'https://images.pexels.com/photos/30248442/pexels-photo-30248442.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 20, isAvailable: true, createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-6', farmerId: 'seed-farmer-2', farmerName: 'Maria Santos', farmName: 'Masagana Agri-Farm',
    name: 'Carabao Mangoes', description: 'Sweetest carabao mangoes from Luzon. Farm-fresh!',
    price: 150, unit: 'kg', category: 'fruits',
    image: 'https://images.pexels.com/photos/30893290/pexels-photo-30893290.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 25, isAvailable: true, createdAt: '2026-01-16T08:00:00Z', organic: true, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-7', farmerId: 'seed-farmer-3', farmerName: 'Pedro Reyes', farmName: 'Bulacan Harvest',
    name: 'Fresh Duck Eggs (Itlog na Pato)', description: 'Farm-fresh duck eggs. Perfect for balut or salted egg.',
    price: 12, unit: 'piece', category: 'poultry',
    image: 'https://images.pexels.com/photos/32701556/pexels-photo-32701556.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 200, isAvailable: true, createdAt: '2026-01-17T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
  },
  {
    id: 'seed-p-8', farmerId: 'seed-farmer-3', farmerName: 'Pedro Reyes', farmName: 'Bulacan Harvest',
    name: 'Malagkit Rice (Glutinous)', description: 'Premium malagkit rice perfect for suman and kakanin.',
    price: 70, unit: 'kg', category: 'rice-grains',
    image: 'https://images.pexels.com/photos/18446086/pexels-photo-18446086.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    stock: 100, isAvailable: true, createdAt: '2026-01-17T08:00:00Z', organic: false, location: 'Hinunangan, Southern Leyte',
  },
];

const seedOrders = [
  {
    id: 'seed-order-1', residentId: 'seed-resident-1', residentName: 'Anna Gonzales',
    residentAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', residentPhone: '+63 945 678 9012',
    farmerId: 'seed-farmer-1',
    items: [
      { productId: 'seed-p-1', productName: 'Fresh Baguio Beans', quantity: 2, unitPrice: 80 },
      { productId: 'seed-p-3', productName: 'Cavendish Banana', quantity: 3, unitPrice: 50 },
    ],
    totalAmount: 310, status: 'delivered',
    statusHistory: [
      { status: 'pending', timestamp: '2026-02-01T08:00:00Z' },
      { status: 'confirmed', timestamp: '2026-02-01T10:00:00Z' },
      { status: 'processing', timestamp: '2026-02-01T14:00:00Z' },
      { status: 'shipped', timestamp: '2026-02-02T06:00:00Z' },
      { status: 'delivered', timestamp: '2026-02-02T14:00:00Z' },
    ],
    createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-02-02T14:00:00Z',
    deliveryAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', notes: '',
    payment: { method: 'gcash', status: 'paid', reference: 'GC-2026-001', paidAt: '2026-02-01T08:05:00Z' },
    deliveryAssignment: { driverName: 'Carlos Mendoza', driverPhone: '+63 917 111 2233', assignedAt: '2026-02-02T06:00:00Z', estimatedDelivery: '2026-02-02T14:00:00Z' },
  },
  {
    id: 'seed-order-2', residentId: 'seed-resident-1', residentName: 'Anna Gonzales',
    residentAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', residentPhone: '+63 945 678 9012',
    farmerId: 'seed-farmer-2',
    items: [
      { productId: 'seed-p-4', productName: 'Fresh Tilapia', quantity: 2, unitPrice: 120 },
      { productId: 'seed-p-6', productName: 'Carabao Mangoes', quantity: 1, unitPrice: 150 },
    ],
    totalAmount: 390, status: 'shipped',
    statusHistory: [
      { status: 'pending', timestamp: '2026-02-05T08:00:00Z' },
      { status: 'confirmed', timestamp: '2026-02-05T09:00:00Z' },
      { status: 'processing', timestamp: '2026-02-05T12:00:00Z' },
      { status: 'shipped', timestamp: '2026-02-06T06:00:00Z' },
    ],
    createdAt: '2026-02-05T08:00:00Z', updatedAt: '2026-02-06T06:00:00Z',
    deliveryAddress: 'Brgy. Catublian, Hinunangan, Southern Leyte', notes: '',
    payment: { method: 'cod', status: 'unpaid' },
    deliveryAssignment: { driverName: 'Liza Fernandez', driverPhone: '+63 918 222 3344', assignedAt: '2026-02-06T06:00:00Z', estimatedDelivery: '2026-02-06T18:00:00Z' },
  },
];

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function sendError(res, err, status = 500) {
  console.error(err);
  res.status(status).json({ error: err?.message || 'Server error' });
}

function requireDb(req, res, next) {
  if (!pool) {
    return res.status(500).json({
      error: `Database is not configured. Missing environment variable(s): ${missingDbFields.join(', ')}`,
    });
  }
  return next();
}

function userFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
    address: row.address || '',
    phone: row.phone || '',
    farmName: row.farm_name || '',
    farmDescription: row.farm_description || '',
    farmAvatar: row.farm_avatar || '',
    avatar: row.avatar || '',
    createdAt: row.created_at,
  };
}

function productFromRow(row) {
  return {
    id: row.id,
    farmerId: row.farmer_id,
    farmerName: row.farmer_name,
    farmName: row.farm_name,
    name: row.name,
    description: row.description,
    price: Number(row.price || 0),
    unit: row.unit,
    category: row.category,
    image: row.image,
    stock: Number(row.stock || 0),
    isAvailable: Boolean(row.is_available),
    createdAt: row.created_at,
    organic: Boolean(row.organic),
    location: row.location || '',
  };
}

function orderFromRow(row) {
  return {
    id: row.id,
    residentId: row.resident_id,
    residentName: row.resident_name,
    residentAddress: row.resident_address,
    residentPhone: row.resident_phone,
    farmerId: row.farmer_id,
    items: parseJson(row.items, []),
    totalAmount: Number(row.total_amount || 0),
    status: row.status,
    statusHistory: parseJson(row.status_history, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deliveryAddress: row.delivery_address,
    notes: row.notes || '',
    payment: parseJson(row.payment, { method: 'cod', status: 'unpaid' }),
    deliveryAssignment: parseJson(row.delivery_assignment, undefined),
  };
}

async function getAllData() {
  const [userRows] = await pool.query('SELECT * FROM users ORDER BY created_at ASC, name ASC');
  const [productRows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC, name ASC');
  const [orderRows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return {
    users: userRows.map(userFromRow),
    products: productRows.map(productFromRow),
    orders: orderRows.map(orderFromRow),
  };
}

async function getUserById(id) {
  const [[row]] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return row ? userFromRow(row) : null;
}

async function getProductById(id) {
  const [[row]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return row ? productFromRow(row) : null;
}

async function getOrderById(id) {
  const [[row]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  return row ? orderFromRow(row) : null;
}

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(80) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('farmer','resident','admin') NOT NULL DEFAULT 'resident',
      address TEXT,
      phone VARCHAR(80),
      farm_name VARCHAR(190),
      farm_description TEXT,
      farm_avatar LONGTEXT,
      avatar LONGTEXT,
      created_at VARCHAR(40) NOT NULL,
      INDEX idx_users_role (role),
      INDEX idx_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(80) PRIMARY KEY,
      farmer_id VARCHAR(80) NOT NULL,
      farmer_name VARCHAR(150) NOT NULL,
      farm_name VARCHAR(190) NOT NULL,
      name VARCHAR(190) NOT NULL,
      description TEXT,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      unit VARCHAR(40) NOT NULL DEFAULT 'kg',
      category VARCHAR(60) NOT NULL DEFAULT 'other',
      image LONGTEXT,
      stock INT NOT NULL DEFAULT 0,
      is_available TINYINT(1) NOT NULL DEFAULT 1,
      organic TINYINT(1) NOT NULL DEFAULT 0,
      location VARCHAR(190),
      created_at VARCHAR(40) NOT NULL,
      INDEX idx_products_farmer (farmer_id),
      INDEX idx_products_category (category),
      INDEX idx_products_available (is_available)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(80) PRIMARY KEY,
      resident_id VARCHAR(80) NOT NULL,
      resident_name VARCHAR(150) NOT NULL,
      resident_address TEXT,
      resident_phone VARCHAR(80),
      farmer_id VARCHAR(80) NOT NULL,
      items JSON NOT NULL,
      total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
      status_history JSON NOT NULL,
      created_at VARCHAR(40) NOT NULL,
      updated_at VARCHAR(40) NOT NULL,
      delivery_address TEXT,
      notes TEXT,
      payment JSON NOT NULL,
      delivery_assignment JSON NULL,
      INDEX idx_orders_resident (resident_id),
      INDEX idx_orders_farmer (farmer_id),
      INDEX idx_orders_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function seedIfEmpty() {
  const [[userCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (Number(userCount.count) === 0) {
    for (const user of seedUsers) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, address, phone, farm_name, farm_description, farm_avatar, avatar, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.password, user.role, user.address, user.phone, user.farmName || '', '', '', '', user.createdAt]
      );
    }
  }

  const [[productCount]] = await pool.query('SELECT COUNT(*) AS count FROM products');
  if (Number(productCount.count) === 0) {
    for (const product of seedProducts) {
      await pool.query(
        `INSERT INTO products (id, farmer_id, farmer_name, farm_name, name, description, price, unit, category, image, stock, is_available, organic, location, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id, product.farmerId, product.farmerName, product.farmName, product.name, product.description,
          product.price, product.unit, product.category, product.image, product.stock, product.isAvailable ? 1 : 0,
          product.organic ? 1 : 0, product.location || '', product.createdAt,
        ]
      );
    }
  }

  const [[orderCount]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
  if (Number(orderCount.count) === 0) {
    for (const order of seedOrders) {
      await pool.query(
        `INSERT INTO orders (id, resident_id, resident_name, resident_address, resident_phone, farmer_id, items, total_amount, status, status_history, created_at, updated_at, delivery_address, notes, payment, delivery_assignment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id, order.residentId, order.residentName, order.residentAddress, order.residentPhone, order.farmerId,
          JSON.stringify(order.items), order.totalAmount, order.status, JSON.stringify(order.statusHistory), order.createdAt,
          order.updatedAt, order.deliveryAddress, order.notes || '', JSON.stringify(order.payment), JSON.stringify(order.deliveryAssignment || null),
        ]
      );
    }
  }
}

async function initDb() {
  if (missingDbFields.length > 0) {
    console.warn(`Aiven/MySQL environment variables missing: ${missingDbFields.join(', ')}`);
    return;
  }

  pool = mysql.createPool(dbConfig);
  await pool.query('SELECT 1');
  await ensureSchema();
  await seedIfEmpty();
  console.log(`Connected to Aiven/MySQL database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
}

app.get('/api/health', async (_req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ ok: false, database: 'not configured', missing: missingDbFields });
    }
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'aiven-mysql' });
  } catch (err) {
    sendError(res, err);
  }
});

app.get('/api/state', requireDb, async (_req, res) => {
  try {
    res.json(await getAllData());
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/login', requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const [[row]] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1', [email, password]);
    if (!row) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ user: userFromRow(row) });
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/register', requireDb, async (req, res) => {
  try {
    const { name, email, password, role, address, phone, farmName, farmDescription, farmAvatar, avatar } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    if (!['farmer', 'resident', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });

    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const id = newId('user');
    const createdAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, address, phone, farm_name, farm_description, farm_avatar, avatar, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, password, role, address || '', phone || '', farmName || '', farmDescription || '', farmAvatar || '', avatar || '', createdAt]
    );
    res.status(201).json({ user: await getUserById(id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/users/:id', requireDb, async (req, res) => {
  try {
    const existing = await getUserById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found.' });
    const next = { ...existing, ...req.body };
    const [[emailOwner]] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1', [next.email, req.params.id]);
    if (emailOwner) return res.status(409).json({ error: 'Email already registered' });
    await pool.query(
      `UPDATE users SET name = ?, email = ?, password = ?, role = ?, address = ?, phone = ?, farm_name = ?, farm_description = ?, farm_avatar = ?, avatar = ? WHERE id = ?`,
      [
        next.name, next.email, next.password, next.role, next.address || '', next.phone || '', next.farmName || '',
        next.farmDescription || '', next.farmAvatar || '', next.avatar || '', req.params.id,
      ]
    );
    res.json({ user: await getUserById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/users/:id', requireDb, async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await pool.query('DELETE FROM products WHERE farmer_id = ?', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/products', requireDb, async (req, res) => {
  try {
    const { farmerId, name, description, price, unit, category, image, stock, isAvailable, organic, location } = req.body;
    if (!farmerId || !name) return res.status(400).json({ error: 'Farmer and product name are required.' });
    const farmer = await getUserById(farmerId);
    if (!farmer || farmer.role !== 'farmer') return res.status(400).json({ error: 'Invalid farmer account.' });
    const id = newId('prod');
    const createdAt = new Date().toISOString();
    await pool.query(
      `INSERT INTO products (id, farmer_id, farmer_name, farm_name, name, description, price, unit, category, image, stock, is_available, organic, location, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, farmer.id, farmer.name, farmer.farmName || 'Farm', name, description || '', Number(price || 0), unit || 'kg',
        category || 'other', image || '', Number(stock || 0), isAvailable === false ? 0 : 1, organic ? 1 : 0,
        location || farmer.address || '', createdAt,
      ]
    );
    res.status(201).json({ product: await getProductById(id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.put('/api/products/:id', requireDb, async (req, res) => {
  try {
    const existing = await getProductById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found.' });
    const next = { ...existing, ...req.body };
    await pool.query(
      `UPDATE products SET farmer_id = ?, farmer_name = ?, farm_name = ?, name = ?, description = ?, price = ?, unit = ?, category = ?, image = ?, stock = ?, is_available = ?, organic = ?, location = ? WHERE id = ?`,
      [
        next.farmerId, next.farmerName, next.farmName, next.name, next.description || '', Number(next.price || 0),
        next.unit || 'kg', next.category || 'other', next.image || '', Number(next.stock || 0), next.isAvailable ? 1 : 0,
        next.organic ? 1 : 0, next.location || '', req.params.id,
      ]
    );
    res.json({ product: await getProductById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.patch('/api/products/:id/toggle', requireDb, async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    await pool.query('UPDATE products SET is_available = ? WHERE id = ?', [product.isAvailable ? 0 : 1, req.params.id]);
    res.json({ product: await getProductById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.delete('/api/products/:id', requireDb, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true, id: req.params.id });
  } catch (err) {
    sendError(res, err);
  }
});

app.post('/api/orders', requireDb, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { residentId, cart, notes, paymentMethod, receiptUrl } = req.body;
    if (!residentId || !Array.isArray(cart) || cart.length === 0) return res.status(400).json({ error: 'Resident and cart items are required.' });
    const resident = await getUserById(residentId);
    if (!resident || resident.role !== 'resident') return res.status(400).json({ error: 'Invalid resident account.' });

    const productIds = cart.map((item) => item.productId || item.product?.id);
    const [productRows] = await pool.query(`SELECT * FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`, productIds);
    const products = productRows.map(productFromRow);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = [];
    let totalAmount = 0;
    let farmerId = '';
    for (const cartItem of cart) {
      const productId = cartItem.productId || cartItem.product?.id;
      const product = productMap.get(productId);
      const quantity = Number(cartItem.quantity || 0);
      if (!product) return res.status(400).json({ error: `Product not found: ${productId}` });
      if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be greater than zero.' });
      if (product.stock < quantity) return res.status(400).json({ error: `${product.name} does not have enough stock.` });
      if (!farmerId) farmerId = product.farmerId;
      items.push({ productId: product.id, productName: product.name, quantity, unitPrice: product.price });
      totalAmount += product.price * quantity;
    }

    const now = new Date().toISOString();
    const payment = {
      method: paymentMethod || 'cod',
      status: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      reference: paymentMethod && paymentMethod !== 'cod' ? `REF-${Date.now().toString(36).toUpperCase()}` : undefined,
      receiptUrl: receiptUrl || undefined,
      paidAt: paymentMethod && paymentMethod !== 'cod' ? now : undefined,
    };

    const id = newId('order');
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO orders (id, resident_id, resident_name, resident_address, resident_phone, farmer_id, items, total_amount, status, status_history, created_at, updated_at, delivery_address, notes, payment, delivery_assignment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        id, resident.id, resident.name, resident.address || '', resident.phone || '', farmerId, JSON.stringify(items), totalAmount,
        'pending', JSON.stringify([{ status: 'pending', timestamp: now }]), now, now, resident.address || '', notes || '', JSON.stringify(payment),
      ]
    );

    for (const item of items) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId]);
    }
    await conn.commit();

    res.status(201).json({ order: await getOrderById(id), ...(await getAllData()) });
  } catch (err) {
    await conn.rollback();
    sendError(res, err);
  } finally {
    conn.release();
  }
});

app.patch('/api/orders/:id/status', requireDb, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const now = new Date().toISOString();
    const history = [...(order.statusHistory || []), { status, timestamp: now, note }];
    await pool.query('UPDATE orders SET status = ?, updated_at = ?, status_history = ? WHERE id = ?', [status, now, JSON.stringify(history), req.params.id]);
    res.json({ order: await getOrderById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.patch('/api/orders/:id/delivery', requireDb, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const assignment = { ...req.body, assignedAt: req.body.assignedAt || new Date().toISOString() };
    await pool.query('UPDATE orders SET delivery_assignment = ?, updated_at = ? WHERE id = ?', [JSON.stringify(assignment), new Date().toISOString(), req.params.id]);
    res.json({ order: await getOrderById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.patch('/api/orders/:id/payment', requireDb, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const payment = { ...(order.payment || {}), ...req.body };
    await pool.query('UPDATE orders SET payment = ?, updated_at = ? WHERE id = ?', [JSON.stringify(payment), new Date().toISOString(), req.params.id]);
    res.json({ order: await getOrderById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

initDb()
  .catch((err) => {
    console.error('Database initialization failed:', err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`FreshKart PH server running on port ${PORT}`);
    });
  });
