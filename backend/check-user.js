require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const email = 'l50685828@gmail.com';
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  console.log('User found:', rows.length > 0 ? rows[0] : 'No');
  
  const { rows: resets } = await pool.query('SELECT * FROM password_resets WHERE user_id = $1', [rows[0]?.id]);
  console.log('Resets found:', resets.length > 0 ? resets : 'No');
  
  process.exit(0);
}
run();
