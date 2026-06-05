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

// ── CORS Configuration (Permissive Debug Mode) ────────────────────────────────
const corsOptions = {
  origin: '*', // This forces the backend to accept requests from ANY origin
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

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Products ──────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, sku, basePrice, description, image } = req.body;
  if (!name || !sku || basePrice === undefined) {
    return res.status(400).json({ error: 'name, sku, and basePrice are required.' });
  }
  try {
    const productId = id || `prod_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await pool.query(
      'INSERT INTO products (id, name, sku, basePrice, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, sku.toUpperCase().trim(), Number(basePrice), description || null, image || null]
    );
    res.status(201).json({ success: true, id: productId });
  } catch (err) {
    console.error('Product create error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A product with that SKU already exists.' });
    }
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ── Customers ─────────────────────────────────────────────────────────────────
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name AS companyName, email, phone, role FROM users WHERE role = "client"'
    );
    res.json(rows);
  } catch (err) {
    console.error('Customers fetch error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// ── Pricing Rules ─────────────────────────────────────────────────────────────
app.get('/api/pricing-rules', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pricing_rules');
    res.json(rows);
  } catch (err) {
    console.error('Pricing rules fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch pricing rules.' });
  }
});

app.post('/api/pricing-rules', async (req, res) => {
  const { id, productId, customerId, customizedPrice } = req.body;
  if (!productId || !customerId || customizedPrice === undefined) {
    return res.status(400).json({ error: 'productId, customerId, and customizedPrice are required.' });
  }
  try {
    const ruleId = id || `rule_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await pool.query(
      `INSERT INTO pricing_rules (id, productId, customerId, customizedPrice) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE customizedPrice = VALUES(customizedPrice)`,
      [ruleId, productId, customerId, Number(customizedPrice)]
    );
    res.status(201).json({ success: true, id: ruleId });
  } catch (err) {
    console.error('Pricing rule upsert error:', err);
    res.status(500).json({ error: 'Failed to save pricing rule.' });
  }
});

app.delete('/api/pricing-rules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pricing_rules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Pricing rule delete error:', err);
    res.status(500).json({ error: 'Failed to delete pricing rule.' });
  }
});

// ── Customer Products ────────────────────────────────────────────────────────
app.get('/api/customer-products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM customer_products');
    const [assignments] = await pool.query('SELECT * FROM customer_product_assignments');
    const result = products.map(p => {
      const assigned = assignments.filter(a => a.productId === p.id);
      const assignedCustomers = assigned.map(a => a.customerId);
      const customerPricing = {};
      assigned.forEach(a => { customerPricing[a.customerId] = Number(a.price); });
      return { ...p, basePrice: Number(p.basePrice), isCustomerProduct: true, assignedCustomers, customerPricing };
    });
    res.json(result);
  } catch (err) {
    console.error('Customer products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch customer products.' });
  }
});

app.post('/api/customer-products', async (req, res) => {
  const { id, name, sku, description, basePrice, image, assignedCustomers, customerPricing } = req.body;
  if (!name || !sku || !assignedCustomers?.length) {
    return res.status(400).json({ error: 'name, sku, and at least one assignedCustomer are required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const productId = id || `cprod_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    await conn.query(
      'INSERT INTO customer_products (id, name, sku, description, basePrice, image) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, name, sku.toUpperCase().trim(), description || null, Number(basePrice) || 0, image || null]
    );
    for (const customerId of assignedCustomers) {
      const price = customerPricing?.[customerId] ?? Number(basePrice) ?? 0;
      await conn.query(
        'INSERT INTO customer_product_assignments (productId, customerId, price) VALUES (?, ?, ?)',
        [productId, customerId, price]
      );
    }
    await conn.commit();
    res.status(201).json({ success: true, id: productId });
  } catch (err) {
    await conn.rollback();
    console.error('Customer product create error:', err);
    res.status(500).json({ error: 'Failed to create customer product.' });
  } finally {
    conn.release();
  }
});

app.delete('/api/customer-products/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM customer_product_assignments WHERE productId = ?', [req.params.id]);
    await conn.query('DELETE FROM customer_products WHERE id = ?', [req.params.id]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error('Customer product delete error:', err);
    res.status(500).json({ error: 'Failed to delete customer product.' });
  } finally {
    conn.release();
  }
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Secure API Gateway active on Port ${PORT}`));