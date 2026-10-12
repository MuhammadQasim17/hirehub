# HireHub API Backend - Production Deployment Guide

This backend is built with Node.js, Express, TypeScript, and Prisma ORM connecting to PostgreSQL.

## Production Configuration (Render / Railway / VPS)

### Render Web Service Setup (Zero-Dollar Tier)
1. **Repository Root Directory**: `server`
2. **Environment**: `Node`
3. **Build Command**:
   ```bash
   npm install && npm run build && npx prisma migrate deploy
   ```
4. **Start Command**:
   ```bash
   npm run start
   ```

### Required Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Listening port (assigned by host) | `5000` |
| `DATABASE_URL` | PostgreSQL connection string (Neon, Supabase, Render Postgres) | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Cryptographic secret for signing JWT auth tokens | `a_strong_random_secret_string` |
| `FRONTEND_URL` | Production client URL for CORS authorization | `https://hirehub.vercel.app` |

### Health Check Endpoints
- **Root**: `GET /` -> Returns `{ "status": "ok", "environment": "production" }`
- **Database & Services**: `GET /api/health` -> Verifies PostgreSQL connection and active user count.

