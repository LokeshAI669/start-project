const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// ── POST /api/auth/login ───────────────────────────────────────────────────
// Verifies email + password against DB, returns a signed JWT.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const user = rows[0];

    // password_hash was stored as 'mock' for the old dev seed — reject those
    if (user.password_hash === 'mock')
      return res.status(401).json({ error: 'Account not set up for password login.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AUTH] JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Server misconfiguration.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('[AUTH] login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────────────────
// Returns the current user based on Bearer token — useful for session restore.
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'No token provided.' });

    const token  = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);

    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [payload.id]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'User not found.' });

    res.json({ user: rows[0] });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
