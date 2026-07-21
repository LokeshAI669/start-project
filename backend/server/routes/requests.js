const express          = require('express');
const { pool }         = require('../db');
const { requireAuth, requireStudent, requireAdmin } = require('../auth');
const mailer           = require('../mailer');
const multer           = require('multer');
const path             = require('path');
const { Parser }       = require('json2csv');

const router = express.Router();

// ── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ── Helper: format row timestamps ────────────────────────────────────────────
function fmt(p) {
  return {
    ...p,
    budget: Number(p.budget),
    created_at: new Date(p.created_at).toISOString(),
    updated_at: new Date(p.updated_at).toISOString(),
  };
}

// ══ STUDENT ROUTES ══════════════════════════════════════════════════════════

// GET /api/requests/mine
router.get('/mine', requireStudent, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(rows.map(fmt));
  } catch (err) {
    console.error('[REQUESTS] mine error:', err);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

// POST /api/requests
router.post('/', requireStudent, upload.single('attachment'), async (req, res) => {
  try {
    const { project_name, budget, currency, description, preferred_date, preferred_time } = req.body;

    if (!project_name || !budget || !description || !preferred_date || !preferred_time)
      return res.status(400).json({ error: 'All fields are required' });
    if (isNaN(Number(budget)) || Number(budget) <= 0)
      return res.status(400).json({ error: 'Budget must be a positive number' });

    const attachmentUrl = req.file ? '/uploads/' + req.file.filename : null;

    const { rows } = await pool.query(`
      INSERT INTO projects
        (student_id, project_name, budget, currency, description, preferred_date, preferred_time, status, attachment_url, catalog_project_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8, $9)
      RETURNING *
    `, [
      req.user.id, 
      project_name.trim(), 
      Number(budget), 
      currency || '₦',
      description.trim(), 
      preferred_date, 
      preferred_time,
      attachmentUrl,
      req.body.catalog_project_id ? Number(req.body.catalog_project_id) : null
    ]);

    const project = rows[0];
    const { rows: studentRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const student = studentRows[0];

    await mailer.requestSubmitted(student, project).catch(e => console.error(e));
    await mailer.notifyAdmin(student, project).catch(e => console.error(e));

    if (req.io) req.io.emit('new_request', fmt(project));

    res.status(201).json(fmt(project));
  } catch (err) {
    console.error('[REQUESTS] create error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// PATCH /api/requests/:id/reschedule
router.patch('/:id/reschedule', requireStudent, async (req, res) => {
  try {
    const { preferred_date, preferred_time } = req.body;
    const id = Number(req.params.id);

    if (!preferred_date || !preferred_time)
      return res.status(400).json({ error: 'New date and time required' });

    const { rows: projectRows } = await pool.query('SELECT * FROM projects WHERE id = $1 AND student_id = $2', [id, req.user.id]);
    const project = projectRows[0];
    
    if (!project) return res.status(404).json({ error: 'Request not found' });
    if (project.status !== 'Denied')
      return res.status(400).json({ error: 'Only denied requests can be rescheduled' });

    const { rows: updatedRows } = await pool.query(`
      UPDATE projects
      SET preferred_date = $1, preferred_time = $2, status = 'Pending',
          admin_note = NULL, confirmed_date = NULL, confirmed_time = NULL, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [preferred_date, preferred_time, id]);

    const updated = updatedRows[0];
    const { rows: studentRows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const student = studentRows[0];
    
    await mailer.notifyAdminReschedule(student, updated).catch(e => console.error(e));
    
    if (req.io) req.io.emit('request_updated', fmt(updated));

    res.json(fmt(updated));
  } catch (err) {
    console.error('[REQUESTS] reschedule error:', err);
    res.status(500).json({ error: 'Failed to reschedule' });
  }
});

// ══ ADMIN ROUTES ══════════════════════════════════════════════════════════════

// GET /api/requests/export
router.get('/export', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.project_name, p.status, p.budget, p.currency, p.created_at,
             u.name as student_name, u.email as student_email
      FROM projects p JOIN users u ON p.student_id = u.id
      ORDER BY p.created_at DESC
    `);
    const fields = ['id', 'project_name', 'student_name', 'student_email', 'status', 'budget', 'currency', 'created_at'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(rows);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('jobzen-projects.csv');
    res.send(csv);
  } catch (err) {
    console.error('[REQUESTS] export error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/requests/all
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    let queryStr = `
      SELECT p.*, u.name as student_name, u.email as student_email
      FROM projects p JOIN users u ON p.student_id = u.id
      ORDER BY p.created_at DESC
    `;
    
    const { rows } = await pool.query(queryStr);
    let filteredRows = rows;

    if (status && status !== 'All')
      filteredRows = filteredRows.filter(r => r.status === status);
    if (search) {
      const q = search.toLowerCase();
      filteredRows = filteredRows.filter(r =>
        r.student_name.toLowerCase().includes(q) ||
        r.student_email.toLowerCase().includes(q) ||
        r.project_name.toLowerCase().includes(q)
      );
    }

    res.json(filteredRows.map(fmt));
  } catch (err) {
    console.error('[REQUESTS] all error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET /api/requests/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { rows: all } = await pool.query('SELECT status FROM projects');
    const { rows: students } = await pool.query("SELECT COUNT(*) AS c FROM users WHERE role = 'student'");

    res.json({
      total:    all.length,
      pending:  all.filter(r => r.status === 'Pending').length,
      accepted: all.filter(r => r.status === 'Accepted').length,
      denied:   all.filter(r => r.status === 'Denied').length,
      students: students.length > 0 ? parseInt(students[0].c, 10) : 0,
    });
  } catch (err) {
    console.error('[REQUESTS] stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// PATCH /api/requests/:id/decision
router.patch('/:id/decision', requireAdmin, async (req, res) => {
  try {
    const { decision, admin_note, confirmed_date, confirmed_time } = req.body;
    const id = Number(req.params.id);

    if (!['accepted', 'denied'].includes(decision))
      return res.status(400).json({ error: 'decision must be "accepted" or "denied"' });

    const { rows: projectRows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = projectRows[0];
    if (!project) return res.status(404).json({ error: 'Request not found' });

    let updatedRows;
    if (decision === 'accepted') {
      const confDate = confirmed_date || project.preferred_date;
      const confTime = confirmed_time || project.preferred_time;
      const resData = await pool.query(`
        UPDATE projects
        SET status = 'Accepted', admin_note = $1, confirmed_date = $2, confirmed_time = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `, [admin_note || null, confDate, confTime, id]);
      updatedRows = resData.rows;
    } else {
      const resData = await pool.query(`
        UPDATE projects SET status = 'Denied', admin_note = $1, updated_at = NOW() WHERE id = $2
        RETURNING *
      `, [admin_note || null, id]);
      updatedRows = resData.rows;
    }

    const updated = updatedRows[0];
    const { rows: studentRows } = await pool.query('SELECT * FROM users WHERE id = $1', [project.student_id]);
    const student = studentRows[0];

    if (decision === 'accepted') await mailer.requestAccepted(student, updated).catch(e => console.error(e));
    else                         await mailer.requestDenied(student, updated).catch(e => console.error(e));

    if (req.io) req.io.emit('request_updated', fmt(updated));

    res.json(fmt(updated));
  } catch (err) {
    console.error('[REQUESTS] decision error:', err);
    res.status(500).json({ error: 'Failed to process decision' });
  }
});

// ══ CHAT ROUTES ══════════════════════════════════════════════════════════════

// Middleware to verify access to a specific project
async function checkProjectAccess(req, res, next) {
  const id = Number(req.params.id);
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const p = rows[0];
  if (req.user.role !== 'admin' && p.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.project = p;
  next();
}

// GET /api/requests/:id/messages
router.get('/:id/messages', requireAuth, checkProjectAccess, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role 
      FROM messages m JOIN users u ON m.sender_id = u.id 
      WHERE m.project_id = $1 ORDER BY m.created_at ASC
    `, [req.project.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/requests/:id/messages
router.post('/:id/messages', requireAuth, checkProjectAccess, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Empty message' });

    const { rows } = await pool.query(`
      INSERT INTO messages (project_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *
    `, [req.project.id, req.user.id, content.trim()]);
    
    const msg = rows[0];
    
    // Fetch sender info to broadcast
    const { rows: uRows } = await pool.query('SELECT name as sender_name, role as sender_role FROM users WHERE id = $1', [req.user.id]);
    const broadcastMsg = { ...msg, ...uRows[0] };
    
    if (req.io) req.io.emit('new_message', broadcastMsg);

    res.status(201).json(broadcastMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
