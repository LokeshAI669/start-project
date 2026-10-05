const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// ── Zip file upload storage for catalog deliverables ────────────────────────
const zipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + sanitized);
  }
});

const uploadZip = multer({
  storage: zipStorage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip' || file.mimetype.includes('zip') || file.mimetype.includes('octet-stream')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed.'));
    }
  }
});

// POST /api/catalog/upload-zip (Admin only)
router.post('/upload-zip', requireAdmin, (req, res) => {
  uploadZip.single('zip_file')(req, res, (err) => {
    if (err) {
      console.error('[CATALOG] zip upload error:', err);
      return res.status(400).json({ error: err.message || 'Zip upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No zip file provided' });
    }
    const zipUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Zip file uploaded successfully',
      zip_url: zipUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

// GET /api/catalog/domains
router.get('/domains', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT domain, COUNT(*) as count 
      FROM project_catalog 
      WHERE is_active = TRUE 
      GROUP BY domain 
      ORDER BY domain ASC
    `);
    res.json(rows.map(r => ({ domain: r.domain, count: Number(r.count) })));
  } catch (err) {
    console.error('[CATALOG] domains error:', err);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// GET /api/catalog
router.get('/', async (req, res) => {
  try {
    const { domain, search, page = 1, limit = 20 } = req.query;

    const params = [];
    let where = `WHERE is_active = TRUE`;

    if (domain) {
      params.push(domain);
      where += ` AND domain = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND title ILIKE $${params.length}`;
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Single query: COUNT(*) OVER() avoids a second round-trip to the DB
    params.push(Number(limit));
    params.push(offset);
    const { rows } = await pool.query(`
      SELECT *, COUNT(*) OVER() AS _total_count
      FROM project_catalog
      ${where}
      ORDER BY title ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const totalCount = rows.length > 0 ? Number(rows[0]._total_count) : 0;
    // Strip the internal _total_count field before sending
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

// GET /api/catalog/stats (Admin analytics)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { rows: activeRows } = await pool.query(`SELECT COUNT(*) FROM project_catalog WHERE is_active = TRUE`);
    
    const { rows: domainRows } = await pool.query(`
      SELECT pc.domain, COUNT(p.id) as request_count
      FROM projects p
      JOIN project_catalog pc ON p.catalog_project_id = pc.id
      GROUP BY pc.domain
      ORDER BY request_count DESC
      LIMIT 1
    `);
    
    res.json({
      totalActive: Number(activeRows[0].count),
      topDomain: domainRows.length > 0 ? domainRows[0].domain : null
    });
  } catch (err) {
    console.error('[CATALOG] stats error:', err);
    res.status(500).json({ error: 'Failed to fetch catalog stats' });
  }
});

// GET /api/catalog/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`
      SELECT * FROM project_catalog
      WHERE id = $1 AND is_active = TRUE
    `, [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error('[CATALOG] get one error:', err);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// GET /api/catalog/:id/download
router.get('/:id/download', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT title, zip_url FROM project_catalog WHERE id = $1', [id]);
    if (rows.length === 0 || !rows[0].zip_url) {
      return res.status(404).json({ error: 'No downloadable zip file available for this project' });
    }
    const zipUrl = rows[0].zip_url;
    if (zipUrl.startsWith('/uploads/')) {
      const fileName = path.basename(zipUrl);
      const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, fileName);
      }
    }
    return res.redirect(zipUrl);
  } catch (err) {
    console.error('[CATALOG] download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// POST /api/catalog (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { 
      title, domain, short_description, difficulty, 
      full_description, tech_stack, estimated_duration, objectives, prerequisites,
      github_url, zip_url
    } = req.body;
    
    if (!title || !domain) {
      return res.status(400).json({ error: 'Title and domain are required' });
    }
    
    const { rows } = await pool.query(`
      INSERT INTO project_catalog (
        title, domain, short_description, difficulty, 
        full_description, tech_stack, estimated_duration, objectives, prerequisites,
        github_url, zip_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      title, domain, short_description || null, difficulty || 'Intermediate',
      full_description || null, tech_stack || null, estimated_duration || null,
      objectives || null, prerequisites || null,
      github_url || null, zip_url || null
    ]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[CATALOG] create error:', err);
    res.status(500).json({ error: 'Failed to add project to catalog' });
  }
});

// PUT /api/catalog/:id (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { 
      title, domain, short_description, difficulty, is_active,
      full_description, tech_stack, estimated_duration, objectives, prerequisites,
      github_url, zip_url
    } = req.body;
    
    const { rows } = await pool.query(`
      UPDATE project_catalog
      SET title = COALESCE($1, title),
          domain = COALESCE($2, domain),
          short_description = COALESCE($3, short_description),
          difficulty = COALESCE($4, difficulty),
          is_active = COALESCE($5, is_active),
          full_description = COALESCE($6, full_description),
          tech_stack = COALESCE($7, tech_stack),
          estimated_duration = COALESCE($8, estimated_duration),
          objectives = COALESCE($9, objectives),
          prerequisites = COALESCE($10, prerequisites),
          github_url = COALESCE($11, github_url),
          zip_url = COALESCE($12, zip_url)
      WHERE id = $13
      RETURNING *
    `, [
      title, domain, short_description, difficulty, is_active,
      full_description, tech_stack, estimated_duration, objectives, prerequisites,
      github_url, zip_url,
      id
    ]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Catalog project not found' });
    
    res.json(rows[0]);
  } catch (err) {
    console.error('[CATALOG] update error:', err);
    res.status(500).json({ error: 'Failed to update catalog project' });
  }
});

// DELETE /api/catalog/:id (Admin only - sets is_active = false)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`
      UPDATE project_catalog SET is_active = FALSE WHERE id = $1 RETURNING *
    `, [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Catalog project not found' });
    
    res.json({ message: 'Project deactivated' });
  } catch (err) {
    console.error('[CATALOG] delete error:', err);
    res.status(500).json({ error: 'Failed to deactivate project' });
  }
});

// POST /api/catalog/bulk-import (Admin only)
router.post('/bulk-import', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Expected an array of projects.' });
    }
    
    await client.query('BEGIN');
    
    let count = 0;
    for (const item of items) {
      const { 
        title, domain, short_description, difficulty,
        full_description, tech_stack, estimated_duration, objectives, prerequisites,
        github_url, zip_url
      } = item;
      
      if (title && domain) {
        // If objectives is provided as a comma-separated string from CSV, convert it to array
        let objs = objectives;
        if (typeof objs === 'string') {
          objs = objs.split('|').map(s => s.trim()).filter(Boolean); // or parse JSON
        }
        
        await client.query(`
          INSERT INTO project_catalog (
            title, domain, short_description, difficulty,
            full_description, tech_stack, estimated_duration, objectives, prerequisites,
            github_url, zip_url
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          title, domain, short_description || null, difficulty || 'Intermediate',
          full_description || null, tech_stack || null, estimated_duration || null,
          Array.isArray(objs) ? objs : null, prerequisites || null,
          github_url || null, zip_url || null
        ]);
        count++;
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: `Successfully imported ${count} projects` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[CATALOG] bulk import error:', err);
    res.status(500).json({ error: 'Bulk import failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
