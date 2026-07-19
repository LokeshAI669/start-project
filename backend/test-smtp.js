require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

console.log('Testing SMTP connection for user:', process.env.GMAIL_USER);

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error.message);
    process.exit(1);
  } else {
    console.log('SMTP Connection Successful!');
    process.exit(0);
  }
});
