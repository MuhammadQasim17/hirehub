import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { RecruiterJobWithApplications, ApplicationStatus, Application } from '../types/application';
import type { JobStatus } from '../types/job';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<RecruiterJobWithApplications[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Guard page: Recruiter only
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true, state: { from: '/dashboard' } });
      } else if (user?.role !== 'RECRUITER') {
        navigate('/my-applications', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  useEffect(() => {
    let active = true;

    const fetchRecruiterData = async () => {
      try {
        const response = await api.get<RecruiterJobWithApplications[]>('/applications/recruiter');
        if (!active) return;
        setJobs(response.data);
        setErrorMessage(null);
      } catch {
        if (!active) return;
        setErrorMessage('Failed to load applicant pipelines. Please try again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (isAuthenticated && user?.role === 'RECRUITER') {
      void fetchRecruiterData();
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.role, reloadKey]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  };

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Optimistic UI status update
  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    // Snapshot current state for rollback
    const previousJobs = [...jobs];

    // Optimistically update
    setJobs((prevJobs) =>
      prevJobs.map((job) => ({
        ...job,
        applications: job.applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        ),
      }))
    );

    setUpdatingAppId(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
    } catch (err: unknown) {
      // Rollback on failure
      setJobs(previousJobs);
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error || 'Failed to update application status. Reverted.'
        );
      } else {
        setErrorMessage('Failed to update status.');
      }
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleToggleJobStatus = async (jobId: string, newStatus: JobStatus) => {
    const previousJobs = [...jobs];

    // Optimistically update
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
    );

    setUpdatingJobId(jobId);
    try {
      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
    } catch (err: unknown) {
      setJobs(previousJobs);
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.error || 'Failed to update job status. Reverted.'
        );
      } else {
        setErrorMessage('Failed to update job status.');
      }
    } finally {
      setUpdatingJobId(null);
    }
  };

  // Metrics computation
  const allApplications: (Application & { jobTitle?: string; jobCompany?: string })[] =
    jobs.flatMap((job) =>
      job.applications.map((app) => ({
        ...app,
        jobTitle: job.title,
        jobCompany: job.company,
      }))
    );

  const totalJobsCount = jobs.length;
  const totalApplicantsCount = allApplications.length;
  const pendingCount = allApplications.filter((a) => a.status === 'PENDING').length;
  const acceptedCount = allApplications.filter((a) => a.status === 'ACCEPTED').length;

  // Filter applications by selected job tab
  const displayedApplications =
    selectedJobId === 'ALL'
      ? allApplications
      : (jobs.find((j) => j.id === selectedJobId)?.applications || []).map((app) => {
          const matchedJob = jobs.find((j) => j.id === selectedJobId);
          return {
            ...app,
            jobTitle: matchedJob?.title,
            jobCompany: matchedJob?.company,
          };
        });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your job openings, evaluate applicant pipelines, and update hiring statuses.
            </p>
          </div>
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Opening</span>
          </Link>
        </div>

        {/* Error Notification */}
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

        {/* Metrics Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Metric 1 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Jobs Posted</span>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {isLoading ? '...' : totalJobsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Active role listings</div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Candidates</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {isLoading ? '...' : totalApplicantsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Submitted applications</div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {isLoading ? '...' : pendingCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Awaiting decision</div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Accepted Offers</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {isLoading ? '...' : acceptedCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">Shortlisted / Hired</div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />
            ))}
          </div>
        )}

        {/* Empty State: No Jobs Posted */}
        {!isLoading && jobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No jobs posted yet
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Create your first job opening to start receiving applications from verified candidates.
            </p>
            <Link
              to="/post-job"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Job</span>
            </Link>
          </div>
        )}

        {/* Jobs Tabs & Applicants Pipeline */}
        {!isLoading && jobs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Filter Tabs by Job Opening */}
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Filter Pipeline By Job Opening:
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {displayedApplications.length} of {allApplications.length} applicants
                </span>
              </div>

              {/* Scrollable Horizontal Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedJobId('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    selectedJobId === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>All Postings</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      selectedJobId === 'ALL'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-100 text-slate-600'
                    }`}
                  >
                    {allApplications.length}
                  </span>
                </button>

                {jobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  const isClosed = job.status === 'CLOSED';
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setSelectedJobId(job.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isClosed ? 'bg-rose-400' : 'bg-emerald-400'
                        }`}
                        title={isClosed ? 'Listing Closed' : 'Listing Active'}
                      />
                      <span className="max-w-[160px] truncate">{job.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          isSelected
                            ? 'bg-indigo-700 text-white'
                            : 'bg-gray-100 text-slate-600'
                        }`}
                      >
                        {job.applications.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Job Action & Toggle Banner for Specific Selected Job */}
            {selectedJobId !== 'ALL' && (() => {
              const currentJob = jobs.find((j) => j.id === selectedJobId);
              if (!currentJob) return null;
              const isClosed = currentJob.status === 'CLOSED';

              return (
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Opening Status:
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isClosed
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isClosed ? 'CLOSED' : 'ACTIVE'}
                    </span>
                    {currentJob.deadline && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {formatDate(currentJob.deadline)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingJobId === currentJob.id}
                      onClick={() =>
                        handleToggleJobStatus(currentJob.id, isClosed ? 'ACTIVE' : 'CLOSED')
                      }
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isClosed
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-2xs'
                          : 'bg-white text-rose-700 hover:bg-rose-50 border-rose-200 shadow-2xs'
                      }`}
                    >
                      {updatingJobId === currentJob.id
                        ? 'Updating Status...'
                        : isClosed
                        ? 'Reopen Job Opening'
                        : 'Close Job Opening'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Overview: Posted Jobs Management Grid with Toggle Buttons when viewing All */}
            {selectedJobId === 'ALL' && (
              <div className="p-4 sm:p-6 bg-slate-50/40 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Posted Job Openings ({jobs.length})
                  </span>
                  <span className="text-xs text-slate-400">
                    Toggle opening status to Close or Reopen applications
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jobs.map((job) => {
                    const isClosed = job.status === 'CLOSED';
                    return (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {job.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                                isClosed
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {isClosed ? 'CLOSED' : 'ACTIVE'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                            <span>{job.company}</span>
                            {job.deadline && (
                              <span>• Closes {formatDate(job.deadline)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <span className="text-slate-500 font-medium">
                            {job.applications.length} {job.applications.length === 1 ? 'applicant' : 'applicants'}
                          </span>
                          <button
                            type="button"
                            disabled={updatingJobId === job.id}
                            onClick={() =>
                              handleToggleJobStatus(job.id, isClosed ? 'ACTIVE' : 'CLOSED')
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              isClosed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            {updatingJobId === job.id
                              ? 'Updating...'
                              : isClosed
                              ? 'Reopen Job'
                              : 'Close Job'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Applicants List / Table */}
            {displayedApplications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-base font-semibold text-slate-700">No applications received yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate applications submitted for this role will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedApplications.map((app) => {
                  const noteText = app.coverNote || app.notes;
                  const isNoteExpanded = expandedNotes[app.id];
                  const isUpdating = updatingAppId === app.id;

                  return (
                    <div
                      key={app.id}
                      className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col gap-4"
                    >
                      {/* Top candidate row */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Candidate Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {app.candidate?.name || 'Applicant'}
                            </h3>
                            {app.jobTitle && selectedJobId === 'ALL' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                <Building2 className="w-3 h-3" />
                                {app.jobTitle}
                              </span>
                            )}
                          </div>

                          {app.candidate?.headline && (
                            <p className="text-xs text-slate-600 font-medium">
                              {app.candidate.headline}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                            {app.candidate?.email && (
                              <a
                                href={`mailto:${app.candidate.email}`}
                                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{app.candidate.email}</span>
                              </a>
                            )}
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Applied {formatDate(app.createdAt)}</span>
                            </span>
                          </div>
                        </div>

                        {/* Actions & Status Dropdown */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Manual Email Candidate (Gmail compose / mailto) Button */}
                          {app.candidate?.email && (
                            <a
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                app.candidate.email
                              )}&su=${encodeURIComponent(
                                `Regarding your application for ${app.jobTitle || 'our open position'} at ${
                                  app.jobCompany || 'HireHub'
                                }`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-gray-50 border border-gray-200 transition-colors shadow-2xs hover:border-gray-300 cursor-pointer"
                              title={`Direct email to ${app.candidate.name || 'candidate'} via Gmail / Mail Client`}
                            >
                              <Mail className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Email Candidate</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                            </a>
                          )}

                          {/* Resume Link Button */}
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View Resume</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>

                          {/* Cover Note Toggle Button */}
                          {noteText && (
                            <button
                              type="button"
                              onClick={() => toggleNote(app.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                            >
                              <span>Note</span>
                              {isNoteExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Status Selector Dropdown */}
                          <div className="relative">
                            <select
                              value={app.status}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleStatusChange(app.id, e.target.value as ApplicationStatus)
                              }
                              className={`px-3 py-2 pr-8 rounded-xl text-xs font-bold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                app.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : app.status === 'REVIEWED'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : app.status === 'ACCEPTED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="PENDING">Pending Review</option>
                              <option value="REVIEWED">Under Review</option>
                              <option value="ACCEPTED">Accept / Shortlist</option>
                              <option value="REJECTED">Reject / Not Selected</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Cover Note Content */}
                      {noteText && isNoteExpanded && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-gray-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed animate-in fade-in duration-150">
                          <span className="font-bold text-slate-900 block mb-1">
                            Applicant&apos;s Cover Note:
                          </span>
                          {noteText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;

