# Internet Black Box (IBB) — Backend

## Overview
Production-grade Node.js + Express backend for the IBB AI research platform.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — minimum required: MONGODB_URI + JWT secrets
```

### 3. Create admin user
```bash
npm run create-admin
# Default: admin@ibb.local / Admin@123456
# Custom: ADMIN_EMAIL=you@domain.com ADMIN_PASS=YourPass123 npm run create-admin
```

### 4. Start server
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server runs at **http://localhost:5000**

## Admin Login
After running `npm run create-admin`:
- URL: http://localhost:5173/login
- Email: `admin@ibb.local`
- Password: `Admin@123456`
- Admin panel: http://localhost:5173/admin/dashboard

To promote an existing user to admin:
```bash
npm run promote-admin your@email.com
```

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Send reset email |
| POST | /api/auth/reset-password | Reset password |
| GET  | /api/dashboard | Dashboard stats |
| GET  | /api/uploads | List uploads |
| POST | /api/uploads | Upload file |
| GET  | /api/analyses | List analyses |
| GET  | /api/reports | List reports |
| GET  | /api/notifications | Notifications |
| POST | /api/ai/chat | AI chat |
| GET  | /api/search | Search |
| GET  | /api/admin/* | Admin (admin role required) |

## Environment Variables
See `.env.example` for full list.

**Required:**
- `MONGODB_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` — Min 32 chars random string
- `JWT_REFRESH_SECRET` — Min 32 chars random string

**Optional:**
- `REDIS_URL` — Enables queues and caching
- `PYTHON_API_URL` — AI service (default: http://localhost:8000)
- `SMTP_*` — Email for password reset

## Docker
```bash
cp .env.example .env   # fill in JWT secrets + MONGODB_URI
docker compose up -d
```

## Tech Stack
Node.js · Express · MongoDB (Mongoose) · Redis · BullMQ · Socket.IO · JWT · Nodemailer · PDFKit
