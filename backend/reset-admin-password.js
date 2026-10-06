/**
 * reset-admin-password.js
 * 
 * One-time utility: updates the admin user's password_hash in the DB
 * to match the current ADMIN_PASSWORD in .env.
 * 
 * Usage: node reset-admin-password.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function resetAdminPassword() {
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@platform.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName     = process.env.ADMIN_NAME     || 'Admin';

  console.log(`\n🔑  Resetting admin password for: ${adminEmail}`);

  try {
    await pool.query('SELECT 1'); // test connection
    console.log('✅  Connected to PostgreSQL.\n');

    const hash = bcrypt.hashSync(adminPassword, 10);

    // Check if admin exists
    const { rows } = await pool.query(
      "SELECT id, email FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (rows.length === 0) {
      // No admin found — create one
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
        [adminName, adminEmail, hash]
      );
      console.log(`✅  Admin account CREATED → ${adminEmail}`);
    } else {
      // Admin exists — update their password (and email/name if changed)
      await pool.query(
        `UPDATE users SET password_hash = $1, email = $2, name = $3 WHERE role = 'admin'`,
        [hash, adminEmail, adminName]
      );
      console.log(`✅  Admin password UPDATED for: ${rows[0].email} → now using email: ${adminEmail}`);
    }

    console.log('\n🎉  Done! You can now log in with:');
    console.log(`     Email:    ${adminEmail}`);
    console.log(`     Password: ${adminPassword}\n`);
  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
