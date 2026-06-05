import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  // Guard: reject if required fields are missing
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    if (isAdmin) {
      if (password !== 'paktex 2026') {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }
      // FIX: alias name → companyName to match what the frontend expects
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName FROM users WHERE role = "admin" AND name = ?',
        [username]
      );
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found.' });
    } else {
      // FIX: alias name → companyName for client login too
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName, email, phone FROM users WHERE role = "client" AND name = ? AND password = ?',
        [username, password]
      );
      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Invalid Client credentials.' });
    }
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({ success: false, error: 'Server database fault.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  // Password length check
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  try {
    // FIX: check for duplicate email before inserting to avoid cryptic DB errors
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    // FIX: use UUID-style ID (timestamp + random) to prevent collisions
    const id = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const query = 'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)';

    await pool.query(query, [id, name, email, phone || null, password]);

    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (err) {
    console.error('Registration Database Error:', err);
    res.status(500).json({ success: false, error: 'Database failed to create user. Check server logs.' });
  }
});

export default router;