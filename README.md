# 💼 HireHub - Modern Full-Stack Recruitment Platform

HireHub is a production-ready, full-stack recruitment platform connecting top software engineering and product talent with verified employers. Built with modern TypeScript across both the frontend and backend, HireHub streamlines the entire hiring journey from role discovery to multi-stage applicant pipelines.

---

## 🏛 Architecture Overview

```mermaid
graph TD
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI["Tailwind CSS v4 & Lucide Icons"]
        Router["React Router v7"]
        AuthContext["Auth Context & Token Persistence"]
        Axios["Axios (Dynamic Bearer Interceptor)"]
    end

    subgraph Server["Backend API (Express + TypeScript)"]
        AuthRoute["/api/auth (Login & Registration)"]
        JobRoute["/api/jobs (Search & Filter Engine)"]
        AppRoute["/api/applications (Candidate & Recruiter Pipeline)"]
        ProfileRoute["/api/profile (Candidate & Employer Profiles)"]
        AuthMiddleware["authenticateToken & requireRole Guards"]
    end

    subgraph Database["PostgreSQL Database"]
        Prisma["Prisma ORM Client"]
        Tables["User | Job | Application"]
    end

    UI --> Router
    Router --> AuthContext
    AuthContext --> Axios
    Axios -->|HTTP + JWT Bearer| Server
    Server --> AuthMiddleware
    AuthMiddleware --> AuthRoute & JobRoute & AppRoute & ProfileRoute
    AuthRoute & JobRoute & AppRoute & ProfileRoute --> Prisma
    Prisma --> Tables
```

---

## 🚀 Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, bcryptjs, jsonwebtoken, CORS |
| **Database** | PostgreSQL (Relational schema with referential cascading and unique constraints) |
| **Deployment** | Vercel / Netlify (Client SPA rewrite) + Render / Railway (Zero-dollar backend tier) |

---

## ✨ Features by Phase

- **Phase 1: Authentication & Navigation Infrastructure**
  - JWT Bearer session management with persistent `localStorage` synchronization.
  - Role-based separation (`CANDIDATE` vs `RECRUITER`) with tailored navigation bars and mobile drawer menus.
  - Form validation with animated error banners and show/hide password toggles.

- **Phase 2: Job Listing & Candidate Browsing**
  - Search engine supporting title, company keywords, and location filters.
  - Job type categorization (`FULL_TIME`, `PART_TIME`, `REMOTE`, `INTERNSHIP`).
  - Desktop split-view layout with sticky preview pane and mobile modal drawer.
  - Recruiter job publishing interface with field validation.

- **Phase 3: Applications & Recruiter Dashboard**
  - 1-click candidate application modal with custom resume links and optional cover notes.
  - Candidate portal (`/my-applications`) tracking real-time application statuses (`PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`).
  - Recruiter portal (`/dashboard`) featuring metric counters, job opening filter tabs, and optimistic status updates.

- **Phase 4: Candidate Profiles & Resume Management**
  - Profile management (`/profile`) supporting headlines, bios, and default resume links.
  - Automatic pre-fill of candidate resumes into the application modal.
  - Public recruiter inspection of applicant profiles.

- **Phase 5: Zero-Dollar Production Deployment**
  - Dynamic CORS handling for production domains and staging previews.
  - Render Blueprint (`render.yaml`) and Vercel/Netlify SPA fallback rules (`vercel.json`, `_redirects`).
  - Automated smoke test suite ensuring 100% API uptime.

---

## 🔑 Demo Credentials

All test accounts are pre-seeded with the password: **`Password123!`**

| Role | Name | Email | Organization / Headline |
| :--- | :--- | :--- | :--- |
| **Recruiter** | Sarah Jenkins | `sarah@techcorp.io` | CloudScale Tech (Senior Recruiter) |
| **Recruiter** | Alex Rivera | `alex@fintechpulse.com` | NovaPay Solutions (Talent Acquisition Lead) |
| **Candidate** | Jane Doe | `jane.candidate@example.com` | Full-Stack Developer (React, TypeScript & Node.js) |
| **Candidate** | John Smith | `john.candidate@example.com` | Junior Frontend Engineer (React & Tailwind CSS) |

---

## 🛠 Quick Start Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Running locally or hosted on Neon/Supabase

### 2. Environment Setup

#### Backend (`server/.env`)
Create `server/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hirehub_db?schema=public"
PORT=5000
JWT_SECRET="hirehub_super_secret_jwt_key_2026"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

#### Frontend (`client/.env`)
Create `client/.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```

---

### 3. Database Initialization & Seeding

Navigate to the `server/` directory, generate the Prisma client, and seed the database:

```bash
cd server
npm install
npm run seed
```

This populates:
- 2 Recruiters (`sarah@techcorp.io`, `alex@fintechpulse.com`)
- 2 Candidates (`jane.candidate@example.com`, `john.candidate@example.com`)
- 6 Realistic Job Listings (Remote, Full-Time, Internship, Part-Time)
- 2 Initial Candidate Applications with statuses

---

### 4. Running Development Servers

Open two terminal windows:

#### Terminal 1 (Backend API)
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

#### Terminal 2 (Frontend Client)
```bash
cd client
npm install
npm run dev
# Vite client running on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Smoke Testing

Ensure the backend server is running, then run the automated verification suite:

```bash
cd server
npm run smoke:test
```

**Test Coverage:**
1. ✅ Health check & database connection (`GET /health`)
2. ✅ Recruiter authentication & JWT issuance (`POST /auth/login`)
3. ✅ Query 6 seeded job listings with filters (`GET /jobs`)
4. ✅ Candidate authentication & session validation (`POST /auth/login`)
5. ✅ Query candidate submitted applications (`GET /applications/my`)
6. ✅ Verify recruiter candidate pipelines (`GET /applications/recruiter`)

---

## 📦 Production Builds

```bash
# Build Backend
cd server
npm run build # Generates dist/ via prisma generate && tsc

# Build Frontend
cd client
npm run build # Generates optimized static assets via tsc -b && vite build
```

---

## 📄 License
ISC License. Built for modern developer hiring.

