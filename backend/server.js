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

// ── Logging Middleware (DEBUGGER: This prints every request to logs) ──────────
app.use((req, res, next) => {
  console.log(`[REQUEST RECEIVED] ${req.method} ${req.url}`);
  next();
});

// ── CORS Configuration ────────────────────────────────────────────────────────
const corsOptions = {
  // If FRONTEND_URL is set in Railway, use it. Otherwise, fallback to *
  origin: process.env.FRONTEND_URL || '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.status(200).send('API Gateway is operational'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// --- Products Routes ---
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, sku, basePrice, description, image } = req.body;
  try {
    const productId = id || `prod_${Date.now()}`;
    await pool.query('INSERT INTO products (id, name, sku, basePrice, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, sku.toUpperCase().trim(), Number(basePrice), description, image]);
    res.status(201).json({ success: true, id: productId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// --- Customers ---
app.get('/api/customers', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name AS companyName, email, phone, role FROM users WHERE role = "client"');
  res.json(rows);
});

// --- Pricing Rules ---
app.get('/api/pricing-rules', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pricing_rules');
  res.json(rows);
});

app.post('/api/pricing-rules', async (req, res) => {
  const { productId, customerId, customizedPrice } = req.body;
  await pool.query('INSERT INTO pricing_rules (id, productId, customerId, customizedPrice) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE customizedPrice = VALUES(customizedPrice)',
    [`rule_${Date.now()}`, productId, customerId, Number(customizedPrice)]);
  res.status(201).json({ success: true });
});

app.delete('/api/pricing-rules/:id', async (req, res) => {
  await pool.query('DELETE FROM pricing_rules WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// --- Customer Products ---
app.get('/api/customer-products', async (req, res) => {
  const [products] = await pool.query('SELECT * FROM customer_products');
  const [assignments] = await pool.query('SELECT * FROM customer_product_assignments');
  const result = products.map(p => ({
    ...p, 
    assignedCustomers: assignments.filter(a => a.productId === p.id).map(a => a.customerId),
    customerPricing: Object.fromEntries(assignments.filter(a => a.productId === p.id).map(a => [a.customerId, Number(a.price)]))
  }));
  res.json(result);
});

// ── Global Error Handler (The Catch-All) ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gateway Live on Port ${PORT}`);
    console.log(`CORS Policy: ${process.env.FRONTEND_URL || '*'}`);
});