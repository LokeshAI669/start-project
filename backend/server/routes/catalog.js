const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { z } = require('zod');
const { pool } = require('../db');
const { requireAdmin, optionalAuth } = require('../auth');
const storage = require('../services/storage');
const { recordAuditLog } = require('../services/audit');

const router = express.Router();

// ── Zip file upload handling (Max 200MB, .zip only, stored in memory for cloud/storage upload) ──
const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const isZip = ext === '.zip' || mime.includes('zip') || mime.includes('octet-stream') || mime.includes('compressed');
    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type: Only .zip archives are allowed.'));
    }
  }
});

// ── Zod Validation Schemas ──────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  domain: z.string().min(1, 'Domain is required').max(100),
  short_description: z.string().optional().nullable(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  full_description: z.string().optional().nullable(),
  tech_stack: z.string().optional().nullable(),
  estimated_duration: z.string().optional().nullable(),
  objectives: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  prerequisites: z.string().optional().nullable(),
  github_url: z.string().optional().nullable(),
  zip_url: z.string().optional().nullable(),
  zip_storage_key: z.string().optional().nullable(),
  zip_file_name: z.string().optional().nullable(),
  zip_file_size: z.union([z.number(), z.string()]).optional().nullable(),
  zip_version: z.number().int().default(1),
  is_premium: z.boolean().default(false),
  price: z.union([z.number(), z.string()]).transform(v => Number(v) || 0),
  status: z.enum(['draft', 'published', 'hidden']).default('published'),
  is_active: z.boolean().default(true),
}).refine(data => {
  if (data.is_premium && data.price <= 0) {
    return false;
  }
  return true;
}, {
  message: 'Price must be greater than ₹0 for Premium projects.',
  path: ['price'],
});

// ── POST /api/catalog/upload-zip (Admin only - Private Storage) ─
router.post('/upload-zip', requireAdmin, (req, res) => {
  uploadZip.single('zip_file')(req, res, async (err) => {
    if (err) {
      console.error('[CATALOG] zip upload error:', err);
      return res.status(400).json({ error: err.message || 'ZIP upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No ZIP file provided' });
    }

    try {
      const projectId = req.body.projectId ? Number(req.body.projectId) : 'temp';
      let oldStorageKey = null;
      let currentVersion = 1;

      // If updating an existing project, check for existing zip to replace
      if (projectId !== 'temp') {
        const { rows } = await pool.query(
          'SELECT zip_storage_key, zip_version FROM project_catalog WHERE id = $1',
          [projectId]
        );
        if (rows.length > 0) {
          oldStorageKey = rows[0].zip_storage_key;
          currentVersion = Number(rows[0].zip_version || 1);
        }
      }

      // Upload to private storage (Supabase private bucket or protected storage)
      const uploadResult = await storage.uploadProjectZip({
        projectId,
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype || 'application/zip',
      });

      // If replacing an old file, delete the previous storage object
      if (oldStorageKey && oldStorageKey !== uploadResult.storageKey) {
        await storage.deleteProjectZip(oldStorageKey).catch(e => console.warn('[STORAGE] Old zip delete error:', e));
      }

      const newVersion = currentVersion + (oldStorageKey ? 1 : 0);

      // If projectId exists in DB, update record immediately
      if (projectId !== 'temp') {
        await pool.query(`
          UPDATE project_catalog
          SET zip_storage_key = $1,
              zip_file_name = $2,
              zip_file_size = $3,
              zip_version = $4,
              zip_updated_at = NOW(),
              updated_at = NOW()
          WHERE id = $5
        `, [uploadResult.storageKey, uploadResult.filename, uploadResult.size, newVersion, projectId]);

        await recordAuditLog(req, {
          action: oldStorageKey ? 'ZIP_REPLACED' : 'ZIP_UPLOADED',
          entityId: projectId,
          newValues: {
            filename: uploadResult.filename,
            size: uploadResult.size,
            version: newVersion,
            storageKey: uploadResult.storageKey
          }
        });
      }

      res.json({
        message: 'ZIP file uploaded and secured in private storage successfully',
        storageKey: uploadResult.storageKey,
        filename: uploadResult.filename,
        size: uploadResult.size,
        version: newVersion,
        isSupabase: uploadResult.isSupabase,
      });
    } catch (uploadErr) {
      console.error('[STORAGE] Upload processing error:', uploadErr);
      res.status(500).json({ error: uploadErr.message || 'Failed to process and secure ZIP archive' });
    }
  });
});

