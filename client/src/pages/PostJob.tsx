import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { JobType, CreateJobPayload } from '../types/job';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const PostJob: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<JobType>('FULL_TIME');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Guard page for Authenticated Recruiters
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true, state: { from: '/post-job' } });
      } else if (user?.role !== 'RECRUITER') {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a job title.');
      return;
    }

    if (!company.trim()) {
      setErrorMessage('Please enter your company name.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please specify the job location (e.g., "Remote", "New York, NY").');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please provide a detailed job description.');
      return;
    }

    if (description.trim().length < 20) {
      setErrorMessage('Description should be at least 20 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateJobPayload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        salary: salary.trim() || undefined,
        description: description.trim(),
      };

      await api.post('/jobs', payload);

      setSuccessMessage('Job opening published successfully! Redirecting to job board...');
      setTimeout(() => {
        navigate('/jobs');
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverError =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to publish job. Please verify your information and try again.';
        setErrorMessage(serverError);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred while posting the job.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Board</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Post a New Job Opening
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Reach verified candidates looking for their next impactful role on HireHub.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm animate-fade-in"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm animate-fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Title & Company Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Job Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    id="company"
                    type="text"
                    required
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Acme Innovations Inc."
                    className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Location & Job Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. Remote, or San Francisco, CA"
                    className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Job Type Select */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as JobType)}
                  className="block w-full px-3.5 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="REMOTE">Remote</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Salary / Compensation (Optional)
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  id="salary"
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $130,000 - $160,000 / yr"
                  className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Detailed Job Description <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Supports multi-line formatting</span>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <textarea
                  id="description"
                  required
                  rows={8}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Describe role responsibilities, core skills, technology stack, requirements, and company perks..."
                  className="block w-full p-3.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Recruiter info notice */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  This listing will be associated with your recruiter profile ({user?.name} - {user?.email}).
                </span>
              </div>
              <span className="font-semibold text-indigo-700">Recruiter Verified</span>
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                to="/jobs"
                className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Opening...</span>
                  </>
                ) : (
                  <span>Publish Job Opening</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;

