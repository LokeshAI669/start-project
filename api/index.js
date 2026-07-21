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

// Attach dummy io object for socket.io compatibility in serverless environment
app.use((req, res, next) => {
  req.io = { emit: () => {} };
  next();
});

// ── Mount API Routes ──────────────────────────────────────────
app.use('/api', require('../backend/server/routes/auth'));
app.use('/api/requests', require('../backend/server/routes/requests'));
app.use('/api/catalog', require('../backend/server/routes/catalog'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

module.exports = app;
