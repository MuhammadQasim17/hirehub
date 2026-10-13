import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prisma';
import authRouter from './routes/auth';
import jobsRouter from './routes/jobs';
import applicationsRouter from './routes/applications';
import profileRouter from './routes/profile';
import supportRouter from './routes/support';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Dynamic CORS configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Match allowed origins or deployment preview domains (Vercel, Netlify)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api', applicationsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/support', supportRouter);

// Root fallback health route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    message: 'HireHub API Server is online and healthy',
  });
});

// Detailed API health route
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      message: 'HireHub API & PostgreSQL are connected and running smoothly',
      registeredUsers: userCount,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      environment: process.env.NODE_ENV || 'development',
      message: 'Failed to connect to the database',
    });
  }
});

app.listen(PORT, () => {
  console.log(`HireHub backend server listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});