export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'INTERNSHIP';

export interface JobRecruiter {
  id?: string;
  name: string;
  email: string;
  headline?: string | null;
  bio?: string | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary?: string | null;
  description: string;
  createdAt: string;
  updatedAt?: string;
  recruiterId?: string;
  recruiter?: JobRecruiter;
}

export interface CreateJobPayload {
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary?: string;
  description: string;
}

