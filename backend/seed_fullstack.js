require('dotenv').config();
const { pool } = require('./server/db');

const fullstackProjects = [
  "E-Commerce Platform with Real-Time Inventory Management",
  "Collaborative Real-Time Document Editor",
  "Social Media Dashboard with Analytics and Sentiment Analysis",
  "Online Learning Management System (LMS) with Video Streaming",
  "Task Management Kanban Board with Drag-and-Drop",
  "Job Portal Application with Resume Parsing",
  "Hotel Booking System with Payment Gateway Integration",
  "Fitness Tracking App with Wearable Integration",
  "Real Estate Property Aggregator with Map View",
  "Restaurant Food Delivery Platform with Live Tracking",
  "Cryptocurrency Portfolio Tracker with Live Price Updates",
  "Online Healthcare Consultation Platform with Video Chat",
  "Event Ticketing System with QR Code Generation",
  "Crowdfunding Platform for Startup Projects",
  "Freelance Marketplace with Escrow System",
  "Cloud Storage File Sharing App with End-to-End Encryption",
  "Online Code Execution Engine and Interview Platform",
  "Multi-tenant SaaS CRM for Small Businesses",
  "Interactive Recipe Sharing Platform with Meal Planning",
  "IoT Smart Home Dashboard Control Panel"
];

async function seed() {
  const client = await pool.connect();
  let count = 0;
  try {
    await client.query('BEGIN');
    for (const title of fullstackProjects) {
      const desc = `A comprehensive full-stack development project involving frontend UI, backend API, and database architecture to build a scalable ${title.toLowerCase()}.`;
      const diffs = ['Beginner', 'Intermediate', 'Advanced'];
      const difficulty = diffs[Math.floor(Math.random() * diffs.length)];
      
      await client.query(
        'INSERT INTO project_catalog (title, domain, short_description, difficulty) VALUES ($1, $2, $3, $4)',
        [title, 'Full Stack Development', desc, difficulty]
      );
      count++;
    }
    await client.query('COMMIT');
    console.log(`Successfully added ${count} Full Stack Development projects.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
