# Student Document Tracking System (VPS edition)

A lightweight student document portal built for a small institution on a
low-resource Ubuntu VPS (~1 GB RAM / 1 CPU).

- **Frontend:** React + Vite + TailwindCSS (static SPA, ~59 KB gzipped JS)
- **Backend:** Node.js + Express REST API, JWT auth, role-based access
- **Database:** PostgreSQL via Prisma ORM
- **Files:** stored locally in `backend/uploads/`, served through an
  access-controlled API route (no filesystem paths exposed)
- **Infra:** Nginx reverse proxy + PM2 process manager

Roles: **student** (register, upload, track), **counsellor** (review/verify),
**admin** (manage users + review everything). Admins create users directly — no
invitation flow.

---

## 1. Folder structure

```
student-doc-vps/
├── ecosystem.config.js        # PM2 config (runs the backend)
├── nginx.conf                 # Nginx site config (SPA + /api proxy)
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma       # User, Document, AuditLog models
│   │   └── seed.js             # bootstraps the first admin (no hardcoded creds)
│   ├── uploads/                # created at runtime (gitignored)
│   └── src/
│       ├── server.js           # Express app + route mounting
│       ├── config.js           # env loading + prod safety checks
│       ├── prismaClient.js     # single shared Prisma client
│       ├── middleware/         # auth (JWT + roles), upload (multer), error
│       ├── controllers/        # auth, users, documents
│       ├── routes/             # /api/auth, /api/users, /api/documents
│       └── utils/              # jwt, validation, asyncHandler
└── frontend/
    ├── package.json
    ├── vite.config.js          # dev proxy /api → backend
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── api/client.js       # fetch wrapper (JWT + blob downloads)
        ├── context/AuthContext.jsx
        ├── components/         # Layout, Navbar, ProtectedRoute, etc.
        └── pages/              # Login, Register, dashboards, Upload, Review, Users
```

---

## 2. API reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Student self-registration |
| POST | `/api/auth/login` | public | Log in, returns JWT |
| GET | `/api/auth/me` | any auth | Current user |
| GET | `/api/users` | admin | List/search/filter users |
| POST | `/api/users` | admin | Create a user (any role) |
| PATCH | `/api/users/:id` | admin | Update name/role/password |
| DELETE | `/api/users/:id` | admin | Delete a user |
| POST | `/api/documents/upload` | student | Upload a document (`file` field) |
| GET | `/api/documents/my` | student | Own documents |
| GET | `/api/documents/all` | admin, counsellor | All documents (filterable) |
| GET | `/api/documents/:id` | owner or staff | Document metadata |
| GET | `/api/documents/:id/file` | owner or staff | Stream the file (access-controlled) |
| PATCH | `/api/documents/:id/status` | admin, counsellor | Approve/reject + remarks |

JWT is sent as `Authorization: Bearer <token>`. Auth endpoints are rate-limited.

---

## 3. Local development

**Prerequisites:** Node.js 18+ and a PostgreSQL database (local, or a free
Neon/Supabase instance).

```bash
# --- Backend ---
cd backend
cp .env.example .env            # then edit DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                    # prints the first admin's email + password
npm run dev                     # API on http://127.0.0.1:4000

# --- Frontend (second terminal) ---
cd frontend
cp .env.example .env            # VITE_API_BASE can stay empty (dev proxy)
npm install
npm run dev                     # SPA on http://127.0.0.1:5173
```

The Vite dev server proxies `/api` to the backend, so both share an origin.

---

## 4. Environment variables

**backend/.env**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default 4000) |
| `JWT_SECRET` | Long random secret — `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | Public frontend origin (your domain in prod) |
| `UPLOAD_DIR` | Upload folder (default `./uploads`) |
| `MAX_UPLOAD_MB` | Max file size in MB (default 10) |

> In production the backend **refuses to start** if `JWT_SECRET` is left at the
> insecure default.

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_API_BASE` | Leave empty to use same origin (Nginx proxies `/api`). Set a full URL only for split-host setups. |

---

## 5. Production deployment (Ubuntu VPS)

### 5.1 Install system packages
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -   # Node 20 LTS
sudo apt install -y nodejs nginx
sudo npm install -g pm2
# PostgreSQL: install locally OR use a free Neon/Supabase database.
sudo apt install -y postgresql          # (skip if using Neon/Supabase)
```

### 5.2 Get the code & configure
```bash
sudo mkdir -p /var/www && cd /var/www
# copy/clone the project so you have /var/www/student-doc-vps
cd student-doc-vps/backend
cp .env.example .env && nano .env       # set DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npm ci --omit=dev
npx prisma migrate deploy               # apply migrations to the production DB
npx prisma generate
npm run seed                            # note the printed admin credentials
```

### 5.3 Build the frontend
```bash
cd ../frontend
cp .env.example .env                    # VITE_API_BASE empty (same-origin)
npm ci
npm run build                           # outputs frontend/dist
sudo mkdir -p /var/www/student-docs
sudo cp -r dist/* /var/www/student-docs/
```

### 5.4 Start the API with PM2
```bash
cd /var/www/student-doc-vps
pm2 start ecosystem.config.js
pm2 save
pm2 startup                             # run the printed command to enable on boot
```

### 5.5 Configure Nginx
```bash
sudo cp nginx.conf /etc/nginx/sites-available/student-docs
# edit server_name (and root is /var/www/student-docs)
sudo ln -s /etc/nginx/sites-available/student-docs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5.6 HTTPS (recommended)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5.7 Updating later
```bash
# backend
cd /var/www/student-doc-vps/backend && git pull && npm ci --omit=dev \
  && npx prisma migrate deploy && pm2 restart student-doc-api
# frontend
cd ../frontend && git pull && npm ci && npm run build \
  && sudo cp -r dist/* /var/www/student-docs/
```

---

## 6. Security & performance notes

- **Auth:** bcrypt password hashing (pure-JS `bcryptjs`, no native build),
  JWT bearer tokens, role checks on every protected route, rate-limited login.
- **Files:** randomized on-disk names, type allow-list (PDF/JPG/PNG/WEBP), size
  limit enforced by Multer *and* validated client-side, served only through an
  auth + ownership checked route with path-traversal protection. The DB stores an
  API path (`/api/documents/:id/file`), never a filesystem path.
- **No default credentials:** the first admin is created by the seed from env
  vars, or with a one-time random password printed to the console.
- **Low-resource friendly:** single Prisma client, single PM2 fork instance,
  `max_memory_restart` guard, indexed queries with selected fields only, helmet,
  small frontend bundle, and a static SPA that Nginx serves directly (no SSR).

---

## 7. Quick smoke test (after deploy)

```bash
curl https://your-domain.com/api/health          # {"ok":true,...}
# log in as the seeded admin in the browser, create a counsellor + a student,
# register/upload as the student, then approve/reject as the counsellor.
```
