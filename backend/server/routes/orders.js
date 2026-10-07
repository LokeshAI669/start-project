const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { pool } = require('../db');
const { optionalAuth, requireStudent } = require('../auth');
const payments = require('../services/payments');
const storage = require('../services/storage');
const mailer = require('../mailer');
const path = require('path');
const fs = require('fs');

// Rate limiting middleware for orders and downloads
const rateLimit = require('express-rate-limit');
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // max 30 order requests per 15 min per IP
  message: { error: 'Too many order requests, please try again later.' }
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 download attempts per 15 min
  message: { error: 'Too many download requests, please slow down.' }
});

// ── Validation Schemas ──────────────────────────────────────────
const createOrderSchema = z.object({
  projectId: z.number().int().positive(),
  buyerEmail: z.string().email(),
  buyerName: z.string().optional().default('Student'),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  buyerEmail: z.string().email().optional(),
  buyerName: z.string().optional(),
});

// ── POST /api/orders (Create Razorpay Order) ─────────────────────
router.post('/orders', orderLimiter, optionalAuth, async (req, res) => {
  try {
    const parseResult = createOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: parseResult.error.issues });
    }

    const { projectId, buyerEmail, buyerName } = parseResult.data;

    // 1. Fetch project from single source of truth in DB
    const { rows: pRows } = await pool.query(`
      SELECT id, title, price, is_premium, zip_storage_key, zip_url, zip_version, status, is_deleted
      FROM project_catalog
      WHERE id = $1 AND is_deleted = FALSE AND is_active = TRUE
    `, [projectId]);

    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Project not found or is no longer available' });
    }

    const project = pRows[0];
    if (!project.is_premium || Number(project.price) <= 0) {
      return res.status(400).json({ error: 'This project is free or does not require purchase.' });
    }

    const price = Number(project.price);
    const receiptId = `rcpt_${Date.now()}_${projectId}`;

    // 2. Create Razorpay order on server (server calculates price from DB)
    const razorpayOrder = await payments.createRazorpayOrder({
      amountInRupees: price,
      receipt: receiptId,
      notes: {
        projectId: String(project.id),
        projectTitle: project.title.slice(0, 40),
        buyerEmail,
      }
    });

    const userId = req.user?.id || null;

    // 3. Create or update pending purchase record
    await pool.query(`
      INSERT INTO purchases (
        user_id, user_email, user_name, project_id, amount, currency,
        razorpay_order_id, status, zip_version_purchased
      ) VALUES ($1, $2, $3, $4, $5, 'INR', $6, 'pending', $7)
      ON CONFLICT (razorpay_order_id) DO NOTHING
    `, [userId, buyerEmail.toLowerCase(), buyerName, project.id, price, razorpayOrder.id, project.zip_version || 1]);

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: payments.getKeyId(),
      project: {
        id: project.id,
        title: project.title,
        price,
      },
      buyer: {
        name: buyerName,
        email: buyerEmail,
      }
    });
  } catch (err) {
    console.error('[ORDERS] Create order error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize payment order' });
  }
});

