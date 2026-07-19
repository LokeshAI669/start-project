# ProjectHub — Student Project Request Platform

A full-stack web application where students submit project requests for admin review, with automated email notifications throughout the entire workflow.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
copy .env.example .env
```

Then open `.env` and fill in your details:

```env
JWT_SECRET=your_random_secret_string_here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourAdminPassword123
ADMIN_NAME=Admin
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_NOTIFY_EMAIL=your_gmail@gmail.com
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate an app-specific password and use it as `EMAIL_PASS`. Do NOT use your regular Gmail password.

### 3. Start the server

```bash
npm start
```

Visit: **http://localhost:3000**

---

## Features

| Feature | Details |
|---|---|
| Student Registration | Sign up with name, email, password. Welcome email sent automatically. |
| Student Login | JWT-based auth with session persistence |
| Forgot Password | Email-based reset link (1-hour expiry) |
| Project Request | 2-step form: project details → calendar scheduler |
| Email Notifications | 7 automated emails across the full lifecycle |
| Admin Panel | Accept/deny requests, filter/search, propose alternate times |
| Status Tracking | Pending → Accepted/Denied → Rescheduled |
| Role Security | Students can't access admin routes and vice versa |

---

## Default Admin Credentials

On first run, an admin account is created automatically:

| Field | Default |
|---|---|
| Email | `admin@platform.com` (or your `ADMIN_EMAIL`) |
| Password | `Admin@123` (or your `ADMIN_PASSWORD`) |

Log in via the **Admin Login** button on the homepage.

---

## Email Triggers

| Event | Recipients |
|---|---|
| Student registers | Student (welcome email) |
| Project submitted | Student (confirmation) + Admin (notification) |
| Project accepted | Student (accepted + meeting time) |
| Project denied | Student (denial + optional reason) |
| Student reschedules | Admin (updated request details) |
| Forgot password | Student (reset link, 1-hour expiry) |

---

## Project Structure

```
├── server/
│   ├── index.js          # Express entry point
│   ├── db.js             # SQLite schema & admin seeding
│   ├── auth.js           # JWT middleware
│   ├── mailer.js         # Nodemailer email templates
│   └── routes/
│       ├── auth.js       # Register/login/reset endpoints
│       ├── projects.js   # Student project CRUD
│       └── admin.js      # Admin management endpoints
├── public/
│   ├── index.html        # Login page
│   ├── register.html     # Student registration
│   ├── dashboard.html    # Student dashboard
│   ├── request.html      # 2-step project request form
│   ├── admin.html        # Admin panel
│   ├── reset-password.html
│   ├── css/styles.css    # Premium dark design system
│   └── js/
│       ├── auth.js       # Token management + API helper
│       ├── calendar.js   # Custom calendar component
│       ├── dashboard.js
│       ├── request.js
│       └── admin.js
├── .env                  # Your secrets (never commit this!)
├── .env.example          # Template
└── package.json
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Student signup |
| POST | `/api/auth/login` | — | Student login |
| POST | `/api/auth/admin-login` | — | Admin login |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Apply new password |
| GET | `/api/projects` | Student | Fetch own requests |
| POST | `/api/projects` | Student | Submit new request |
| PUT | `/api/projects/:id/reschedule` | Student | Reschedule denied request |
| GET | `/api/admin/projects` | Admin | All requests (filterable) |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| PUT | `/api/admin/projects/:id/accept` | Admin | Accept request |
| PUT | `/api/admin/projects/:id/deny` | Admin | Deny request |

---

## Development

```bash
# Install nodemon for auto-restart on file changes
npm run dev
```

The database file (`database.db`) is created automatically in the project root.
