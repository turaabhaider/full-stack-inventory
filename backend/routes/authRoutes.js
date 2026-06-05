import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    if (isAdmin) {
      if (password !== 'paktex 2026') return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      const [rows] = await pool.query('SELECT id, role, name FROM users WHERE role = "admin" AND name = ?', [username]);
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found.' });
    } else {
      const [rows] = await pool.query('SELECT * FROM users WHERE role = "client" AND name = ? AND password = ?', [username, password]);
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Invalid Client credentials.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server database fault.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  
  // Basic Validation: Ensure fields are not empty
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  try {
    const id = Date.now().toString();
    const query = 'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)';
    
    await pool.query(query, [id, name, email, phone, password]);
    
    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (err) {
    console.error("Registration Database Error:", err);
    // This will help you see the EXACT error in your Backend Logs
    res.status(500).json({ success: false, error: 'Database failed to create user. Check server logs.' });
  }
});

export default router;