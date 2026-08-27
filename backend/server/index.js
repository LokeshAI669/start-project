require('dotenv').config();

const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const { initDB } = require('./db');

const http = require('http');
const { Server } = require('socket.io');

async function start() {
  await initDB();

  // ── Allowed origins ─────────────────────────────────────────────────────────
  // • CORS_ORIGINS — comma-separated list of extra allowed origins (set in .env)
  // • FRONTEND_URL / PLATFORM_URL — single origin fallback
  // • Known production domains are included by default
  // • localhost ports are always allowed for local development
  const FRONTEND_URL = process.env.FRONTEND_URL || process.env.PLATFORM_URL || '';
  const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const allowedOrigins = [
    ...extraOrigins,
    FRONTEND_URL,
    'https://www.jobzen.co.in',          // production domain
    'https://jobzen.co.in',              // production domain (no www)
    'https://start-project-mu.vercel.app', // Vercel preview
    'http://localhost:5173',             // Vite dev server
    'http://localhost:4173',             // Vite preview
    'http://localhost:3000',             // backend health checks
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-side)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email'],
    credentials: true,
  };

  const app = express();
  const server = http.createServer(app);

  // Socket.IO — restricted to the same allowed origins
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected:', socket.id);
  });

  // Attach io to req object so routes can broadcast
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // ── API Routes ──────────────────────────────────────────────
  app.use('/api/auth',     require('./routes/auth'));
  app.use('/api/requests', require('./routes/requests'));
  app.use('/api/catalog',  require('./routes/catalog'));


  // ── Health ──────────────────────────────────────────────────
  app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

  // ── Redirects for old email links that incorrectly point to port 3000 ──
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