// ── DELETE /api/catalog/:id/remove-zip (Admin only) ─────────────
router.delete('/:id/remove-zip', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT zip_storage_key, zip_file_name FROM project_catalog WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const currentKey = rows[0].zip_storage_key;
    if (currentKey) {
      await storage.deleteProjectZip(currentKey).catch(e => console.warn('[STORAGE] Delete warning:', e));
    }

    await pool.query(`
      UPDATE project_catalog
      SET zip_storage_key = NULL,
          zip_file_name = NULL,
          zip_file_size = 0,
          zip_url = NULL,
          updated_at = NOW()
      WHERE id = $1
    `, [id]);

    await recordAuditLog(req, {
      action: 'ZIP_REMOVED',
      entityId: id,
      oldValues: { filename: rows[0].zip_file_name, storageKey: currentKey }
    });

    res.json({ success: true, message: 'ZIP archive removed from storage' });
  } catch (err) {
    console.error('[CATALOG] Remove ZIP error:', err);
    res.status(500).json({ error: 'Failed to remove ZIP archive' });
  }
});

// ── GET /api/catalog/domains ────────────────────────────────────
router.get('/domains', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT domain, COUNT(*) as count 
      FROM project_catalog 
      WHERE is_active = TRUE AND is_deleted = FALSE AND status = 'published'
      GROUP BY domain 
      ORDER BY domain ASC
    `);
    res.json(rows.map(r => ({ domain: r.domain, count: Number(r.count) })));
  } catch (err) {
    console.error('[CATALOG] domains error:', err);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// ── GET /api/catalog (Public + Admin Catalog List) ───────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { domain, search, premium, status, page = 1, limit = 100 } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    const params = [];
    let where = `WHERE is_deleted = FALSE`;

    // Public / Student view: ONLY active, published projects
    if (!isAdmin) {
      where += ` AND is_active = TRUE AND status = 'published'`;
    } else if (status && status !== 'all') {
      params.push(status.toLowerCase());
      where += ` AND status = $${params.length}`;
    }

    if (domain && domain !== 'All Domains' && domain !== 'All') {
      params.push(domain);
      where += ` AND domain = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      where += ` AND title ILIKE $${params.length}`;
    }

    if (premium === 'true' || premium === 'Premium') {
      where += ` AND is_premium = TRUE`;
    } else if (premium === 'false' || premium === 'Free') {
      where += ` AND (is_premium = FALSE OR is_premium IS NULL)`;
    }

    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit));
    params.push(offset);

    const { rows } = await pool.query(`
      SELECT 
        id, title, domain, short_description, difficulty, 
        is_active, full_description, tech_stack, estimated_duration, 
        objectives, prerequisites, github_url, zip_url,
        is_premium, price, zip_storage_key, zip_file_name, zip_file_size,
        zip_version, zip_updated_at, status, is_deleted, created_at, updated_at,
        COUNT(*) OVER() AS _total_count
      FROM project_catalog
      ${where}
      ORDER BY id ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const totalCount = rows.length > 0 ? Number(rows[0]._total_count) : 0;
    const data = rows.map(({ _total_count, ...r }) => r);

    res.json({
      data,
      total: totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit))
    });
  } catch (err) {
    console.error('[CATALOG] get all error:', err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// ── GET /api/catalog/:id ─────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isAdmin = req.user && req.user.role === 'admin';

    let query = 'SELECT * FROM project_catalog WHERE id = $1 AND is_deleted = FALSE';
    if (!isAdmin) {
      query += " AND is_active = TRUE AND status = 'published'";
    }

    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    res.json(rows[0]);
  } catch (err) {
    console.error('[CATALOG] get one error:', err);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// ── POST /api/catalog (Admin only - Add Project) ─────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid project data', details: parseResult.error.issues });
    }

    const d = parseResult.data;
    let objs = d.objectives;
    if (typeof objs === 'string') {
      objs = objs.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const { rows } = await pool.query(`
      INSERT INTO project_catalog (
        title, domain, short_description, difficulty, 
        full_description, tech_stack, estimated_duration, objectives, prerequisites,
        github_url, zip_url, zip_storage_key, zip_file_name, zip_file_size, zip_version,
        is_premium, price, status, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      d.title, d.domain, d.short_description || null, d.difficulty,
      d.full_description || null, d.tech_stack || null, d.estimated_duration || null,
      objs || null, d.prerequisites || null,
      d.github_url || null, d.zip_url || null,
      d.zip_storage_key || null, d.zip_file_name || null, d.zip_file_size || 0, d.zip_version || 1,
      d.is_premium || false, d.price || 0, d.status || 'published', d.is_active !== false
    ]);

    const created = rows[0];

    await recordAuditLog(req, {
      action: 'PROJECT_CREATED',
      entityId: created.id,
      newValues: {
        title: created.title,
        domain: created.domain,
        is_premium: created.is_premium,
        price: created.price,
        status: created.status
      }
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('[CATALOG] create error:', err);
    res.status(500).json({ error: err.message || 'Failed to add project to catalog' });
  }
});

