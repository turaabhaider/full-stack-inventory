import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import pool from './config/db.js';

dotenv.config();
const app = express();

app.use(helmet());

// Dynamic CORS: In production, this pulls from your environment variables
// On Railway set FRONTEND_URL=https://your-frontend.up.railway.app
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());

// Railway Health Check
app.get('/', (req, res) => res.send('API Gateway is operational'));

app.use('/api/auth', authRoutes);

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error('Database Fetch Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// FIX: alias `name` → `companyName` so AdminDashboard never gets undefined
// on client.companyName (which caused the Cannot read properties of undefined
// (reading 'toLowerCase') crash you saw in production)
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name AS companyName, email, phone, role FROM users WHERE role = "client"'
    );
    res.json(rows);
  } catch (err) {
    console.error('Database Fetch Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Secure API Gateway active on Port ${PORT}`));