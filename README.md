# StudentVoice — Anonymous Student Feedback Platform

> **"Your opinion matters. Your identity doesn't."**

A minimal, modern, lightweight, privacy-first web platform that allows college and university students to submit honest feedback anonymously, without creating an account or revealing their identity.

Fully deployable on **Cloudflare's Free Tier** using Cloudflare Workers, Cloudflare D1, Cloudflare Workers Static Assets, Cloudflare Turnstile, and Cloudflare Access.

---

## 1. System Architecture

```
                       ┌────────────────────────────────────────────────┐
                       │               Cloudflare Edge                  │
                       │                                                │
                       │   ┌────────────────────────────────────────┐   │
                       │   │ Cloudflare Workers Static Assets (SPA) │   │
                       │   │ React 19 + TypeScript + Tailwind CSS   │   │
                       │   └────────────────────────────────────────┘   │
                       │                       │                        │
                       │              /api/* requests                   │
                       │                       ▼                        │
                       │   ┌────────────────────────────────────────┐   │
                       │   │ Cloudflare Worker API (Hono router)    │   │
                       │   │                                        │   │
                       │   │ • Transient Rate Limiter (No IP saved) │   │
                       │   │ • PII Detection (Email, Phone, Roll #) │   │
                       │   │ • Turnstile Bot Challenge Verification │   │
                       │   │ • Cloudflare Access Admin Auth         │   │
                       │   └──────────────────┬─────────────────────┘   │
                       │                      │                         │
                       │                      ▼                         │
                       │   ┌────────────────────────────────────────┐   │
                       │   │ Cloudflare D1 (SQLite Database)        │   │
                       │   │ • feedback (UUID, Status, Category)    │   │
                       │   │ • reports (Flagged Content)            │   │
                       │   │ • admin_audit_logs (Actions)           │   │
                       │   └────────────────────────────────────────┘   │
                       └────────────────────────────────────────────────┘
```

---

## 2. Technology Stack & Zero-Cost Architecture

Every component runs entirely within Cloudflare's free tier. No external paid databases, no Firebase, no Supabase, no Vercel, and no third-party trackers.

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide | Responsive, minimal client interface with light/dark theme |
| **Backend API** | Cloudflare Workers, TypeScript, Hono | Ultra-fast serverless REST API running at edge locations worldwide |
| **Database** | Cloudflare D1 | Serverless SQLite database with migrations and indexed queries |
| **Bot Protection** | Cloudflare Turnstile | Privacy-preserving bot challenge (Zero CAPTCHAs, free tier) |
| **Admin Protection** | Cloudflare Access | Zero Trust authentication verifying institutional admin emails |
| **Hosting** | Cloudflare Workers Static Assets | High-speed global asset delivery with automated SPA routing |

---

## 3. Privacy & Anonymity by Design

Privacy is a non-negotiable core architecture requirement:

1. **Zero User Accounts:** No signup, login, or registration is required for students.
2. **Zero Persistent IP Addresses:** Visitor IP addresses are **never stored** in the database.
3. **Transient Rate Limiting:** IP addresses are hashed in transient worker memory solely to prevent denial-of-service floods and discarded automatically after a 10-minute sliding window.
4. **Random Identifiers:** Every feedback entry is assigned a randomly generated UUID v4 (`crypto.randomUUID()`).
5. **PII Detection Engine:** Both client-side (real-time warning) and server-side (hard rejection) filters detect:
   - Email addresses (institutional or personal)
   - Phone and mobile numbers
   - Student roll numbers and registration codes (e.g., `21BCE1042`, `Roll No: ...`)
   - Personal social profile links (Instagram, LinkedIn, Telegram, WhatsApp)
6. **Consistent Author Label:** All published submissions display the uniform tag `"Anonymous Student"`.
7. **No Trackers or Analytics:** Zero third-party analytics scripts, cookies, or fingerprinting.

---

## 4. Moderation & Security Workflow

To prevent abuse, spam, harassment, and doxxing:

- **Quarantine on Submission:** New submissions enter the database with status `pending`. They are strictly invisible to the public feed until approved.
- **Human Moderation:** Administrators review pending feedback in the protected Admin Dashboard.
- **Reporting System:** Visitors can report any published feedback with specific reasons (PII, harassment, hate speech, spam). Reports are queued for priority review.
- **Audit Logging:** Every moderator action (approve, reject, hide, delete, review report) is permanently recorded in `admin_audit_logs`.
- **Honeypot Trap:** Hidden form fields silently reject automated bot spam.
- **Strict Security Headers:** Implemented with `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.

---

## 5. Database Schema & Indexes

Managed through SQLite migrations in `migrations/0001_initial_schema.sql`:

### `feedback` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Random UUID v4 |
| `title` | TEXT | NULLABLE | Max 100 characters |
| `body` | TEXT | NOT NULL | 50 to 1,500 characters |
| `category` | TEXT | NOT NULL | One of 10 standard categories |
| `status` | TEXT | NOT NULL | `'pending'`, `'approved'`, `'rejected'`, `'hidden'` |
| `created_at` | INTEGER | NOT NULL | Unix epoch timestamp (ms) |
| `published_at` | INTEGER | NULLABLE | Timestamp when approved |
| `updated_at` | INTEGER | NULLABLE | Last status modification |

### `reports` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Random UUID v4 |
| `feedback_id` | TEXT | NOT NULL (FK) | Reference to `feedback.id` |
| `reason` | TEXT | NOT NULL | Standardized report violation |
| `details` | TEXT | NULLABLE | Optional reporter notes |
| `created_at` | INTEGER | NOT NULL | Submission timestamp |
| `status` | TEXT | NOT NULL | `'pending'`, `'reviewed'`, `'dismissed'` |

### `admin_audit_logs` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT PRIMARY KEY | Audit event UUID |
| `action` | TEXT | Action performed (e.g., `status_change_to_approved`, `delete_feedback`) |
| `feedback_id` | TEXT | Target feedback ID |
| `admin_email` | TEXT | Authenticated moderator email from Cloudflare Access |
| `created_at` | INTEGER | Action timestamp |

---

## 6. Local Development Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment Variables
A pre-configured `.dev.vars` file is included with Cloudflare's official dummy test keys:
```ini
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_SITE_KEY=1x00000000000000000000AA
ADMIN_ALLOWED_EMAILS=admin@example.edu,moderator@example.edu
ADMIN_DEV_SECRET=local-dev-admin-secret-token
ENVIRONMENT=development
```

### 3. Initialize Local D1 Database
Apply SQLite migrations to your local Wrangler state:
```bash
npm run db:migrate:local
```

### 4. Build Frontend Assets
```bash
npm run build
```

### 5. Launch Full-Stack Server
```bash
npm run dev:worker
```
The full application (Frontend + REST API + Local D1) is now live at:
**`http://127.0.0.1:8787`**

