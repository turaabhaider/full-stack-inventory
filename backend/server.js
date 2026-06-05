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
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ 
    origin: allowedOrigin, 
    credentials: true 
}));

app.use(express.json());

// Railway Health Check: Ensures your service is marked "Healthy"
app.get('/', (req, res) => res.send('API Gateway is operational'));

app.use('/api/auth', authRoutes);

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error("Database Fetch Error:", err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "client"');
    res.json(rows);
  } catch (err) {
    console.error("Database Fetch Error:", err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Secure API Gateway active on Port ${PORT}`));