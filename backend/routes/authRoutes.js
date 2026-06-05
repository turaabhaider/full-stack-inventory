import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  // Safety: req.body can be undefined if Content-Type header is missing
  const body = req.body || {};
  const { username, password, isAdmin } = body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    if (isAdmin) {
      // Admin password is stored in env var for easy rotation without redeployment
      // Falls back to hardcoded value so existing setup still works
      const adminPassword = process.env.ADMIN_PASSWORD || 'paktex 2026';
      if (password !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }
      // Return companyName alias so frontend never gets undefined.companyName
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName FROM users WHERE role = "admin" AND name = ?',
        [username.trim()]
      );
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found.' });
    } else {
      // Client login — match by name AND password
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName, email, phone FROM users WHERE role = "client" AND name = ? AND password = ?',
        [username.trim(), password]
      );
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Invalid Client credentials.' });
    }
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({ success: false, error: 'Server database fault.' });
  }
});

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const body = req.body || {};
  const { name, email, phone, password } = body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  if (password.length < 3) {
    return res.status(400).json({ success: false, error: 'Password must be at least 3 characters.' });
  }

  try {
    // Check for duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    await pool.query(
      'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)',
      [id, name.trim(), email.trim(), phone || null, password]
    );
    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (err) {
    console.error('Registration DB error:', err);
    res.status(500).json({ success: false, error: 'Database failed to create user. Check server logs.' });
  }
});

export default router;