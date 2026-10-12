import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import type { Job, JobType } from '../types/job';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  X,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  Send,
  ShieldAlert,
} from 'lucide-react';

export const Jobs: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Mobile detail drawer/modal state
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Application Modal & Form State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Trigger counter for manual reload / retry
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch candidate's existing applications to mark applied jobs
  useEffect(() => {
    let active = true;

    if (isAuthenticated && user?.role === 'CANDIDATE') {
      api
        .get<Array<{ jobId: string }>>('/applications/my')
        .then((res) => {
          if (active) {
            setAppliedJobIds(new Set(res.data.map((app) => app.jobId)));
          }
        })
        .catch(() => {
          // Non-critical, ignore
        });
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.role]);

  // Fetch jobs list
  useEffect(() => {
    let active = true;

    const runFetch = async () => {
      try {
        const params: Record<string, string> = {};
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }
        if (locationFilter.trim()) {
          params.location = locationFilter.trim();
        }
        if (typeFilter && typeFilter !== 'ALL') {
          params.type = typeFilter;
        }

        const response = await api.get<Job[]>('/jobs', { params });
        if (!active) return;

        setJobs(response.data);
        setErrorMessage(null);

        // Auto-select first job if current selection is not in list or none selected
        if (response.data.length > 0) {
          setSelectedJob((prev) => {
            if (prev && response.data.some((j) => j.id === prev.id)) {
              return response.data.find((j) => j.id === prev.id) || response.data[0];
            }
            return response.data[0];
          });
        } else {
          setSelectedJob(null);
        }
      } catch {
        if (!active) return;
        setErrorMessage('Failed to load jobs. Please check your connection and try again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void runFetch();

    return () => {
      active = false;
    };
  }, [searchTerm, locationFilter, typeFilter, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setIsMobileDetailOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('ALL');
  };

  const handleOpenApplyModal = (job: Job) => {
    setSelectedJob(job);
    setResumeUrl(user?.resumeUrl || '');
    setCoverNote('');
    setApplyError(null);
    setApplySuccess(null);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeUrl.trim()) {
      setApplyError('Please provide a valid resume link (URL).');
      return;
    }

    setIsSubmittingApp(true);
    setApplyError(null);

    try {
      await api.post(`/jobs/${selectedJob.id}/apply`, {
        resumeUrl: resumeUrl.trim(),
        coverNote: coverNote.trim() || undefined,
      });

      setApplySuccess('Application submitted successfully!');
      setAppliedJobIds((prev) => new Set([...prev, selectedJob.id]));

      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(null);
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApplyError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to submit application. Please try again.'
        );
      } else {
        setApplyError('An unexpected error occurred while submitting.');
      }
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const formatRelativeTime = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 30) {
        return date.toLocaleDateString();
      } else if (diffDays > 0) {
        return `${diffDays}d ago`;
      } else if (diffHours > 0) {
        return `${diffHours}h ago`;
      } else if (diffMins > 0) {
        return `${diffMins}m ago`;
      } else {
        return 'Just now';
      }
    } catch {
      return 'Recently';
    }
  };

  const formatJobType = (type: JobType): string => {
    switch (type) {
      case 'FULL_TIME':
        return 'Full-time';
      case 'PART_TIME':
        return 'Part-time';
      case 'REMOTE':
        return 'Remote';
      case 'INTERNSHIP':
        return 'Internship';
      default:
        return type;
    }
  };

  const getJobTypeBadgeClasses = (type: JobType): string => {
    switch (type) {
      case 'FULL_TIME':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REMOTE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PART_TIME':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'INTERNSHIP':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner / Hero Search Area */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Your Next Career Move
            </h1>
            <p className="mt-1 text-slate-600 text-sm sm:text-base">
              Explore open engineering, design, and management opportunities verified by HireHub employers.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Keyword Search */}
            <div className="sm:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm text-slate-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Location Filter */}
            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location (e.g. Remote, NY)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm text-slate-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Job Type Select */}
            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="ALL">All Job Types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="REMOTE">Remote</option>
                <option value="PART_TIME">Part-time</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {(searchTerm || locationFilter || typeFilter !== 'ALL') && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
                  Keyword: &quot;{searchTerm}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="hover:text-indigo-900 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
                  Location: &quot;{locationFilter}&quot;
                  <button
                    type="button"
                    onClick={() => setLocationFilter('')}
                    className="hover:text-indigo-900 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
                  Type: {formatJobType(typeFilter as JobType)}
                  <button
                    type="button"
                    onClick={() => setTypeFilter('ALL')}
                    className="hover:text-indigo-900 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Board Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-medium rounded-lg text-xs cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs animate-pulse space-y-3"
                >
                  <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                    <div className="h-6 bg-gray-200 rounded-full w-24" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block lg:col-span-7">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xs animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded-md w-2/3" />
                <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                <div className="h-24 bg-gray-200 rounded-md w-full" />
                <div className="h-48 bg-gray-200 rounded-md w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && jobs.length === 0 && !errorMessage && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs match your search</h3>
            <p className="text-sm text-slate-600 mb-6">
              We couldn&apos;t find any positions matching your selected keywords or filters.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
              >
                Reset Filters
              </button>
              {user?.role === 'RECRUITER' && (
                <Link
                  to="/post-job"
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Post a Job Opening
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Loaded Content: Split View on Large Screens */}
        {!isLoading && jobs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Job Cards List */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Available
                </span>
                {user?.role === 'RECRUITER' && (
                  <Link
                    to="/post-job"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    + Post Job
                  </Link>
                )}
              </div>

              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const isApplied = appliedJobIds.has(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/15'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isSelected && (
                      <div className="absolute top-4 left-0 bottom-4 w-1 bg-indigo-600 rounded-r-full" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{job.company}</span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {job.title}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getJobTypeBadgeClasses(
                            job.type
                          )}`}
                        >
                          {formatJobType(job.type)}
                        </span>
                        {isApplied && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Applied
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-400 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatRelativeTime(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Sticky Job Detail Panel (Desktop) */}
            <div className="hidden lg:block lg:col-span-7 sticky top-24">
              {selectedJob ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs flex flex-col max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-1">
                        <Building2 className="w-4 h-4" />
                        <span>{selectedJob.company}</span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {selectedJob.title}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {selectedJob.location}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getJobTypeBadgeClasses(
                            selectedJob.type
                          )}`}
                        >
                          {formatJobType(selectedJob.type)}
                        </span>
                        {selectedJob.salary && (
                          <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
                            <DollarSign className="w-3.5 h-3.5" />
                            {selectedJob.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Posted {formatRelativeTime(selectedJob.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Apply Now Action Button */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {user?.role === 'RECRUITER' ? (
                        <div className="relative group">
                          <button
                            type="button"
                            disabled
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-400 bg-gray-100 border border-gray-200 cursor-not-allowed text-sm"
                          >
                            Recruiter View
                          </button>
                          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg z-20">
                            Recruiters cannot apply to jobs
                          </div>
                        </div>
                      ) : appliedJobIds.has(selectedJob.id) ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 cursor-default text-sm shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenApplyModal(selectedJob)}
                          className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer text-sm"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recruiter Summary Card */}
                  {selectedJob.recruiter && (
                    <div className="my-5 p-4 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Posted by Recruiter: </span>
                        <span className="font-bold text-slate-800">
                          {selectedJob.recruiter.name}
                        </span>
                        {selectedJob.recruiter.headline && (
                          <span className="text-slate-500"> • {selectedJob.recruiter.headline}</span>
                        )}
                      </div>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Verified Employer
                      </span>
                    </div>
                  )}

                  {/* Job Description Body */}
                  <div className="pt-2 flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                      About this position
                    </h3>
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4 font-normal">
                      {selectedJob.description}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Job ID: <span className="font-mono text-slate-700">{selectedJob.id}</span>
                    </span>
                    {!appliedJobIds.has(selectedJob.id) && user?.role !== 'RECRUITER' && (
                      <button
                        type="button"
                        onClick={() => handleOpenApplyModal(selectedJob)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <span>Submit your application</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-slate-500 shadow-2xs">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Select a job card on the left to read full details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Job Details Drawer / Modal */}
      {isMobileDetailOpen && selectedJob && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header / Close button */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="text-xs font-semibold text-indigo-600 mb-1">
                  {selectedJob.company}
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedJob.title}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {selectedJob.location}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full border ${getJobTypeBadgeClasses(
                      selectedJob.type
                    )}`}
                  >
                    {formatJobType(selectedJob.type)}
                  </span>
                  {selectedJob.salary && (
                    <span className="font-semibold text-emerald-700">
                      {selectedJob.salary}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDetailOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-gray-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recruiter info */}
            {selectedJob.recruiter && (
              <div className="my-4 p-3 rounded-xl bg-slate-50 border border-gray-200 text-xs text-slate-700">
                Posted by: <span className="font-bold">{selectedJob.recruiter.name}</span>
              </div>
            )}

            {/* Description */}
            <div className="py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Job Description
              </h3>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedJob.description}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              {user?.role === 'RECRUITER' ? (
                <div className="flex-1 py-3 text-center text-xs text-slate-500 bg-gray-100 rounded-xl font-medium">
                  Recruiters cannot apply
                </div>
              ) : appliedJobIds.has(selectedJob.id) ? (
                <div className="flex-1 py-3 text-center rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Already Applied</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDetailOpen(false);
                    handleOpenApplyModal(selectedJob);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md text-sm cursor-pointer"
                >
                  Apply Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileDetailOpen(false)}
                className="px-5 py-3 rounded-xl font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Application Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Apply to {selectedJob.company}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Position: <span className="text-slate-800">{selectedJob.title}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Not Authenticated */}
            {!isAuthenticated ? (
              <div className="py-6 text-center space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-left flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Authentication Required</div>
                    <div>Please sign in or create a candidate account to submit your application.</div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link
                    to="/login"
                    state={{ from: '/jobs' }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-sm text-center shadow-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register?role=CANDIDATE"
                    className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 text-sm text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : user?.role === 'RECRUITER' ? (
              <div className="py-6 text-center space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-left flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Recruiter Account</div>
                    <div>You are currently signed in as a Recruiter. Only Candidates can submit job applications.</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="w-full py-2.5 rounded-xl font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 text-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Authenticated Candidate Form */
              <form onSubmit={handleApplySubmit} className="pt-5 space-y-4" noValidate>
                {/* Success Banner */}
                {applySuccess && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{applySuccess}</span>
                  </div>
                )}

                {/* Error Banner */}
                {applyError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">{applyError}</div>
                  </div>
                )}

                {/* Resume URL Field */}
                <div>
                  <label
                    htmlFor="resumeUrl"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Resume or Portfolio Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <input
                      id="resumeUrl"
                      type="url"
                      required
                      value={resumeUrl}
                      onChange={(e) => {
                        setResumeUrl(e.target.value);
                        if (applyError) setApplyError(null);
                      }}
                      placeholder="https://drive.google.com/your-resume or https://yoursite.com/cv.pdf"
                      className="block w-full pl-10 pr-4 py-2.5 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {user?.resumeUrl ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Auto-filled from your profile default resume</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-indigo-700 bg-indigo-50/80 border border-indigo-100 rounded-lg px-2.5 py-1.5">
                      <span>Tip: Add a default resume in your profile to auto-fill future applications.</span>
                      <Link to="/profile" className="font-bold underline hover:text-indigo-900 ml-1.5 shrink-0">
                        Edit Profile
                      </Link>
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-slate-500">
                    Google Drive, Notion, Dropbox, or personal portfolio PDF link.
                  </p>
                </div>

                {/* Cover Note Textarea */}
                <div>
                  <label
                    htmlFor="coverNote"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Cover Note (Optional)
                  </label>
                  <textarea
                    id="coverNote"
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Introduce yourself, share your primary stack, or describe why you are excited for this role..."
                    className="block w-full p-3 text-slate-900 bg-white border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApp || Boolean(applySuccess)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmittingApp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
