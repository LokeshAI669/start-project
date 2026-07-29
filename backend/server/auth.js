const { pool } = require('./db');

/**
 * Mock Auth Middleware: no JWT, reads 'x-mock-role' header
 */
async function requireAuth(req, res, next) {
  let role = req.headers['x-mock-role'];
  if (role !== 'admin') {
    role = 'student';
  }
  
  try {
    let { rows } = await pool.query('SELECT * FROM users WHERE role = $1 LIMIT 1', [role]);
    
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

module.exports = { requireAuth, requireAdmin, requireStudent };
