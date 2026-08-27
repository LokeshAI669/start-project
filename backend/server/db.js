const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// ── Connection pool ───────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ── Migrations ────────────────────────────────────────────────────────────────
// Rules:
//  1. Never edit an existing migration — add a new one instead.
//  2. Migrations run exactly once; the schema_migrations table tracks what ran.
//  3. Keep each migration small and focused.
//  4. Always use IF NOT EXISTS / IF EXISTS / ADD COLUMN IF NOT EXISTS guards.
//
const MIGRATIONS = [
  {
    version: '001',
    description: 'Initial schema — users, projects, messages, password_resets, project_catalog',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'student',
        created_at    TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id             SERIAL PRIMARY KEY,
        student_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_name   TEXT NOT NULL,
        budget         NUMERIC NOT NULL,
        currency       TEXT NOT NULL DEFAULT '₹',
        description    TEXT NOT NULL,
        preferred_date TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        status         TEXT NOT NULL DEFAULT 'Pending',
        admin_note     TEXT,
        confirmed_date TEXT,
        confirmed_time TEXT,
        attachment_url TEXT,
        created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        sender_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content    TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used       BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS project_catalog (
        id                 SERIAL PRIMARY KEY,
        title              VARCHAR(255) NOT NULL,
        domain             VARCHAR(50)  NOT NULL,
        short_description  TEXT,
        difficulty         VARCHAR(20)  DEFAULT 'Intermediate'
                             CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
        is_active          BOOLEAN DEFAULT TRUE,
        full_description   TEXT,
        tech_stack         VARCHAR(255),
        estimated_duration VARCHAR(50),
        objectives         TEXT[],
        prerequisites      TEXT,
        created_at         TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_catalog_domain ON project_catalog(domain);

      ALTER TABLE projects ADD COLUMN IF NOT EXISTS catalog_project_id INTEGER REFERENCES project_catalog(id);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS student_name TEXT;
    `,
  },

  // ── Add future migrations below this line ─────────────────────────────────
  // Example:
  // {
  //   version: '002',
  //   description: 'Add phone_number column to users',
  //   sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;`,
  // },
];

// ── Migration runner ──────────────────────────────────────────────────────────
async function runMigrations() {
  // 1. Ensure the migrations tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     TEXT PRIMARY KEY,
      description TEXT,
      applied_at  TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // 2. Fetch already-applied versions in one query
  const { rows: applied } = await pool.query('SELECT version FROM schema_migrations');
  const appliedSet = new Set(applied.map(r => r.version));

  // 3. Run pending migrations in order, each in its own transaction
  let ran = 0;
  for (const migration of MIGRATIONS) {
    if (appliedSet.has(migration.version)) continue;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migration.sql);
      await client.query(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        [migration.version, migration.description]
      );
      await client.query('COMMIT');
      console.log(`[DB] Migration ${migration.version} applied — ${migration.description}`);
      ran++;
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`[DB] Migration ${migration.version} FAILED (rolled back): ${err.message}`);
    } finally {
      client.release();
    }
  }

  if (ran === 0) {
    console.log('[DB] Schema up-to-date — no migrations to run.');
  }
}

// ── Seed initial admin account ────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const { rows } = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (rows.length > 0) return;

    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@platform.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName     = process.env.ADMIN_NAME     || 'Admin';

    const hash = bcrypt.hashSync(adminPassword, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [adminName, adminEmail, hash]
    );
    console.log(`[DB] Admin account created → ${adminEmail}`);
  } catch (err) {
    console.error('[DB] Failed to seed admin:', err.message);
  }
}

// ── initDB — called once at server start ──────────────────────────────────────
let initPromise = null;

async function initDB() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await pool.query('SELECT 1'); // test connection
      console.log('[DB] Connected to PostgreSQL.');
      await runMigrations();
      await seedAdmin();
      return pool;
    } catch (err) {
      initPromise = null; // allow retry
      console.error('[DB] Initialization failed:', err.message);
      throw err;
    }
  })();

  return initPromise;
}

module.exports = { pool, initDB, seedAdmin };

