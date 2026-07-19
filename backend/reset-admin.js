/**
 * reset-admin.js — One-time script to update admin email + password in the database
 * Run with: node reset-admin.js
 */
require('dotenv').config();

const bcrypt    = require('bcryptjs');
const { initDB } = require('./server/db');

(async () => {
  const pool = await initDB();

  const newEmail    = process.env.ADMIN_EMAIL;
  const newPassword = process.env.ADMIN_PASSWORD;
  const newName     = process.env.ADMIN_NAME || 'Admin';

  if (!newEmail || !newPassword) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(newPassword, 12);

  // Find existing admin
  const { rows } = await pool.query("SELECT * FROM users WHERE role = 'admin'");
  const admin = rows[0];

  if (admin) {
    await pool.query(
      `UPDATE users SET email = $1, password_hash = $2, name = $3 WHERE role = 'admin'`,
      [newEmail, hash, newName]
    );
    console.log(`✅ Admin credentials updated successfully!`);
    console.log(`   Email:    ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
  } else {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [newName, newEmail, hash]
    );
    console.log(`✅ Admin account created!`);
    console.log(`   Email:    ${newEmail}`);
    console.log(`   Password: ${newPassword}`);
  }

  process.exit(0);
})();
