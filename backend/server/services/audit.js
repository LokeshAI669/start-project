const { pool } = require('../db');

/**
 * Record an audit log entry for admin actions
 * @param {Object} req - Express request
 * @param {Object} data
 * @param {string} data.action - Action name e.g. 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PREMIUM_TOGGLE', 'PRICE_CHANGE', 'ZIP_UPLOAD', 'ZIP_REMOVE', 'PROJECT_DELETE', 'STATUS_CHANGE'
 * @param {string} [data.entityType='project_catalog'] - Entity type
 * @param {number|string} [data.entityId] - Target entity ID
 * @param {Object} [data.oldValues] - State before mutation
 * @param {Object} [data.newValues] - State after mutation
 */
async function recordAuditLog(req, { action, entityType = 'project_catalog', entityId = null, oldValues = null, newValues = null }) {
  try {
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'admin';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await pool.query(`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId,
      userEmail,
      action,
      entityType,
      entityId ? Number(entityId) : null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      String(ip).slice(0, 100),
    ]);
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

module.exports = { recordAuditLog };