### 6. Run Automated Test Suite
In another terminal, execute the comprehensive test suite (28 automated tests covering health, validation, PII blocking, honeypots, rate limiting, and moderation):
```bash
node test_suite.js
```

---

## 7. Cloudflare Production Deployment Guide

Deploying to Cloudflare's free tier takes less than 5 minutes:

### Step 1: Login to Cloudflare CLI
```bash
npx wrangler login
```

### Step 2: Create Cloudflare D1 Database
Run the following command to create a production database:
```bash
npx wrangler d1 create student_feedback_db
```
Wrangler will output configuration information similar to:
```jsonc
[[d1_databases]]
binding = "DB"
database_name = "student_feedback_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
Update `wrangler.jsonc` by replacing the placeholder `database_id` with your real database ID.

### Step 3: Apply Remote Database Migrations
Run:
```bash
npx wrangler d1 migrations apply student_feedback_db --remote
```

### Step 4: Create Cloudflare Turnstile Widget (Free)
1. Open the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Turnstile**.
2. Click **Add Site**.
3. Name: `StudentVoice Anonymous Feedback`.
4. Domain: Your custom domain or `*.workers.dev`.
5. Widget Mode: **Managed**.
6. Copy the generated **Site Key** and **Secret Key**.

### Step 5: Configure Turnstile Secrets & Variables
Set your Turnstile Secret Key securely in Cloudflare Workers:
```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
```
*(Enter your secret key when prompted).*

Update `TURNSTILE_SITE_KEY` in `wrangler.jsonc` or set it via:
```bash
npx wrangler secret put TURNSTILE_SITE_KEY
```

### Step 6: Configure Cloudflare Access for Administrators (Free)
Cloudflare Zero Trust Access protects the `/admin` route on the free tier (up to 50 users free):
1. In Cloudflare Dashboard, open **Zero Trust** > **Access** > **Applications**.
2. Click **Add an Application** > **Self-hosted**.
3. Application Name: `StudentVoice Moderation`.
4. Domain: `your-subdomain.workers.dev/admin*` (or your custom domain `/admin*`).
5. Policy:
   - Action: **Allow**.
   - Rule: Include **Emails** (e.g. `admin@college.edu`).
6. Set `ADMIN_ALLOWED_EMAILS` in `wrangler.jsonc` (comma-separated list of approved emails).

### Step 7: Build and Deploy
```bash
npm run deploy
```
Wrangler will:
1. Compile the React TypeScript frontend into `dist/client`.
2. Bundle the Hono Cloudflare Worker API.
3. Upload static assets to Cloudflare Workers Static Assets engine.
4. Deploy to Cloudflare's global edge network!

---

## 8. REST API Reference

### Public Endpoints
- `GET /api/health` — Service health status
- `GET /api/config` — Public Turnstile site key and environment
- `GET /api/feedback` — Paginated list of approved feedback items (`category`, `page`, `limit`)
- `GET /api/feedback/:id` — Single approved feedback item
- `POST /api/feedback` — Submit anonymous feedback (rate-limited, Turnstile verified, PII checked)
- `POST /api/feedback/:id/report` — Report feedback (rate-limited, Turnstile verified)

### Admin Endpoints (Guarded by Cloudflare Access)
- `GET /api/admin/stats` — Dashboard statistics overview
- `GET /api/admin/feedback` — Moderation queue (`status`, `page`, `limit`)
- `PATCH /api/admin/feedback/:id/status` — Update status (`approved`, `rejected`, `hidden`)
- `DELETE /api/admin/feedback/:id` — Permanently delete feedback
- `GET /api/admin/reports` — View user reports with feedback preview
- `PATCH /api/admin/reports/:id` — Update report status (`reviewed`, `dismissed`)
- `GET /api/admin/audit-logs` — Review immutable administrator audit logs

---

## 9. Verification & Quality Assurance Summary

The platform has passed 28 automated tests including:
- [x] Homepage, Feed, Guidelines, Privacy, and Admin routing
- [x] Input length constraints (Title: max 100, Body: 50-1500 chars)
- [x] Automated honeypot rejection of bot submissions
- [x] PII detection (emails, phone numbers, roll numbers, social profiles)
- [x] Quarantine enforcement (unmoderated feedback never appears publicly)
- [x] Cloudflare Access authentication verification on all admin APIs
- [x] Audit trail recording on approval, rejection, and deletion
- [x] Zero IP, email, or user identifier leakage in public API responses
- [x] Responsive layout and dark/light mode toggle with system preference detection
- [x] SQL injection protection via parameterized D1 statements