// ── PUT /api/catalog/:id (Admin only - Edit / Replace Project) ────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Fetch old record for audit logging
    const { rows: oldRows } = await pool.query('SELECT * FROM project_catalog WHERE id = $1', [id]);
    if (oldRows.length === 0) return res.status(404).json({ error: 'Catalog project not found' });
    const old = oldRows[0];

    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid project data', details: parseResult.error.issues });
    }

    const d = parseResult.data;
    let objs = d.objectives;
    if (typeof objs === 'string') {
      objs = objs.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const { rows } = await pool.query(`
      UPDATE project_catalog
      SET title = $1,
          domain = $2,
          short_description = $3,
          difficulty = $4,
          is_active = $5,
          full_description = $6,
          tech_stack = $7,
          estimated_duration = $8,
          objectives = $9,
          prerequisites = $10,
          github_url = $11,
          zip_url = $12,
          zip_storage_key = COALESCE($13, zip_storage_key),
          zip_file_name = COALESCE($14, zip_file_name),
          zip_file_size = COALESCE($15, zip_file_size),
          is_premium = $16,
          price = $17,
          status = $18,
          updated_at = NOW()
      WHERE id = $19
      RETURNING *
    `, [
      d.title, d.domain, d.short_description, d.difficulty, d.is_active,
      d.full_description, d.tech_stack, d.estimated_duration, objs, d.prerequisites,
      d.github_url, d.zip_url,
      d.zip_storage_key, d.zip_file_name, d.zip_file_size,
      d.is_premium, d.price, d.status,
      id
    ]);

    const updated = rows[0];

    // Audit logs for specific sensitive changes
    const changes = [];
    if (old.price !== updated.price) changes.push(`PRICE_CHANGE: ₹${old.price} -> ₹${updated.price}`);
    if (old.is_premium !== updated.is_premium) changes.push(`PREMIUM_TOGGLED: ${updated.is_premium ? 'ON' : 'OFF'}`);
    if (old.status !== updated.status) changes.push(`STATUS_CHANGE: ${old.status} -> ${updated.status}`);

    await recordAuditLog(req, {
      action: changes.length > 0 ? changes.join('; ') : 'PROJECT_UPDATED',
      entityId: id,
      oldValues: { title: old.title, price: old.price, is_premium: old.is_premium, status: old.status },
      newValues: { title: updated.title, price: updated.price, is_premium: updated.is_premium, status: updated.status }
    });

    res.json(updated);
  } catch (err) {
    console.error('[CATALOG] update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update catalog project' });
  }
});

// ── DELETE /api/catalog/:id (Admin only - Soft Delete with Purchase Safeguard) ─
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Check if this project has any paid purchases
    const { rows: purchaseRows } = await pool.query(`
      SELECT COUNT(*) as count FROM purchases WHERE project_id = $1 AND status = 'paid'
    `, [id]);
    const paidPurchasesCount = Number(purchaseRows[0]?.count || 0);

    // 2. Perform soft delete to preserve purchases for buyers
    const { rows } = await pool.query(`
      UPDATE project_catalog
      SET is_deleted = TRUE, is_active = FALSE, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Catalog project not found' });

    await recordAuditLog(req, {
      action: 'PROJECT_DELETED',
      entityId: id,
      oldValues: { title: rows[0].title, paidPurchases: paidPurchasesCount },
      newValues: { is_deleted: true, is_active: false }
    });

    res.json({
      message: paidPurchasesCount > 0
        ? 'Project soft-deleted (retained in buyer records for download access)'
        : 'Project deactivated and removed from catalog'
    });
  } catch (err) {
    console.error('[CATALOG] delete error:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
