require('dotenv').config();
const { pool } = require('./server/db');

async function populateDetails() {
  try {
    const { rows } = await pool.query('SELECT id, title, domain FROM project_catalog WHERE full_description IS NULL');
    console.log(`Found ${rows.length} projects needing details.`);

    for (const p of rows) {
      const full_description = `This comprehensive project focuses on developing a robust solution for ${p.title.toLowerCase()}. By leveraging state-of-the-art methodologies in ${p.domain}, it aims to provide accurate, reliable, and scalable results.\n\nThe system is designed with modularity in mind, ensuring it can be adapted to various real-world scenarios. It incorporates advanced algorithms, robust data processing, and performance evaluation to deliver a complete end-to-end pipeline.\n\nKey focus areas include optimizing computational efficiency, enhancing usability, and ensuring high precision in all outputs. This project serves as an excellent foundation for understanding advanced concepts and applying them in practical, impactful ways.`;
      
      const tech_stack = 'Python, React, Node.js, PostgreSQL, Docker, TensorFlow';
      const estimated_duration = '4 - 6 Weeks';
      const objectives = [
        `Understand the core principles of ${p.domain}`,
        `Design and implement a working prototype for ${p.title}`,
        'Evaluate system performance using standard metrics',
        'Deploy the final application in a scalable environment'
      ];
      const prerequisites = 'Basic understanding of programming, databases, and a strong interest in ' + p.domain + '.';

      await pool.query(
        `UPDATE project_catalog SET 
          full_description = $1, 
          tech_stack = $2, 
          estimated_duration = $3, 
          objectives = $4, 
          prerequisites = $5 
         WHERE id = $6`,
        [full_description, tech_stack, estimated_duration, objectives, prerequisites, p.id]
      );
    }
    
    console.log('Successfully updated all projects with full details!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

populateDetails();
