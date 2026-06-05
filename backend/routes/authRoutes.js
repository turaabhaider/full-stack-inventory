import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  try {
    if (isAdmin) {
      // Admin Logic: Enforce "paktex 2026"
      if (password !== 'paktex 2026') {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }
      
      const [rows] = await pool.query('SELECT id, role, name FROM users WHERE role = "admin" AND name = ?', [username]);
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found.' });

    } else {
      // Client Logic: Check DB for user-defined password
      const [rows] = await pool.query('SELECT * FROM users WHERE role = "client" AND name = ? AND password = ?', [username, password]);
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Invalid Client credentials.' });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: 'Server database fault.' });
  }
});

// --- REGISTRATION ROUTE (For Clients) ---
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    // Generate a unique ID (simple timestamp for now)
    const id = Date.now().toString();
    const query = 'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)';
    await pool.query(query, [id, name, email, phone, password]);
    
    res.json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ success: false, error: 'Could not register user.' });
  }
});

export default router;