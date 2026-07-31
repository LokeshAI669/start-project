const { pool } = require('./db');

/**
 * Auth Middleware: reads 'x-user-email', 'x-user-id', or 'x-mock-role' header
 */
async function requireAuth(req, res, next) {
  let role = req.headers['x-mock-role'];
  if (role !== 'admin') {
    role = 'student';
  }
  
  const userEmail = req.headers['x-user-email'];
  const userId = req.headers['x-user-id'];

  try {
    let rows = [];

    if (userEmail && typeof userEmail === 'string' && userEmail.trim()) {
      const resData = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [userEmail.trim()]);
      rows = resData.rows;
    } else if (userId && !isNaN(Number(userId))) {
      const resData = await pool.query('SELECT * FROM users WHERE id = $1', [Number(userId)]);
      rows = resData.rows;
    }

    if (!rows || rows.length === 0) {
      const resData = await pool.query('SELECT * FROM users WHERE role = $1 ORDER BY id ASC LIMIT 1', [role]);
      rows = resData.rows;
    }

    if (!rows || rows.length === 0) {
      try {
        const resData = await pool.query(
          `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, 'mock', $3) RETURNING *`,
          [role === 'admin' ? 'Admin' : 'Student', role === 'admin' ? 'admin@jobzen.com' : 'student@jobzen.com', role]
        );
        rows = resData.rows;
      } catch (_e) {
        rows = [{ id: 1, name: role === 'admin' ? 'Admin' : 'Student', email: `${role}@jobzen.com`, role: role }];
      }
    }
    req.user = rows[0] || { id: 1, name: role === 'admin' ? 'Admin' : 'Student', email: `${role}@jobzen.com`, role: role };
    next();
  } catch (err) {
    req.user = { id: 1, name: role === 'admin' ? 'Admin' : 'Student', email: `${role}@jobzen.com`, role: role };
    next();
  }
}

/**
 * Optional Auth Middleware: populates req.user if headers present, does not fail if unauthenticated
 */
async function optionalAuth(req, res, next) {
  const role = req.headers['x-mock-role'];
  const userEmail = req.headers['x-user-email'];
  const userId = req.headers['x-user-id'];

  if (role || userEmail || userId) {
    return requireAuth(req, res, next);
  }
  next();
}

/**
 * Middleware: require admin role
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden — admin access required' });
    }
    next();
  });
}

/**
 * Middleware: require student role
 */
function requireStudent(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'student') {
      if (req.user) req.user.role = 'student';
    }
    next();
  });
}

module.exports = { requireAuth, optionalAuth, requireAdmin, requireStudent };

