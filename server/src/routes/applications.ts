import { Router, Request, Response } from 'express';
import { ApplicationStatus } from '@prisma/client';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sendApplicationStatusEmail } from '../utils/email';

const router = Router();

// POST /api/jobs/:id/apply - Candidate applies to a job
// Also mapped to /:id/apply when mounted under /api/jobs
router.post(
  ['/jobs/:id/apply', '/:id/apply'],
  authenticateToken,
  requireRole(['CANDIDATE']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawId = req.params.id;
      const jobId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!jobId || typeof jobId !== 'string') {
        res.status(400).json({ error: 'Job ID is required' });
        return;
      }

      const { resumeUrl, coverNote, notes } = req.body;

      if (!resumeUrl || typeof resumeUrl !== 'string' || !resumeUrl.trim()) {
        res.status(400).json({ error: 'Resume URL is required' });
        return;
      }

      // Verify target job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const candidateId = req.user!.id;

      // Check if application already exists
      const existingApplication = await prisma.application.findUnique({
        where: {
          jobId_candidateId: {
            jobId,
            candidateId,
          },
        },
      });

      if (existingApplication) {
        res.status(400).json({ error: 'You have already applied for this position' });
        return;
      }

      const finalNotes = (coverNote || notes || '').trim() || null;

      // Create application
      const application = await prisma.application.create({
        data: {
          jobId,
          candidateId,
          resumeUrl: resumeUrl.trim(),
          notes: finalNotes,
          status: ApplicationStatus.PENDING,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              type: true,
              salary: true,
            },
          },
        },
      });

      res.status(201).json({
        ...application,
        coverNote: application.notes,
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      res.status(500).json({ error: 'Internal server error while submitting application' });
    }
  }
);

// GET /api/applications/my - Candidate views their submitted applications
router.get(
  ['/applications/my', '/my'],
  authenticateToken,
  requireRole(['CANDIDATE']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const candidateId = req.user!.id;

      const applications = await prisma.application.findMany({
        where: { candidateId },
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              type: true,
              salary: true,
              recruiter: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const response = applications.map((app) => ({
        ...app,
        coverNote: app.notes,
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching candidate applications:', error);
      res.status(500).json({ error: 'Internal server error while fetching your applications' });
    }
  }
);

// GET /api/applications/recruiter - Recruiter views jobs & candidate applicants
router.get(
  ['/applications/recruiter', '/recruiter'],
  authenticateToken,
  requireRole(['RECRUITER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const recruiterId = req.user!.id;

      const jobs = await prisma.job.findMany({
        where: { recruiterId },
        orderBy: { createdAt: 'desc' },
        include: {
          applications: {
            orderBy: { createdAt: 'desc' },
            include: {
              candidate: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  headline: true,
                  bio: true,
                  resumeUrl: true,
                },
              },
            },
          },
        },
      });

      const response = jobs.map((job) => ({
        ...job,
        applications: job.applications.map((app) => ({
          ...app,
          coverNote: app.notes,
        })),
      }));

      res.json(response);
    } catch (error) {
      console.error('Error fetching recruiter applications:', error);
      res.status(500).json({ error: 'Internal server error while fetching applicant data' });
    }
  }
);

// PATCH /api/applications/:id/status - Recruiter updates application review status
router.patch(
  ['/applications/:id/status', '/:id/status'],
  authenticateToken,
  requireRole(['RECRUITER']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const rawId = req.params.id;
      const applicationId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!applicationId || typeof applicationId !== 'string') {
        res.status(400).json({ error: 'Application ID is required' });
        return;
      }

      const { status } = req.body;

      if (!status || !Object.values(ApplicationStatus).includes(status)) {
        res.status(400).json({
          error: `Invalid status. Must be one of: ${Object.values(ApplicationStatus).join(', ')}`,
        });
        return;
      }

      // Find application and check job ownership
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            select: {
              id: true,
              recruiterId: true,
              title: true,
              company: true,
            },
          },
        },
      });

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      if (application.job.recruiterId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden: You do not have permission to manage this application' });
        return;
      }

      // Update status
      const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status: status as ApplicationStatus },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              headline: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },
      });

      // Await candidate notification email dispatch before sending response (prevents Vercel serverless freeze)
      if (['REVIEWED', 'ACCEPTED', 'REJECTED'].includes(status)) {
        try {
          await sendApplicationStatusEmail(
            updatedApplication.candidate.email,
            updatedApplication.candidate.name,
            updatedApplication.job.title,
            updatedApplication.job.company,
            status as 'REVIEWED' | 'ACCEPTED' | 'REJECTED'
          );
        } catch (emailError) {
          console.error('[STATUS EMAIL ERROR] Failed to dispatch candidate status email:', emailError);
          // Graceful handling: logs error without failing the HTTP response or interrupting status update
        }
      }

      res.status(200).json({
        ...updatedApplication,
        coverNote: updatedApplication.notes,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ error: 'Internal server error while updating application status' });
    }
  }
);

export default router;

