const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAdmin } = require('../auth');
const payments = require('../services/payments');
const mailer = require('../mailer');

// All routes in this router require admin privileges
router.use(requireAdmin);

// ── Helper to write audit log entries ───────────────────────────
async function recordAuditLog(req, { action, entityType = 'order', entityId = null, oldValues = null, newValues = null }) {
  try {
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'admin';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await pool.query(`
      INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [userId, userEmail, action, entityType, entityId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, String(ip).slice(0, 100)]);
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

// ── GET /api/admin/orders (Sales & Orders Table) ──────────────────
router.get('/', async (req, res) => {
  try {
    const { status, q, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    let query = `
      SELECT 
        p.id, p.user_id, p.user_email, p.user_name, p.project_id,
        p.amount, p.currency, p.razorpay_order_id, p.razorpay_payment_id,
        p.status, p.zip_version_purchased, p.download_count, p.max_downloads,
        p.created_at, p.updated_at,
        c.title as project_title, c.domain as project_domain, c.price as catalog_price
      FROM purchases p
      LEFT JOIN project_catalog c ON p.project_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status.toLowerCase());
      query += ` AND LOWER(p.status) = $${params.length}`;
    }

    if (q && q.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      query += ` AND (
        LOWER(p.user_email) LIKE $${params.length} OR 
        LOWER(COALESCE(p.user_name, '')) LIKE $${params.length} OR 
        LOWER(COALESCE(c.title, '')) LIKE $${params.length} OR 
        LOWER(COALESCE(p.razorpay_payment_id, '')) LIKE $${params.length}
      )`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const { rows } = await pool.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM purchases p
      LEFT JOIN project_catalog c ON p.project_id = c.id
      WHERE 1=1
      ${status && status !== 'all' ? `AND LOWER(p.status) = '${status.toLowerCase()}'` : ''}
      ${q && q.trim() ? `AND (LOWER(p.user_email) LIKE '%${q.trim().toLowerCase()}%' OR LOWER(COALESCE(c.title, '')) LIKE '%${q.trim().toLowerCase()}%')` : ''}
    `;
    const { rows: countRows } = await pool.query(countQuery);
    const total = Number(countRows[0]?.total || 0);

    res.json({
      orders: rows,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('[ADMIN ORDERS] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch sales orders' });
  }
});

// ── GET /api/admin/orders/stats (Dashboard Cards) ─────────────────
router.get('/stats', async (req, res) => {
  try {
    // 1. Total Revenue
    const { rows: revRows } = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue, COUNT(*) as total_sales
      FROM purchases
      WHERE status = 'paid'
    `);

    const totalRevenue = Number(revRows[0]?.total_revenue || 0);
    const totalSales = Number(revRows[0]?.total_sales || 0);

    // 2. Top Selling Project
    const { rows: topRows } = await pool.query(`
      SELECT c.id, c.title, c.domain, COUNT(p.id) as sales_count, SUM(p.amount) as total_generated
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE p.status = 'paid'
      GROUP BY c.id, c.title, c.domain
      ORDER BY sales_count DESC
      LIMIT 1
    `);

    // 3. Unique buyers count
    const { rows: buyerRows } = await pool.query(`
      SELECT COUNT(DISTINCT user_email) as unique_buyers
      FROM purchases
      WHERE status = 'paid'
    `);

    // 4. Recent sales trend (last 7 days)
    const { rows: recentSales } = await pool.query(`
      SELECT DATE(created_at) as sale_date, COUNT(*) as count, SUM(amount) as revenue
      FROM purchases
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY sale_date ASC
    `);

    res.json({
      totalRevenue,
      totalSales,
      avgOrderValue: totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0,
      uniqueBuyers: Number(buyerRows[0]?.unique_buyers || 0),
      topProject: topRows[0] || null,
      recentSales,
    });
  } catch (err) {
    console.error('[ADMIN STATS] Error:', err);
    res.status(500).json({ error: 'Failed to calculate sales statistics' });
  }
});

// ── POST /api/admin/orders/:id/resend-email ───────────────────────
router.post('/:id/resend-email', async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { rows } = await pool.query(`
      SELECT p.*, c.title as project_title
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE p.id = $1
    `, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];
    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Cannot resend download email for an unpaid order' });
    }

    await mailer.purchaseConfirmation({
      buyerEmail: order.user_email,
      buyerName: order.user_name,
      projectTitle: order.project_title,
      amount: order.amount,
      paymentId: order.razorpay_payment_id || order.razorpay_order_id,
      maxDownloads: order.max_downloads,
    });

    await recordAuditLog(req, {
      action: 'RESEND_DOWNLOAD_EMAIL',
      entityId: order.id,
      newValues: { sentTo: order.user_email, project: order.project_title }
    });

    res.json({ success: true, message: `Download email resent to ${order.user_email}` });
  } catch (err) {
    console.error('[RESEND EMAIL] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to resend confirmation email' });
  }
});

