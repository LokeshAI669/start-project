const { pool } = require('./db');

/**
 * Mock Auth Middleware: no JWT, reads 'x-mock-role' header
 */
async function requireAuth(req, res, next) {
  const role = req.headers['x-mock-role'] || 'student';
  
  try {
    let { rows } = await pool.query('SELECT * FROM users WHERE role = $1 LIMIT 1', [role]);
    
    if (rows.length === 0) {
      if (role === 'student') {
        const resData = await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Mock Student', 'student@mock.com', 'mock', 'student') RETURNING *`);
        rows = resData.rows;
      } else if (role === 'admin') {
        const resData = await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES ('Mock Admin', 'admin@mock.com', 'mock', 'admin') RETURNING *`);
        rows = resData.rows;
      }
    }
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Mock Auth Error:', err);
    return res.status(500).json({ error: 'Internal Auth Error' });
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
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden — student access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireStudent };
