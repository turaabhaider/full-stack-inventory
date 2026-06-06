import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  // FIX: guard against missing body (e.g. wrong Content-Type header)
  const body = req.body || {};
  const { username, password, isAdmin } = body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    if (isAdmin) {
      // Admin password from Railway env var — falls back to default
      // FIX: trim both sides so accidental whitespace in Railway variable doesn't break comparison
      const adminPassword = (process.env.ADMIN_PASSWORD || 'paktex 2026').trim();
      const submittedPassword = String(password).trim();

      if (submittedPassword !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }

      // FIX: use LOWER() on both sides so "Daniyal Khan" vs "daniyal khan" doesn't matter
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName FROM users WHERE role = "admin" AND LOWER(name) = LOWER(?)',
        [username.trim()]
      );

      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found.' });

    } else {
      // Client login — match by name AND password
      const [rows] = await pool.query(
        'SELECT id, role, name AS companyName, email, phone FROM users WHERE role = "client" AND LOWER(name) = LOWER(?) AND password = ?',
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
  // FIX: guard against undefined req.body (missing Content-Type header from frontend)
  const body = req.body || {};
  const { name, email, phone, password } = body;

  // FIX: trim + coerce to string before using — prevents .toLowerCase() crash
  const safeName     = name     ? String(name).trim()     : '';
  const safeEmail    = email    ? String(email).trim().toLowerCase() : '';
  const safePhone    = phone    ? String(phone).trim()    : '';
  const safePassword = password ? String(password)        : '';

  // Validation
  if (!safeName || !safeEmail || !safePassword) {
    return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
  }

  try {
    // Check for existing user
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = ?',
      [safeEmail]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    // Insert new client user
    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)',
      [id, safeName, safeEmail, safePhone, safePassword]
    );

    res.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ success: false, error: 'Internal Database Error.' });
  }
});

export default router;