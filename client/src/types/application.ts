import type { Job } from './job';

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

export interface ApplicationCandidate {
  id: string;
  name: string;
  email: string;
  headline?: string | null;
  bio?: string | null;
  resumeUrl?: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  resumeUrl: string;
  coverNote?: string | null;
  notes?: string | null;
  createdAt: string;
  job?: Job;
  candidate?: ApplicationCandidate;
}

export interface RecruiterJobWithApplications extends Job {
  applications: Application[];
}

export interface ApplyPayload {
  resumeUrl: string;
  coverNote?: string;
}

