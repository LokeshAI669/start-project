require('dotenv').config();
const { pool } = require('./server/db');

async function updateSchema() {
  try {
    await pool.query(`
      ALTER TABLE project_catalog ADD COLUMN IF NOT EXISTS full_description TEXT;
      ALTER TABLE project_catalog ADD COLUMN IF NOT EXISTS tech_stack VARCHAR(255);
      ALTER TABLE project_catalog ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50);
      ALTER TABLE project_catalog ADD COLUMN IF NOT EXISTS objectives TEXT[];
      ALTER TABLE project_catalog ADD COLUMN IF NOT EXISTS prerequisites TEXT;
    `);
    console.log('Successfully added new columns to project_catalog');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    process.exit(0);
  }
}

updateSchema();
