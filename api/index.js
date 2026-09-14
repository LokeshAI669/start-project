const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('../backend/server/db');

const app = express();

// Ensure database connection is established in serverless environment
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (err) {
      console.error('[SERVERLESS DB ERROR]', err);
    }
  }
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach a no-op socket.io stub so route handlers can call
// req.io.to(room).emit(...) without crashing in serverless mode.
// The stub supports chaining: .to() returns itself so .emit() works.
app.use((req, res, next) => {
  const ioStub = { to() { return this; }, emit() {} };
  req.io = ioStub;
  next();
});

// ── Mount API Routes ──────────────────────────────────────────
app.use('/api/requests', require('../backend/server/routes/requests'));
app.use('/api/catalog', require('../backend/server/routes/catalog'));
app.use('/api/auth', require('../backend/server/routes/auth'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

module.exports = app;

