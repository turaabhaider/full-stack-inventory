import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const body = req.body || {};
  const { username, password, isAdmin } = body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    if (isAdmin) {
      // Trim both sides — accidental whitespace in Railway var was causing mismatch
      const adminPassword = (process.env.ADMIN_PASSWORD || 'paktex 2026').trim();
      const submitted     = String(password).trim();

      if (submitted !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Invalid Admin Password.' });
      }

      // Case-insensitive name match — "daniyal khan" matches "Daniyal Khan" in DB
      // Return name as both `name` and `companyName` so frontend never gets undefined
      const [rows] = await pool.query(
        `SELECT id, role, name, name AS companyName
         FROM users
         WHERE role = 'admin' AND LOWER(name) = LOWER(?)`,
        [username.trim()]
      );

      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Admin not found in database.' });

    } else {
      // Client login — case-insensitive name match
      const [rows] = await pool.query(
        `SELECT id, role, name, name AS companyName, email, phone
         FROM users
         WHERE role = 'client' AND LOWER(name) = LOWER(?) AND password = ?`,
        [username.trim(), password]
      );

      if (rows.length > 0) return res.json({ success: true, user: rows[0] });
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({ success: false, error: 'Server database fault.' });
  }
});

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const body = req.body || {};

  // Coerce everything to string — prevents .toLowerCase crash if field is undefined
  const name     = body.name     ? String(body.name).trim()             : '';
  const email    = body.email    ? String(body.email).trim().toLowerCase() : '';
  const phone    = body.phone    ? String(body.phone).trim()            : '';
  const password = body.password ? String(body.password)                : '';

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check duplicate email (case-insensitive)
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO users (id, role, name, email, phone, password) VALUES (?, "client", ?, ?, ?, ?)',
      [id, name, email, phone, password]
    );

    res.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ success: false, error: 'Database error during registration.' });
  }
});

export default router;