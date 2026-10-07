const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const { initDB } = require('../backend/server/db');

const app = express();

// ── Allowed origins — all domains that may call this API ──────────────────────
const ALLOWED_ORIGINS = [
  // Production custom domains
  'https://www.jobzen.co.in',
  'https://jobzen.co.in',
  'https://hire.jobzen.co.in',
  // Vercel preview / deployment URLs
  'https://start-project-mu.vercel.app',
  // Allow any *.vercel.app preview deploy
  // Local development
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any vercel.app preview URL automatically
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email'],
  credentials: true,
};

// ── CORS must be FIRST — OPTIONS preflight must never wait for DB init ────────
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // respond to all preflight requests immediately

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// ── Lazy DB init — only blocks non-OPTIONS requests ──────────────────────────
// dbInitialized is module-level; stays true for the lifetime of a warm instance.
let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
  if (dbInitialized) return next(); // warm path — instant

  // Deduplicate concurrent cold-start requests
  if (!dbInitPromise) {
    dbInitPromise = initDB()
      .then(() => { dbInitialized = true; })
      .catch(err => {
        console.error('[SERVERLESS DB ERROR]', err);
        dbInitPromise = null; // allow retry on next request
      });
  }

  try {
    await dbInitPromise;
  } catch (_) { /* initDB already logged */ }

  next();
});

// ── Socket.io stub — route handlers call req.io.to().emit() safely ───────────
app.use((req, _res, next) => {
  req.io = { to() { return this; }, emit() { } };
  next();
});

// ── Mount API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', require('../backend/server/routes/auth'));
app.use('/api/requests', require('../backend/server/routes/requests'));
app.use('/api/catalog', require('../backend/server/routes/catalog'));
app.use('/api/admin/orders', require('../backend/server/routes/adminOrders'));
app.use('/api', require('../backend/server/routes/orders'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

module.exports = app;