// ── POST /api/admin/orders/:id/refund ─────────────────────────────
router.post('/:id/refund', async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { rows } = await pool.query(`
      SELECT p.*, c.title as project_title
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE p.id = $1
    `, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];
    if (order.status === 'refunded') {
      return res.status(400).json({ error: 'Order has already been refunded' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Only paid orders can be refunded' });
    }

    // Process refund via Razorpay if payment ID exists
    let refundResult = null;
    if (order.razorpay_payment_id && payments.isRazorpayConfigured()) {
      try {
        refundResult = await payments.refundPayment(order.razorpay_payment_id, order.amount);
      } catch (refundErr) {
        console.error('[RAZORPAY REFUND ERROR]', refundErr);
        return res.status(500).json({ error: `Razorpay refund failed: ${refundErr.message}` });
      }
    }

    // Update purchase record to 'refunded'
    await pool.query(`
      UPDATE purchases
      SET status = 'refunded', updated_at = NOW()
      WHERE id = $1
    `, [orderId]);

    // Send refund email to buyer
    mailer.purchaseRefunded({
      buyerEmail: order.user_email,
      buyerName: order.user_name,
      projectTitle: order.project_title,
      amount: order.amount,
      paymentId: order.razorpay_payment_id || order.razorpay_order_id,
    }).catch(err => console.error('[MAIL] Failed to send refund email:', err));

    await recordAuditLog(req, {
      action: 'ORDER_REFUNDED',
      entityId: order.id,
      oldValues: { status: 'paid', amount: order.amount },
      newValues: { status: 'refunded', refundDetails: refundResult }
    });

    res.json({
      success: true,
      message: 'Order refunded successfully and buyer notified',
      refundResult
    });
  } catch (err) {
    console.error('[ADMIN REFUND] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to process refund' });
  }
});

// ── GET /api/admin/audit-logs ─────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const { rows } = await pool.query(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT $1
    `, [Math.min(100, Number(limit))]);

    res.json(rows);
  } catch (err) {
    console.error('[AUDIT LOGS] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ── GET /api/admin/orders/upi-pending ─────────────────────────────
// Returns all UPI orders awaiting admin verification
router.get('/upi-pending', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.user_email, p.user_name, p.amount, p.currency,
        p.utr_id, p.upi_status, p.status, p.payment_method,
        p.created_at, p.razorpay_order_id as order_ref,
        c.title as project_title, c.id as project_id
      FROM purchases p
      LEFT JOIN project_catalog c ON p.project_id = c.id
      WHERE p.payment_method = 'upi'
        AND p.upi_status = 'pending_verification'
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[UPI PENDING] Error:', err);
    res.status(500).json({ error: 'Failed to fetch pending UPI orders' });
  }
});

// ── PATCH /api/admin/orders/:id/verify-upi ────────────────────────
// Admin approves or rejects a UPI payment
router.patch('/:id/verify-upi', async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    const { rows } = await pool.query(`
      SELECT p.*, c.title as project_title
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE p.id = $1 AND p.payment_method = 'upi'
    `, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'UPI order not found' });
    }

    const order = rows[0];

    if (order.upi_status !== 'pending_verification') {
      return res.status(400).json({ error: `Order is already ${order.upi_status}` });
    }

    const newStatus     = action === 'approve' ? 'paid'     : 'upi_rejected';
    const newUpiStatus  = action === 'approve' ? 'verified' : 'rejected';

    await pool.query(`
      UPDATE purchases
      SET status = $1, upi_status = $2, updated_at = NOW()
      WHERE id = $3
    `, [newStatus, newUpiStatus, orderId]);

    // Send email to student
    if (action === 'approve') {
      mailer.upiPaymentApproved({
        buyerEmail:   order.user_email,
        buyerName:    order.user_name || 'Student',
        projectTitle: order.project_title,
        amount:       order.amount,
        utrId:        order.utr_id,
      }).catch(e => console.error('[MAIL] UPI approved email failed:', e.message));
    } else {
      mailer.upiPaymentRejected({
        buyerEmail:   order.user_email,
        buyerName:    order.user_name || 'Student',
        projectTitle: order.project_title,
        amount:       order.amount,
        reason:       reason || '',
      }).catch(e => console.error('[MAIL] UPI rejected email failed:', e.message));
    }

    await recordAuditLog(req, {
      action: action === 'approve' ? 'UPI_PAYMENT_APPROVED' : 'UPI_PAYMENT_REJECTED',
      entityId: orderId,
      oldValues: { status: 'pending_verification', upiStatus: 'pending_verification' },
      newValues: { status: newStatus, upiStatus: newUpiStatus, reason: reason || null },
    });

    res.json({
      success: true,
      message: action === 'approve'
        ? `Payment approved — student notified at ${order.user_email}`
        : `Payment rejected — student notified at ${order.user_email}`,
    });
  } catch (err) {
    console.error('[UPI VERIFY] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify UPI payment' });
  }
});

module.exports = router;
