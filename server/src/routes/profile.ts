import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/profile/me - Authenticated user fetches their full profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        headline: true,
        resumeUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
});

// PUT /api/profile/me - Authenticated user updates their profile details
router.put('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, headline, bio, resumeUrl } = req.body;

    const updateData: Prisma.UserUpdateInput = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'Name cannot be empty' });
        return;
      }
      updateData.name = name.trim();
    }

    if (headline !== undefined) {
      updateData.headline = typeof headline === 'string' && headline.trim() ? headline.trim() : null;
    }

    if (bio !== undefined) {
      updateData.bio = typeof bio === 'string' && bio.trim() ? bio.trim() : null;
    }

    if (resumeUrl !== undefined) {
      updateData.resumeUrl = typeof resumeUrl === 'string' && resumeUrl.trim() ? resumeUrl.trim() : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        headline: true,
        resumeUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error while updating profile' });
  }
});

// GET /api/profile/:id - Authenticated users inspect public profile details
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const profileId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!profileId || typeof profileId !== 'string') {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        role: true,
        headline: true,
        bio: true,
        resumeUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ error: 'Internal server error while fetching public profile' });
  }
});

export default router;

