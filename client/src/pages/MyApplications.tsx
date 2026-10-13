import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import type { Application, ApplicationStatus } from '../types/application';
import {
  Briefcase,
  Building2,
  ExternalLink,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const MyApplications: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  // Route protection: Candidate only
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true, state: { from: '/my-applications' } });
      } else if (user?.role !== 'CANDIDATE') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchApplications = async () => {
      try {
        const response = await api.get<Application[]>('/applications/my');
        if (!active) return;
        setApplications(response.data);
        setErrorMessage(null);
      } catch {
        if (!active) return;
        setErrorMessage('Failed to load your applications. Please try again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (isAuthenticated && user?.role === 'CANDIDATE') {
      void fetchApplications();
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

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Review
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Under Review
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Not Selected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Applications
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track the progress of your submitted job applications and recruiter reviews.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-sm"
          >
            <span>Browse More Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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

        {/* Official Notifications Trust Notice */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border border-indigo-100/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-slate-900">
                  Official Status Notifications
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified System Dispatch
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Application decisions (Reviewed, Accepted, or Rejected) are sent directly to your email inbox from{' '}
                <a
                  href="mailto:chirehub@gmail.com"
                  className="font-mono font-medium text-indigo-600 hover:text-indigo-700 bg-white/80 px-1.5 py-0.5 rounded border border-indigo-200/60 inline-block transition-colors"
                >
                  chirehub@gmail.com
                </a>
                . Please ensure our address is added to your contacts or marked as safe so you never miss an interview update.
              </p>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded-md w-1/3" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-4 bg-gray-200 rounded-md w-1/4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && !errorMessage && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              You haven&apos;t applied to any jobs yet
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Discover opportunities that align with your background and submit 1-click applications.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-sm"
            >
              <span>Explore Open Positions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((app) => {
              const noteText = app.coverNote || app.notes;
              const isNoteExpanded = expandedNotes[app.id];

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                        <Building2 className="w-4 h-4" />
                        <span>{app.job?.company || 'Company'}</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {app.job?.title || 'Position'}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        {app.job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {app.job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Applied on {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div>{getStatusBadge(app.status)}</div>
                    </div>
                  </div>

                  {/* Submission Links & Details */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Submitted Resume</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>

                      {noteText && (
                        <button
                          type="button"
                          onClick={() => toggleNote(app.id)}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium py-1 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <span>Cover Note</span>
                          {isNoteExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Application ID: <span className="font-mono">{app.id.slice(0, 8)}...</span>
                    </span>
                  </div>

                  {/* Expandable Cover Note */}
                  {noteText && isNoteExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-gray-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed animate-in fade-in duration-150">
                      <div className="font-bold text-slate-900 mb-1">Your Note to Recruiter:</div>
                      {noteText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;

