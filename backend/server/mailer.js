const nodemailer = require('nodemailer');
const path = require('path');

const PLATFORM     = process.env.PLATFORM_NAME || 'JobZen';
const PLATFORM_URL = process.env.PLATFORM_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('[MAIL] SMTP connection FAILED:', error.message);
  } else {
    console.log('[MAIL] SMTP connection ready ✅');
  }
});

// ── Shared HTML email shell (green/gold brand palette) ────────────────────────
function baseTemplate(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin:0; padding:0; background:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }
    .wrap { max-width:600px; margin:0 auto; padding:40px 20px; }
    .card { background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
    .header { background:#ffffff; padding:30px 40px 20px; text-align:left; border-bottom:1px solid #e5e7eb; }
    .header .logo { display:inline-block; color:#111827; font-size:24px; font-weight:700; letter-spacing:-0.5px; }
    .header p { margin:8px 0 0; color:#6b7280; font-size:14px; }
    .body { padding:30px 40px; color:#374151; font-size:15px; line-height:1.6; }
    .body h2 { color:#111827; font-size:20px; margin-top:0; margin-bottom:16px; font-weight:600; }
    .highlight { background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:16px 20px; margin:24px 0; }
    .highlight p { margin:8px 0; color:#374151; }
    .highlight strong { color:#111827; font-weight:600; display:inline-block; min-width:130px; }
    .badge { display:inline-block; padding:4px 12px; border-radius:4px; font-size:13px; font-weight:500; }
    .badge-pending  { background:#fef3c7; color:#92400e; }
    .badge-accepted { background:#d1fae5; color:#065f46; }
    .badge-denied   { background:#fee2e2; color:#b91c1c; }
    .btn { display:inline-block; margin-top:24px; padding:12px 24px; background:#2563eb; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:500; font-size:14px; }
    .footer { padding:24px 40px; text-align:center; color:#9ca3af; font-size:13px; background:#f9fafb; border-top:1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="logo">${PLATFORM}</div>
        <p>${title}</p>
      </div>
      <div class="body">${bodyHtml}</div>
      <div class="footer">&copy; ${new Date().getFullYear()} ${PLATFORM} &bull; Automated notification</div>
    </div>
  </div>
</body>
</html>`;
}

// ── Send helper ───────────────────────────────────────────────────────────────
async function send(to, subject, html, attachments = []) {
  try {
    const info = await transporter.sendMail({
      from: `"${PLATFORM}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });
    console.log(`[MAIL] "${subject}" → ${to}`);
    return info;
  } catch (err) {
    console.error(`[MAIL ERROR] → ${to}:`, err.message || err);
    throw err;
  }
}

// ── Email templates ───────────────────────────────────────────────────────────
const mailer = {

  // 1. Welcome on registration
  async welcome(user) {
    const html = baseTemplate('Welcome to ' + PLATFORM, `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your student account has been created. You can now log in and start submitting project requests for review.</p>
      <a href="${PLATFORM_URL}/login" class="btn">Go to Login &rarr;</a>
    `);
    await send(user.email, `Welcome to ${PLATFORM}!`, html);
  },

  // 2. Request submitted — student confirmation
  async requestSubmitted(user, project) {
    const html = baseTemplate('Request Received', `
      <h2>Request received!</h2>
      <p>Hi ${user.name}, your project request is now under review.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Budget:</strong> ${project.currency}${Number(project.budget).toLocaleString()}</p>
        <p><strong>Preferred Meeting:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
      </div>
      <p>You'll receive an email once the admin reviews your request.</p>
      <a href="${PLATFORM_URL}/dashboard" class="btn">View Dashboard &rarr;</a>
    `);
    await send(user.email, `[${PLATFORM}] Request Received — ${project.project_name}`, html);
  },

  // 3. New request alert — admin
  async notifyAdmin(student, project) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'admin@platform.com';
    
    let attachments = [];
    let attachmentNote = '';
    if (project.attachment_url) {
      const filePath = path.join(__dirname, '..', project.attachment_url);
      const fileName = project.attachment_url.split('/').pop().split('-').slice(1).join('-') || 'Attachment.pdf';
      attachments.push({ filename: fileName, path: filePath });
      attachmentNote = `<p><strong>Attachment:</strong> A file was uploaded (attached to this email).</p>`;
    }

    const html = baseTemplate('New Project Request', `
      <h2>New request submitted</h2>
      <div class="highlight">
        <p><strong>Student:</strong> ${student.name} (${student.email})</p>
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Budget:</strong> ${project.currency}${Number(project.budget).toLocaleString()}</p>
        <p><strong>Preferred Date:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Description:</strong> ${project.description}</p>
        ${attachmentNote}
      </div>
      <a href="${PLATFORM_URL}/admin" class="btn">Review in Admin Panel &rarr;</a>
    `);
    await send(adminEmail, `[${PLATFORM}] New Request: ${project.project_name}`, html, attachments);
  },

  // 4. Request accepted — student
  async requestAccepted(user, project) {
    const date = project.confirmed_date || project.preferred_date;
    const time = project.confirmed_time || project.preferred_time;
    const html = baseTemplate('Request Accepted!', `
      <h2>Great news, ${user.name}!</h2>
      <p>Your project request has been <strong style="color:#065f46">accepted</strong>.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Confirmed Meeting:</strong> ${date} at ${time}</p>
        <p><strong>Status:</strong> <span class="badge badge-accepted">Accepted</span></p>
        ${project.admin_note ? `<p><strong>Note from Admin:</strong> ${project.admin_note}</p>` : ''}
      </div>
      <a href="${PLATFORM_URL}/dashboard" class="btn">View Dashboard &rarr;</a>
    `);
    await send(user.email, `[${PLATFORM}] Accepted — ${project.project_name}`, html);
  },

  // 5. Request denied — student
  async requestDenied(user, project) {
    const html = baseTemplate('Request Update', `
      <h2>Hi ${user.name},</h2>
      <p>Unfortunately your project request was <strong style="color:#b91c1c">not accepted</strong> at this time.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Status:</strong> <span class="badge badge-denied">Denied</span></p>
        ${project.admin_note ? `<p><strong>Reason:</strong> ${project.admin_note}</p>` : ''}
      </div>
      <p>You can reschedule or submit a new request from your dashboard.</p>
      <a href="${PLATFORM_URL}/dashboard" class="btn">Reschedule &rarr;</a>
    `);
    await send(user.email, `[${PLATFORM}] Request Update — ${project.project_name}`, html);
  },

  // 6. Reschedule alert — admin
  async notifyAdminReschedule(student, project) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'admin@platform.com';
    const html = baseTemplate('Request Rescheduled', `
      <h2>A request has been rescheduled</h2>
      <div class="highlight">
        <p><strong>Student:</strong> ${student.name} (${student.email})</p>
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>New Time:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
      </div>
      <a href="${PLATFORM_URL}/admin" class="btn">Review in Admin Panel &rarr;</a>
    `);
    await send(adminEmail, `[${PLATFORM}] Rescheduled: ${project.project_name}`, html);
  },

  // 7. Password reset
  async passwordReset(user, resetToken) {
    const resetUrl = `${PLATFORM_URL}/reset-password?token=${resetToken}`;
    const html = baseTemplate('Reset Your Password', `
      <h2>Password Reset</h2>
      <p>Hi ${user.name}, we received a password reset request for your account.</p>
      <p>Click below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password &rarr;</a>
      <p style="margin-top:24px;font-size:13px;color:#9ca3af;">Didn't request this? Ignore this email safely.</p>
    `);
    await send(user.email, `[${PLATFORM}] Password Reset`, html);
  },
};

module.exports = mailer;
