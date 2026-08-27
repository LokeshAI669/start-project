const jwt    = require('jsonwebtoken');
const { pool } = require('./db');

/**
 * Resolve a verified JWT to a DB user.
 * Returns the user row on success, null on any failure.
 */
async function resolveJwt(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret);
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [payload.id]
    );
    return rows[0] || null;
  } catch (_e) {
    return null;
  }
}

/**
 * requireAuth — strict JWT.
 * Every request MUST carry a valid Bearer token.
 */
async function requireAuth(req, res, next) {
  const user = await resolveJwt(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please log in.' });
  req.user = user;
  next();
}

/**
 * optionalAuth — populates req.user when a valid JWT is present; never blocks.
 */
async function optionalAuth(req, res, next) {
  const user = await resolveJwt(req.headers['authorization']);
  if (user) req.user = user;
  next();
}

/**
 * requireAdmin — strict JWT + admin role.
 */
async function requireAdmin(req, res, next) {
  const user = await resolveJwt(req.headers['authorization']);
  if (!user) return res.status(401).json({ error: 'Unauthorized — please log in.' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden — admin access required.' });
  req.user = user;
  next();
}

/**
 * requireStudent — JWT preferred; falls back to x-user-email header for
 * public (no-account) users so that the form-based student flow still works.
 */
async function requireStudent(req, res, next) {
  // 1. Try JWT first
  const user = await resolveJwt(req.headers['authorization']);
  if (user) {
    req.user = user;
    return next();
  }

  // 2. Fall back to x-user-email header (anonymous public users)
  const headerEmail = req.headers['x-user-email'];
  if (headerEmail && typeof headerEmail === 'string' && headerEmail.trim()) {
    const email = headerEmail.trim();
    try {
      const { rows } = await pool.query(
        'SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      req.user = rows[0] || { id: null, name: 'Guest', email, role: 'student' };
      return next();
    } catch (_e) {
      req.user = { id: null, name: 'Guest', email, role: 'student' };
      return next();
    }
  }

  return res.status(401).json({ error: 'Unauthorized — please provide your email or log in.' });
}

module.exports = { requireAuth, optionalAuth, requireAdmin, requireStudent };
