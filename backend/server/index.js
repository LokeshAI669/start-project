require('dotenv').config();

const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const { initDB } = require('./db');

const http = require('http');
const { Server } = require('socket.io');

async function start() {
  await initDB();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected:', socket.id);
  });

  // Attach io to req object so routes can broadcast
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // ── API Routes ──────────────────────────────────────────────
  app.use('/api', require('./routes/auth'));
  app.use('/api/requests', require('./routes/requests'));
  app.use('/api/catalog', require('./routes/catalog'));

  // ── Health ──────────────────────────────────────────────────
  app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

  // ── Redirects for old email links that incorrectly point to port 3000 ──
  const FRONTEND_URL = 'http://localhost:5173';
  app.get(['/reset-password', '/reset-password.html'], (req, res) => res.redirect(`${FRONTEND_URL}/reset-password${req._parsedUrl.search || ''}`));
  app.get(['/login', '/login.html'], (req, res) => res.redirect(`${FRONTEND_URL}/login`));
  app.get(['/dashboard', '/dashboard.html'], (req, res) => res.redirect(`${FRONTEND_URL}/dashboard`));
  app.get(['/admin', '/admin.html'], (req, res) => res.redirect(`${FRONTEND_URL}/admin`));

  // ── 404 fallback ─────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`\n🌿 JobZen API running at http://localhost:${PORT}\n`);
  });
}

start().catch(err => { console.error('Failed to start:', err); process.exit(1); });