// ── POST /api/payments/verify (Verify Signature & Complete Purchase) ─
router.post('/payments/verify', optionalAuth, async (req, res) => {
  try {
    const parseResult = verifyPaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid payment parameters', details: parseResult.error.issues });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;

    // 1. Verify HMAC SHA256 Signature
    const isValid = payments.verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // 2. Fetch purchase record
    const { rows: purchases } = await pool.query(`
      SELECT p.*, c.title as project_title, c.zip_version as current_zip_version
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE p.razorpay_order_id = $1
    `, [razorpay_order_id]);

    if (purchases.length === 0) {
      return res.status(404).json({ error: 'Purchase record not found for this order' });
    }

    const purchase = purchases[0];

    // Idempotent check: if already marked paid, return immediately
    if (purchase.status === 'paid') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        purchaseId: purchase.id,
        projectId: purchase.project_id,
      });
    }

    // 3. Update purchase to 'paid'
    const updated = await pool.query(`
      UPDATE purchases
      SET status = 'paid',
          razorpay_payment_id = $1,
          razorpay_signature = $2,
          zip_version_purchased = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [razorpay_payment_id, razorpay_signature, purchase.current_zip_version || 1, purchase.id]);

    // 4. Send Confirmation Email asynchronously
    mailer.purchaseConfirmation({
      buyerEmail: purchase.user_email,
      buyerName: purchase.user_name,
      projectTitle: purchase.project_title,
      amount: purchase.amount,
      paymentId: razorpay_payment_id,
      maxDownloads: purchase.max_downloads || 5,
    }).catch(err => console.error('[MAIL] Failed to send purchase confirmation email:', err));

    res.json({
      success: true,
      message: 'Payment successful! Access granted.',
      purchaseId: purchase.id,
      projectId: purchase.project_id,
      projectTitle: purchase.project_title,
      amount: purchase.amount,
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('[PAYMENTS] Verify error:', err);
    res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

// ── POST /api/payments/webhook (Razorpay Webhook for Idempotency) ────
router.post('/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = payments.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const payload = req.body.payload?.payment?.entity || req.body.payload?.order?.entity;
      const orderId = payload?.order_id || payload?.id;
      const paymentId = payload?.id;

      if (orderId) {
        await pool.query(`
          UPDATE purchases
          SET status = 'paid',
              razorpay_payment_id = COALESCE(razorpay_payment_id, $1),
              updated_at = NOW()
          WHERE razorpay_order_id = $2 AND status != 'paid'
        `, [paymentId, orderId]);
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('[PAYMENTS] Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ── GET /api/purchases/my-purchases (Buyer's purchases list) ────────
router.get('/purchases/my-purchases', requireStudent, async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    const { rows } = await pool.query(`
      SELECT 
        p.id, p.project_id, p.amount, p.currency, p.status,
        p.razorpay_payment_id, p.zip_version_purchased,
        p.download_count, p.max_downloads, p.created_at,
        c.title as project_title, c.domain, c.difficulty,
        c.zip_version as current_zip_version,
        c.zip_updated_at,
        (c.zip_version > p.zip_version_purchased) as is_updated
      FROM purchases p
      JOIN project_catalog c ON p.project_id = c.id
      WHERE LOWER(p.user_email) = LOWER($1) AND p.status = 'paid'
      ORDER BY p.created_at DESC
    `, [email]);

    res.json(rows);
  } catch (err) {
    console.error('[PURCHASES] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// ── GET /api/download/:projectId (Free Download for All Students) ──
router.get('/download/:projectId', downloadLimiter, requireStudent, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const userEmail = req.user?.email;
    const userId = req.user?.id || null;

    if (!projectId || !userEmail) {
      return res.status(400).json({ error: 'Invalid project ID or user session' });
    }

    // Fetch project details (no purchase check — all projects are free for students)
    const { rows: pRows } = await pool.query(`
      SELECT title, zip_storage_key, zip_url, zip_file_name, zip_version
      FROM project_catalog
      WHERE id = $1 AND is_deleted = FALSE AND is_active = TRUE
    `, [projectId]);

    if (pRows.length === 0) {
      return res.status(404).json({ error: 'Project not found or no longer available' });
    }

    const project = pRows[0];
    const storageKey = project.zip_storage_key || project.zip_url;

    if (!storageKey) {
      return res.status(404).json({ error: 'No downloadable ZIP file attached to this project' });
    }

    // Log download event (fire & forget)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    pool.query(`
      INSERT INTO download_logs (purchase_id, user_id, user_email, project_id, zip_version, ip_address, user_agent)
      VALUES (NULL, $1, $2, $3, $4, $5, $6)
    `, [userId, userEmail, projectId, project.zip_version || 1, String(ip).slice(0, 100), String(userAgent).slice(0, 255)])
    .catch(e => console.warn('[DOWNLOAD] log insert failed:', e.message));

    // Generate short-lived signed URL (5 minutes / 300s) or stream local file
    try {
      const { signedUrl, localFilePath } = await storage.getSignedDownloadUrl(storageKey, 300);

      if (signedUrl) {
        return res.json({
          downloadUrl: signedUrl,
          expiresIn: 300,
          zipVersion: project.zip_version
        });
      }

      if (localFilePath && fs.existsSync(localFilePath)) {
        res.setHeader('Content-Type', 'application/zip');
        const filename = project.zip_file_name || `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.download(localFilePath, filename);
      }
    } catch (storageErr) {
      // Fallback: check if static file exists in frontend/public/downloads
      const publicPath = path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'downloads', path.basename(storageKey));
      if (fs.existsSync(publicPath)) {
        res.setHeader('Content-Type', 'application/zip');
        const filename = path.basename(publicPath);
        return res.download(publicPath, filename);
      }
      throw storageErr;
    }

    return res.status(404).json({ error: 'Archive file could not be retrieved from storage' });
  } catch (err) {
    console.error('[DOWNLOAD] Error:', err);
    res.status(500).json({ error: err.message || 'Download generation failed' });
  }
});


