import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import pool from './config/db.js';

dotenv.config();

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Logging Middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── CORS — reads FRONTEND_URL from Railway Variables ─────────────────────────
const allowedOrigin = process.env.FRONTEND_URL || 'https://full-stack-inventory-production.up.railway.app';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === allowedOrigin) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.status(200).send('API Gateway is operational'));

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows || []);
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json([]);
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, sku, basePrice, description, image } = req.body;
  try {
    const productId = id || `prod_${Date.now()}`;
    await pool.query(
      'INSERT INTO products (id, name, sku, basePrice, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, sku.toUpperCase().trim(), Number(basePrice), description, image]
    );
    res.status(201).json({ success: true, id: productId });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ── Customers ─────────────────────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, name AS companyName, email, phone, role FROM users WHERE role = "client"'
    );
    res.json(rows || []);
  } catch (err) {
    console.error('Customers fetch error:', err);
    res.status(500).json([]);
  }
});

// ── Pricing Rules ─────────────────────────────────────────────────────────────
app.get('/api/pricing-rules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing_rules');
    res.json(rows || []);
  } catch (err) {
    console.error('Pricing rules fetch error:', err);
    res.status(500).json([]);
  }
});

app.post('/api/pricing-rules', async (req, res) => {
  const { productId, customerId, customizedPrice } = req.body;
  try {
    await pool.query(
      'INSERT INTO pricing_rules (id, productId, customerId, customizedPrice) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE customizedPrice = VALUES(customizedPrice)',
      [`rule_${Date.now()}`, productId, customerId, Number(customizedPrice)]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Pricing rules create error:', err);
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

app.delete('/api/pricing-rules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pricing_rules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Pricing rules delete error:', err);
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

// ── Customer Products ─────────────────────────────────────────────────────────
app.get('/api/customer-products', async (req, res) => {
  try {
    const [products]    = await pool.query('SELECT * FROM customer_products');
    const [assignments] = await pool.query('SELECT * FROM customer_product_assignments');
    const result = (products || []).map(p => ({
      ...p,
      assignedCustomers: (assignments || [])
        .filter(a => a.productId === p.id)
        .map(a => a.customerId),
      customerPricing: Object.fromEntries(
        (assignments || [])
          .filter(a => a.productId === p.id)
          .map(a => [a.customerId, Number(a.price)])
      ),
    }));
    res.json(result);
  } catch (err) {
    console.error('Customer products fetch error:', err);
    res.status(500).json([]);
  }
});

app.post('/api/customer-products', async (req, res) => {
  const { id, name, sku, basePrice, description, image, assignedCustomers, customerPricing } = req.body;
  try {
    const productId = id || `cprod_${Date.now()}`;
    await pool.query(
      'INSERT INTO customer_products (id, name, sku, basePrice, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, sku, Number(basePrice), description, image]
    );
    if (Array.isArray(assignedCustomers)) {
      for (const cId of assignedCustomers) {
        const price = customerPricing?.[cId] ?? Number(basePrice);
        await pool.query(
          'INSERT INTO customer_product_assignments (productId, customerId, price) VALUES (?, ?, ?)',
          [productId, cId, price]
        );
      }
    }
    res.status(201).json({ success: true, id: productId });
  } catch (err) {
    console.error('Customer product create error:', err);
    res.status(500).json({ error: 'Failed to create customer product' });
  }
});

app.delete('/api/customer-products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM customer_product_assignments WHERE productId = ?', [req.params.id]);
    await pool.query('DELETE FROM customer_products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Customer product delete error:', err);
    res.status(500).json({ error: 'Failed to delete customer product' });
  }
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Gateway Live on Port ${PORT}`);
});