import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const role = isAdmin ? 'admin' : 'client';

  try {
    // Basic query, no validation middleware interference
    const [rows] = await pool.query(
      'SELECT id, role, name, email FROM users WHERE role = ? AND name = ? AND password = ?',
      [role, username.trim(), password]
    );

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error("Database Query Error:", err);
    res.status(500).json({ success: false, error: 'Database error occurred.' });
  }
});

export default router;