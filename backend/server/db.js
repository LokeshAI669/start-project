const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create a single pg Pool
const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

/**
 * Ensures the schema is applied.
 */
async function applySchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('[DB] Applied schema from schema.sql');
  }
}

/**
 * Seeds the initial admin account if none exists.
 */
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

/**
 * Initializes the database connection and runs setup.
 */
async function initDB() {
  try {
    await pool.query('SELECT NOW()'); // test connection
    console.log('[DB] Connected to PostgreSQL.');
    await applySchema();
    await seedAdmin();
    return pool;
  } catch (err) {
    console.error('[DB] Connection failed:', err);
    throw err;
  }
}

module.exports = { pool, initDB, seedAdmin };