// ── POST /api/orders/upi ─────────────────────────────────────────
// Student submits UTR after paying via PhonePe UPI.
// Creates a pending_verification purchase and notifies admin.
router.post('/orders/upi', orderLimiter, optionalAuth, async (req, res) => {
  try {
    const { projectId, buyerEmail, buyerName, utrId } = req.body;

    // Basic validation
    if (!projectId || !buyerEmail || !utrId) {
      return res.status(400).json({ error: 'projectId, buyerEmail and utrId are required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (utrId.trim().length < 8) {
      return res.status(400).json({ error: 'Please enter a valid UTR / Transaction ID.' });
    }

    // Fetch project & verify it's premium
    const { rows: projectRows } = await pool.query(
      'SELECT id, title, price, is_premium FROM project_catalog WHERE id = $1 AND is_deleted = FALSE',
      [Number(projectId)]
    );
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const project = projectRows[0];
    if (!project.is_premium) {
      return res.status(400).json({ error: 'This project is free — no payment required.' });
    }

    // Check for duplicate pending UTR for same project+email
    const { rows: existing } = await pool.query(
      `SELECT id FROM purchases
       WHERE user_email = LOWER($1) AND project_id = $2
         AND status NOT IN ('upi_rejected', 'refunded')`,
      [buyerEmail.trim().toLowerCase(), Number(projectId)]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'A purchase for this project already exists for your email. Check My Purchases or contact support.',
      });
    }

    const amount       = Number(project.price);
    const orderRef     = `UPI_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const userId       = req.user?.id || null;
    const cleanEmail   = buyerEmail.trim().toLowerCase();
    const cleanName    = (buyerName || 'Student').trim();

    // Insert pending purchase
    const { rows: insertRows } = await pool.query(`
      INSERT INTO purchases
        (user_id, user_email, user_name, project_id, amount, currency,
         razorpay_order_id, status, payment_method, utr_id, upi_status,
         zip_version_purchased, max_downloads, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, 'INR',
         $6, 'pending_verification', 'upi', $7, 'pending_verification',
         1, 5, NOW(), NOW())
      RETURNING id
    `, [userId, cleanEmail, cleanName, Number(projectId), amount, orderRef, utrId.trim()]);

    const purchaseId = insertRows[0].id;

    // Notify admin immediately (fire & forget)
    mailer.upiPaymentPending({
      buyerName:    cleanName,
      buyerEmail:   cleanEmail,
      projectTitle: project.title,
      amount,
      utrId:        utrId.trim(),
      orderId:      orderRef,
    }).catch(e => console.error('[MAIL] UPI pending email failed:', e.message));

    res.json({
      success: true,
      purchaseId,
      message: 'Payment submitted! Admin will verify your UTR and you will receive an email once approved.',
    });
  } catch (err) {
    console.error('[UPI ORDER] Error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit UPI payment' });
  }
});

module.exports = router;
