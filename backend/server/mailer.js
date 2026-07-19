const nodemailer = require('nodemailer');
const path = require('path');

const PLATFORM     = process.env.PLATFORM_NAME || 'JobZen';
const PLATFORM_URL = process.env.PLATFORM_URL  || 'http://localhost:3000';

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
    body { margin:0; padding:0; background:#F0EDE6; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:600px; margin:0 auto; padding:32px 16px; }
    .card { background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #E2E0D7; }
    .header { background:linear-gradient(135deg,#2F5D50,#203F37); padding:36px 40px; text-align:center; }
    .header .logo { display:inline-block; background:#C9932E; color:#fff; font-size:22px; font-weight:800;
                    padding:8px 22px; border-radius:8px; letter-spacing:-0.5px; }
    .header p { margin:10px 0 0; color:rgba(255,255,255,0.75); font-size:14px; }
    .body { padding:36px 40px; color:#1C231F; font-size:15px; line-height:1.7; }
    .body h2 { color:#1C231F; font-size:20px; margin-top:0; }
    .highlight { background:#F6F5F0; border-left:4px solid #2F5D50; border-radius:0 8px 8px 0;
                 padding:16px 20px; margin:20px 0; }
    .highlight p { margin:5px 0; color:#1C231F; }
    .highlight strong { color:#2F5D50; }
    .badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:13px; font-weight:600; }
    .badge-pending  { background:#FEF3DC; color:#92640A; }
    .badge-accepted { background:#DCEEE8; color:#1C5940; }
    .badge-denied   { background:#FAE0DC; color:#8B2E20; }
    .btn { display:inline-block; margin-top:20px; padding:13px 30px;
           background:#C9932E; color:#fff; text-decoration:none;
           border-radius:10px; font-weight:700; font-size:15px; }
    .footer { padding:20px 40px; text-align:center; color:#57615B; font-size:12px;
              border-top:1px solid #E2E0D7; background:#F9F8F5; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="logo">🌿 ${PLATFORM}</div>
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
      <h2>Welcome, ${user.name}! 🎉</h2>
      <p>Your student account has been created. You can now log in and start submitting project requests for review.</p>
      <a href="${PLATFORM_URL}/login" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">Go to Login →</a>
    `);
    await send(user.email, `Welcome to ${PLATFORM}!`, html);
  },

  // 2. Request submitted — student confirmation
  async requestSubmitted(user, project) {
    const html = baseTemplate('Request Received', `
      <h2>Request received! 📋</h2>
      <p>Hi ${user.name}, your project request is now under review.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Budget:</strong> ${project.currency}${Number(project.budget).toLocaleString()}</p>
        <p><strong>Preferred Meeting:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
      </div>
      <p>You'll receive an email once the admin reviews your request.</p>
      <a href="${PLATFORM_URL}/dashboard" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">View Dashboard →</a>
    `);
    await send(user.email, `[${PLATFORM}] Request Received — ${project.project_name}`, html);
  },

  // 3. New request alert — admin
  async notifyAdmin(student, project) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'admin@platform.com';
    
    let attachments = [];
    let attachmentNote = '';
    if (project.attachment_url) {
      const filePath = path.join(__dirname, '..', project.attachment_url);
      const fileName = project.attachment_url.split('/').pop().split('-').slice(1).join('-') || 'Attachment.pdf';
      attachments.push({ filename: fileName, path: filePath });
      attachmentNote = `<p><strong>Attachment:</strong> 📎 A file was uploaded (attached to this email).</p>`;
    }

    const html = baseTemplate('New Project Request', `
      <h2>New request submitted 🔔</h2>
      <div class="highlight">
        <p><strong>Student:</strong> ${student.name} (${student.email})</p>
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Budget:</strong> ${project.currency}${Number(project.budget).toLocaleString()}</p>
        <p><strong>Preferred Date:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Description:</strong> ${project.description}</p>
        ${attachmentNote}
      </div>
      <a href="${PLATFORM_URL}/admin" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">Review in Admin Panel →</a>
    `);
    await send(adminEmail, `[${PLATFORM}] New Request: ${project.project_name}`, html, attachments);
  },

  // 4. Request accepted — student
  async requestAccepted(user, project) {
    const date = project.confirmed_date || project.preferred_date;
    const time = project.confirmed_time || project.preferred_time;
    const html = baseTemplate('Request Accepted!', `
      <h2>Great news, ${user.name}! ✅</h2>
      <p>Your project request has been <strong style="color:#1C5940">accepted</strong>.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Confirmed Meeting:</strong> ${date} at ${time}</p>
        <p><strong>Status:</strong> <span class="badge badge-accepted">Accepted</span></p>
        ${project.admin_note ? `<p><strong>Note from Admin:</strong> ${project.admin_note}</p>` : ''}
      </div>
      <a href="${PLATFORM_URL}/dashboard" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">View Dashboard →</a>
    `);
    await send(user.email, `[${PLATFORM}] ✅ Accepted — ${project.project_name}`, html);
  },

  // 5. Request denied — student
  async requestDenied(user, project) {
    const html = baseTemplate('Request Update', `
      <h2>Hi ${user.name},</h2>
      <p>Unfortunately your project request was <strong style="color:#8B2E20">not accepted</strong> at this time.</p>
      <div class="highlight">
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>Status:</strong> <span class="badge badge-denied">Denied</span></p>
        ${project.admin_note ? `<p><strong>Reason:</strong> ${project.admin_note}</p>` : ''}
      </div>
      <p>You can reschedule or submit a new request from your dashboard.</p>
      <a href="${PLATFORM_URL}/dashboard" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">Reschedule →</a>
    `);
    await send(user.email, `[${PLATFORM}] Request Update — ${project.project_name}`, html);
  },

  // 6. Reschedule alert — admin
  async notifyAdminReschedule(student, project) {
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'admin@platform.com';
    const html = baseTemplate('Request Rescheduled', `
      <h2>A request has been rescheduled 🔄</h2>
      <div class="highlight">
        <p><strong>Student:</strong> ${student.name} (${student.email})</p>
        <p><strong>Project:</strong> ${project.project_name}</p>
        <p><strong>New Time:</strong> ${project.preferred_date} at ${project.preferred_time}</p>
        <p><strong>Status:</strong> <span class="badge badge-pending">Pending</span></p>
      </div>
      <a href="${PLATFORM_URL}/admin" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">Review in Admin Panel →</a>
    `);
    await send(adminEmail, `[${PLATFORM}] Rescheduled: ${project.project_name}`, html);
  },

  // 7. Password reset
  async passwordReset(user, resetToken) {
    const resetUrl = `${PLATFORM_URL}/reset-password?token=${resetToken}`;
    const html = baseTemplate('Reset Your Password', `
      <h2>Password Reset 🔐</h2>
      <p>Hi ${user.name}, we received a password reset request for your account.</p>
      <p>Click below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block; margin-top:20px; padding:13px 30px; background:#C9932E; color:#fff; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">Reset Password →</a>
      <p style="margin-top:20px;font-size:13px;color:#57615B;">Didn't request this? Ignore this email safely.</p>
    `);
    await send(user.email, `[${PLATFORM}] Password Reset`, html);
  },
};

module.exports = mailer;
