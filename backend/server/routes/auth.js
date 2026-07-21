const express   = require('express');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');
const { pool } = require('../db');
const { signToken } = require('../auth');
const mailer    = require('../mailer');

const router = express.Router();

// ── POST /api/register ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, 'student')
      RETURNING *
    `, [name.trim(), email.toLowerCase().trim(), hash]);

    const user = rows[0];
    await mailer.welcome(user).catch(e => console.error(e));

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[AUTH] Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── POST /api/login — unified (role detected from DB) ────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── POST /api/forgot-password ────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { rows: users } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'Email address not found in our system.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expires]
    );
    await mailer.passwordReset(user, resetToken).catch(e => console.error(e));

    res.json({ message: 'A reset link has been sent to your email.' });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/reset-password ─────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows: tokens } = await pool.query('SELECT * FROM password_resets WHERE token = $1 AND used = false', [token]);
    const resetRecord = tokens[0];
    
    if (!resetRecord || new Date() > new Date(resetRecord.expires_at))
      return res.status(400).json({ error: 'Reset link is invalid or has expired (30 min limit)' });

    const hash = await bcrypt.hash(password, 12);
    
    // Update the user's password
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, resetRecord.user_id]);
    
    // Mark the token as used
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [resetRecord.id]);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
