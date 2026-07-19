require('dotenv').config();
const { pool } = require('./db');

async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW() AS current_time');
    console.log('✅ Successfully connected to PostgreSQL.');
    console.log('Database time:', rows[0].current_time);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
