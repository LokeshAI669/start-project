/**
 * dedupe_catalog.js
 * Removes duplicate project_catalog rows.
 * Keeps the OLDEST row per title (lowest id), deactivates the rest.
 */
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Show how many duplicates exist
    const { rows: dupInfo } = await client.query(`
      SELECT title, COUNT(*) as cnt
      FROM project_catalog
      WHERE is_active = TRUE
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC
    `);

    if (dupInfo.length === 0) {
      console.log('✅ No duplicate projects found!');
      return;
    }

    console.log(`\n🔍 Found ${dupInfo.length} titles with duplicates:\n`);
    dupInfo.forEach(r => console.log(`  • "${r.title}" — ${r.cnt} copies`));

    // 2. Deactivate duplicates — keep lowest id per title
    const { rowCount } = await client.query(`
      UPDATE project_catalog
      SET is_active = FALSE
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM project_catalog
        WHERE is_active = TRUE
        GROUP BY title
      )
      AND is_active = TRUE
    `);

    console.log(`\n✅ Deactivated ${rowCount} duplicate projects.`);

    // 3. Show final count
    const { rows: countRows } = await client.query(`
      SELECT COUNT(*) as active FROM project_catalog WHERE is_active = TRUE
    `);
    console.log(`📊 Active projects remaining: ${countRows[0].active}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
