export type Role = 'CANDIDATE' | 'RECRUITER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  headline?: string;
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

