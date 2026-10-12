import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export interface AuthUser {
  id: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface DecodedToken {
  userId?: string;
  id?: string;
  role: string;
  email?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      res.status(403).json({ error: 'Invalid token payload' });
      return;
    }

    let email = decoded.email;
    let role = decoded.role;

    // Fallback if token is from an older session lacking email or role
    if (!email || !role) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      });
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      email = user.email;
      role = user.role;
    }

    req.user = {
      id: userId,
      role,
      email,
    };

    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

