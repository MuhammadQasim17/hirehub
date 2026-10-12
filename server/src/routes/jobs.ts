import { Router, Request, Response } from 'express';
import { JobType, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/jobs - Public endpoint with search and filtering
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, location, type } = req.query;

    const where: Prisma.JobWhereInput = {};

    // Search query: case-insensitive match on title or company
    if (typeof search === 'string' && search.trim()) {
      const trimmedSearch = search.trim();
      where.OR = [
        { title: { contains: trimmedSearch, mode: 'insensitive' } },
        { company: { contains: trimmedSearch, mode: 'insensitive' } },
      ];
    }

    // Location query: case-insensitive match
    if (typeof location === 'string' && location.trim()) {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }

    // Type query: exact match on JobType enum
    if (typeof type === 'string' && type.trim()) {
      const upperType = type.trim().toUpperCase();
      if (Object.values(JobType).includes(upperType as JobType)) {
        where.type = upperType as JobType;
      }
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error while fetching jobs' });
  }
});

// GET /api/jobs/:id - Public endpoint for single job detail
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            headline: true,
            bio: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ error: 'Internal server error while fetching job details' });
  }
});

// POST /api/jobs - Protected endpoint for recruiters to publish jobs
router.post(
  '/',
  authenticateToken,
  requireRole(['RECRUITER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, company, location, type, salary, description } = req.body;

      // Validation
      if (!title || !title.trim()) {
        res.status(400).json({ error: 'Job title is required' });
        return;
      }

      if (!company || !company.trim()) {
        res.status(400).json({ error: 'Company name is required' });
        return;
      }

      if (!location || !location.trim()) {
        res.status(400).json({ error: 'Job location is required' });
        return;
      }

      if (!description || !description.trim()) {
        res.status(400).json({ error: 'Job description is required' });
        return;
      }

      let parsedType: JobType = JobType.FULL_TIME;
      if (type) {
        const upperType = String(type).trim().toUpperCase();
        if (Object.values(JobType).includes(upperType as JobType)) {
          parsedType = upperType as JobType;
        } else {
          res.status(400).json({
            error: `Invalid job type. Must be one of: ${Object.values(JobType).join(', ')}`,
          });
          return;
        }
      }

      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const createdJob = await prisma.job.create({
        data: {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          type: parsedType,
          salary: salary && String(salary).trim() ? String(salary).trim() : null,
          description: description.trim(),
          recruiterId: req.user.id,
        },
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(createdJob);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Internal server error while creating job' });
    }
  }
);

export default router;

