import { Router, Request, Response } from 'express';
import { JobType, JobStatus, Prisma } from '@prisma/client';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/jobs - Public endpoint with search and filtering
// Filters where status = 'ACTIVE' AND (deadline IS NULL OR deadline >= now)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, location, type } = req.query;

    const now = new Date();
    const andConditions: Prisma.JobWhereInput[] = [
      { status: JobStatus.ACTIVE },
      {
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
    ];

    // Search query: case-insensitive match on title or company
    if (typeof search === 'string' && search.trim()) {
      const trimmedSearch = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: trimmedSearch, mode: 'insensitive' } },
          { company: { contains: trimmedSearch, mode: 'insensitive' } },
        ],
      });
    }

    // Location query: case-insensitive match
    if (typeof location === 'string' && location.trim()) {
      andConditions.push({
        location: { contains: location.trim(), mode: 'insensitive' },
      });
    }

    // Type query: exact match on JobType enum
    if (typeof type === 'string' && type.trim()) {
      const upperType = type.trim().toUpperCase();
      if (Object.values(JobType).includes(upperType as JobType)) {
        andConditions.push({
          type: upperType as JobType,
        });
      }
    }

    const where: Prisma.JobWhereInput = {
      AND: andConditions,
    };

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
      const { title, company, location, type, salary, description, deadline } = req.body;

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

      let parsedDeadline: Date | null = null;
      if (deadline) {
        const d = new Date(deadline);
        if (isNaN(d.getTime())) {
          res.status(400).json({ error: 'Invalid deadline date format' });
          return;
        }
        parsedDeadline = d;
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
          deadline: parsedDeadline,
          status: JobStatus.ACTIVE,
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

// PATCH /api/jobs/:id/status - Recruiter toggles status between ACTIVE and CLOSED
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['RECRUITER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawId = req.params.id;
      const jobId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!jobId || typeof jobId !== 'string') {
        res.status(400).json({ error: 'Job ID is required' });
        return;
      }

      const { status } = req.body;

      if (!status || !['ACTIVE', 'CLOSED'].includes(status)) {
        res.status(400).json({
          error: "Invalid status. Must be 'ACTIVE' or 'CLOSED'",
        });
        return;
      }

      // Check job ownership
      const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!existingJob) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (existingJob.recruiterId !== req.user!.id) {
        res.status(403).json({
          error: 'Forbidden: You do not have permission to manage this job listing',
        });
        return;
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: status as JobStatus,
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

      res.json(updatedJob);
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({ error: 'Internal server error while updating job status' });
    }
  }
);

export default router;

